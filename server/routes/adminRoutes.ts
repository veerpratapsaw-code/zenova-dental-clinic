import express from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { getFallbackDb, saveFallbackDb, getDbStatus } from '../config/db';
import { sendStatusUpdateEmail } from '../config/notifications';
import { AppointmentModel as Appointment } from '../models/Appointment';
import { getIO } from '../socket';

const router = express.Router();

// Get all appointments
router.get('/appointments', requireAuth, async (req, res) => {
  try {
    const { mode } = getDbStatus();
    let data;
    if (mode === 'mongodb') {
      const docs = await Appointment.find();
      data = docs.map(doc => {
        const obj = doc.toJSON();
        obj.id = doc.id;
        return obj;
      });
    } else {
      const db = getFallbackDb();
      data = db.appointments || [];
    }

    const priorityWeight: Record<string, number> = {
      'emergency': 3,
      'priority': 2,
      'standard': 1
    };

    data.sort((a: any, b: any) => {
      const weightA = priorityWeight[a.priorityLevel || 'standard'] || 1;
      const weightB = priorityWeight[b.priorityLevel || 'standard'] || 1;
      
      if (weightA !== weightB) {
        return weightB - weightA; // Higher priority comes first
      }
      
      // If priority is the same, older requests come first (Queue FIFO)
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeA - timeB;
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching appointments' });
  }
});

// Update appointment status
router.put('/appointments/:id', requireAuth, async (req, res) => {
  try {
    const { status, assignedTime, adminNotes } = req.body;
    const { mode } = getDbStatus();
    if (mode === 'mongodb') {
      const apt = await Appointment.findByIdAndUpdate(
        req.params.id, 
        { status, assignedTime, adminNotes }, 
        { new: true }
      );
      if (!apt) return res.status(404).json({ success: false, message: 'Not found' });
      await sendStatusUpdateEmail(apt.email, apt.name, status, apt.preferredDate);
      getIO().emit('update_appointment', apt);
      res.status(200).json({ success: true, data: apt });
    } else {
      const db = getFallbackDb();
      const idx = db.appointments?.findIndex(a => a.id === req.params.id);
      if (idx !== undefined && idx !== -1 && db.appointments) {
        db.appointments[idx].status = status;
        if (assignedTime !== undefined) db.appointments[idx].assignedTime = assignedTime;
        if (adminNotes !== undefined) db.appointments[idx].adminNotes = adminNotes;
        saveFallbackDb(db);
        const apt = db.appointments[idx];
        await sendStatusUpdateEmail(apt.email, apt.name, status, apt.preferredDate);
        getIO().emit('update_appointment', apt);
        res.status(200).json({ success: true, data: apt });
      } else {
        res.status(404).json({ success: false, message: 'Not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating appointment' });
  }
});

// Delete appointment
router.delete('/appointments/:id', requireAuth, async (req, res) => {
  try {
    const { mode } = getDbStatus();
    if (mode === 'mongodb') {
      const apt = await Appointment.findByIdAndDelete(req.params.id);
      if (!apt) return res.status(404).json({ success: false, message: 'Not found' });
      getIO().emit('delete_appointment', req.params.id);
      res.status(200).json({ success: true, message: 'Deleted successfully' });
    } else {
      const db = getFallbackDb();
      const idx = db.appointments?.findIndex(a => a.id === req.params.id);
      if (idx !== undefined && idx !== -1 && db.appointments) {
        db.appointments.splice(idx, 1);
        saveFallbackDb(db);
        getIO().emit('delete_appointment', req.params.id);
        res.status(200).json({ success: true, message: 'Deleted successfully' });
      } else {
        res.status(404).json({ success: false, message: 'Not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting appointment' });
  }
});

// AI Suggest Time for Appointment
router.post('/appointments/suggest-time', requireAuth, async (req, res) => {
  try {
    const { treatmentType, preferredDate } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      // Fallback if no real API key
      return res.status(200).json({ 
        success: true, 
        suggestedTime: "10:30", 
        reasoning: "Based on standard clinic hours, 10:30 AM is a standard slot. Please configure Gemini API key for intelligent scheduling." 
      });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `You are an AI scheduling assistant for For Your Dentist.
A patient has requested an appointment on ${preferredDate} for the following treatment: "${treatmentType}".

Based on standard dental clinic operations:
1. Estimate how long this treatment usually takes.
2. Suggest an optimal starting time between 09:00 and 17:00.
3. Provide a very brief (1 sentence) reasoning.

Return the result STRICTLY as a JSON object with this exact structure, no markdown, no backticks:
{
  "suggestedTime": "HH:MM",
  "reasoning": "string"
}`;

    let response;
    let attempt = 0;
    const maxRetries = 3;

    while (attempt < maxRetries) {
      try {
        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.2 }
        });
        break;
      } catch (error: any) {
        attempt++;
        if (attempt >= maxRetries || !(error.message?.includes('429') || error.message?.includes('Too Many Requests') || error.status === 429)) {
          throw error;
        }
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.warn(`[Gemini API] Rate limit hit in suggest-time. Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    if (!response) throw new Error("Failed to get response from AI");

    let rawText = response.text.trim();
    if (rawText.startsWith('\`\`\`json')) rawText = rawText.replace(/\`\`\`json/g, '');
    if (rawText.startsWith('\`\`\`')) rawText = rawText.replace(/\`\`\`/g, '');
    
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse JSON from AI");
    
    const result = JSON.parse(jsonMatch[0]);

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('AI Time Suggestion Error:', error);
    res.status(500).json({ success: false, message: 'Failed to suggest time' });
  }
});

// Get all inquiries
router.get('/inquiries', requireAuth, async (req, res) => {
  try {
    const { mode } = getDbStatus();
    let data;
    if (mode === 'mongodb') {
      // Need Contact model
      const { ContactModel: Contact } = await import('../models/Contact');
      const docs = await Contact.find().sort({ createdAt: -1 });
      data = docs.map((doc: any) => {
        const obj = doc.toJSON();
        obj.id = doc.id;
        return obj;
      });
    } else {
      const db = getFallbackDb();
      data = db.inquiries || [];
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching inquiries' });
  }
});

// Delete inquiry
router.delete('/inquiries/:id', requireAuth, async (req, res) => {
  try {
    const { mode } = getDbStatus();
    if (mode === 'mongodb') {
      const { ContactModel: Contact } = await import('../models/Contact');
      const contact = await Contact.findByIdAndDelete(req.params.id);
      if (!contact) return res.status(404).json({ success: false, message: 'Not found' });
      getIO().emit('delete_inquiry', req.params.id);
      res.status(200).json({ success: true, message: 'Deleted successfully' });
    } else {
      const db = getFallbackDb();
      const idx = db.inquiries?.findIndex(i => i.id === req.params.id);
      if (idx !== undefined && idx !== -1 && db.inquiries) {
        db.inquiries.splice(idx, 1);
        saveFallbackDb(db);
        getIO().emit('delete_inquiry', req.params.id);
        res.status(200).json({ success: true, message: 'Deleted successfully' });
      } else {
        res.status(404).json({ success: false, message: 'Not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting inquiry' });
  }
});

// AI Reply Drafter
router.post('/inquiries/:id/draft', requireAuth, async (req, res) => {
  try {
    const { inquiryText } = req.body;
    if (!inquiryText) return res.status(400).json({ success: false, message: 'Inquiry text is required' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(200).json({ success: true, draft: "Hello,\n\nThank you for reaching out to For Your Dentist. We have received your inquiry: '" + inquiryText + "'.\n\n[Mock AI Draft - Please configure Gemini API Key]\n\nBest regards,\nFor Your Dentist Team" });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `You are a professional dental receptionist at For Your Dentist. 
Write a highly empathetic, professional, and helpful email reply to the following patient inquiry. 
Keep it concise but warm. End with "Best regards, The For Your Dentist Team".
Do not use placeholders like [Your Name].

Patient Inquiry: "${inquiryText}"`;

    let response;
    let attempt = 0;
    const maxRetries = 3;

    while (attempt < maxRetries) {
      try {
        response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.6 }
        });
        break;
      } catch (error: any) {
        attempt++;
        if (attempt >= maxRetries || !(error.message?.includes('429') || error.message?.includes('Too Many Requests') || error.status === 429)) {
          throw error;
        }
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.warn(`[Gemini API] Rate limit hit in draft. Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    if (!response) throw new Error("Failed to get response from AI");

    res.status(200).json({ success: true, draft: response.text });
  } catch (error) {
    console.error('AI Draft Error:', error);
    res.status(500).json({ success: false, message: 'Failed to draft reply' });
  }
});

// Send Email Reply
router.post('/inquiries/:id/reply', requireAuth, async (req, res) => {
  try {
    const { email, message, replyText } = req.body;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return res.status(400).json({ success: false, message: 'RESEND_API_KEY is not configured.' });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
          <div style="background-color: #3b82f6; padding: 30px 20px; color: white; text-align: center;">
            <h1 style="margin: 0; font-size: 20px; font-weight: bold;">Reply from For Your Dentist</h1>
          </div>
          <div style="padding: 30px;">
            <p style="color: #475569; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${replyText}</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px dashed #e2e8f0; background: #f8fafc; padding: 15px; border-radius: 8px;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">Original Inquiry:</p>
              <p style="color: #64748b; font-size: 13px; font-style: italic; margin-top: 5px;">"${message}"</p>
            </div>
          </div>
        </div>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'For Your Dentist Support <onboarding@resend.dev>',
        to: [email],
        subject: 'Re: Your Inquiry with For Your Dentist',
        html: htmlContent,
      }),
    });

    if (!response.ok) throw new Error('Resend API failed');

    res.status(200).json({ success: true, message: 'Reply sent successfully!' });
  } catch (error) {
    console.error('Email Reply Error:', error);
    res.status(500).json({ success: false, message: 'Failed to send email reply' });
  }
});

// Create Blog Post
router.post('/blogs', requireAuth, async (req, res) => {
  try {
    const { title, slug, excerpt, content, category, readTime, imageUrl, author } = req.body;
    
    // Process base64 image if it's not a standard URL and ImgBB is configured
    let finalImageUrl = imageUrl;
    if (imageUrl && imageUrl.startsWith('data:image') && process.env.IMGBB_API_KEY) {
      try {
        const base64Data = imageUrl.split(',')[1];
        const formData = new URLSearchParams();
        formData.append('image', base64Data);
        
        const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, {
          method: 'POST',
          body: formData
        });
        
        const imgData = await imgRes.json();
        if (imgData.success) {
          finalImageUrl = imgData.data.url;
        }
      } catch (e) {
        console.error('ImgBB upload failed', e);
      }
    }

    const { mode } = getDbStatus();
    if (mode === 'mongodb') {
      const { BlogModel: Blog } = await import('../models/Blog');
      const blog = new Blog({ title, slug, excerpt, content, category, readTime, imageUrl: finalImageUrl, author, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) });
      await blog.save();
      getIO().emit('blog_update');
      res.status(201).json({ success: true, data: blog });
    } else {
      const db = getFallbackDb();
      const newBlog = {
        id: Date.now().toString(),
        title, slug, excerpt, content, category, readTime, imageUrl: finalImageUrl, author,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        createdAt: new Date().toISOString()
      };
      if (!db.blogs) db.blogs = [];
      db.blogs.push(newBlog);
      saveFallbackDb(db);
      getIO().emit('blog_update');
      res.status(201).json({ success: true, data: newBlog });
    }
  } catch (error) {
    console.error('Blog creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create blog' });
  }
});

// Delete Blog Post
router.delete('/blogs/:id', requireAuth, async (req, res) => {
  try {
    const { mode } = getDbStatus();
    if (mode === 'mongodb') {
      const { BlogModel: Blog } = await import('../models/Blog');
      await Blog.findByIdAndDelete(req.params.id);
      getIO().emit('blog_update');
      res.status(200).json({ success: true });
    } else {
      const db = getFallbackDb();
      if (db.blogs) {
        db.blogs = db.blogs.filter(b => b.id !== req.params.id);
        saveFallbackDb(db);
      }
      getIO().emit('blog_update');
      res.status(200).json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete blog' });
  }
});

// Update Blog Post
router.put('/blogs/:id', requireAuth, async (req, res) => {
  try {
    const { title, slug, excerpt, content, category, readTime, imageUrl, author } = req.body;
    let finalImageUrl = imageUrl;
    if (imageUrl && imageUrl.startsWith('data:image') && process.env.IMGBB_API_KEY) {
      try {
        const base64Data = imageUrl.split(',')[1];
        const formData = new URLSearchParams();
        formData.append('image', base64Data);
        const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, { method: 'POST', body: formData });
        const imgData = await imgRes.json();
        if (imgData.success) finalImageUrl = imgData.data.url;
      } catch (e) {}
    }

    const { mode } = getDbStatus();
    if (mode === 'mongodb') {
      const { BlogModel: Blog } = await import('../models/Blog');
      const blog = await Blog.findByIdAndUpdate(req.params.id, { title, slug, excerpt, content, category, readTime, imageUrl: finalImageUrl, author }, { new: true });
      if (!blog) return res.status(404).json({ success: false, message: 'Not found' });
      getIO().emit('blog_update');
      res.status(200).json({ success: true, data: blog });
    } else {
      const db = getFallbackDb();
      const idx = db.blogs?.findIndex(b => b.id === req.params.id);
      if (idx !== undefined && idx !== -1 && db.blogs) {
        db.blogs[idx] = { ...db.blogs[idx], title, slug, excerpt, content, category, readTime, imageUrl: finalImageUrl, author };
        saveFallbackDb(db);
        getIO().emit('blog_update');
        res.status(200).json({ success: true, data: db.blogs[idx] });
      } else {
        res.status(404).json({ success: false, message: 'Not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update blog' });
  }
});

// Get all feedbacks
router.get('/feedbacks', requireAuth, async (req, res) => {
  try {
    const { mode } = getDbStatus();
    let data;
    if (mode === 'mongodb') {
      const { FeedbackModel: Feedback } = await import('../models/Feedback');
      const docs = await Feedback.find().sort({ order: 1, createdAt: -1 });
      data = docs.map((doc: any) => {
        const obj = doc.toJSON();
        obj.id = doc.id;
        return obj;
      });
    } else {
      const db = getFallbackDb();
      data = db.feedbacks || [];
      data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching feedbacks' });
  }
});

// Toggle feedback approval
router.put('/feedbacks/:id/approve', requireAuth, async (req, res) => {
  try {
    const { isApproved } = req.body;
    const { mode } = getDbStatus();
    if (mode === 'mongodb') {
      const { FeedbackModel: Feedback } = await import('../models/Feedback');
      const feedback = await Feedback.findByIdAndUpdate(req.params.id, { isApproved }, { new: true });
      if (!feedback) return res.status(404).json({ success: false, message: 'Not found' });
      getIO().emit('feedback_update');
      res.status(200).json({ success: true, data: feedback });
    } else {
      const db = getFallbackDb();
      const idx = db.feedbacks?.findIndex(f => f.id === req.params.id);
      if (idx !== undefined && idx !== -1 && db.feedbacks) {
        db.feedbacks[idx].isApproved = isApproved;
        saveFallbackDb(db);
        getIO().emit('feedback_update');
        res.status(200).json({ success: true, data: db.feedbacks[idx] });
      } else {
        res.status(404).json({ success: false, message: 'Not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update feedback' });
  }
});

// Update feedback content
router.put('/feedbacks/:id', requireAuth, async (req, res) => {
  try {
    const { author, quote, rating, treatmentRecieved } = req.body;
    const { mode } = getDbStatus();
    if (mode === 'mongodb') {
      const { FeedbackModel: Feedback } = await import('../models/Feedback');
      const feedback = await Feedback.findByIdAndUpdate(req.params.id, { author, quote, rating, treatmentRecieved }, { new: true });
      if (!feedback) return res.status(404).json({ success: false, message: 'Not found' });
      getIO().emit('feedback_update');
      res.status(200).json({ success: true, data: feedback });
    } else {
      const db = getFallbackDb();
      const idx = db.feedbacks?.findIndex(f => f.id === req.params.id);
      if (idx !== undefined && idx !== -1 && db.feedbacks) {
        db.feedbacks[idx] = { ...db.feedbacks[idx], author, quote, rating, treatmentRecieved };
        saveFallbackDb(db);
        getIO().emit('feedback_update');
        res.status(200).json({ success: true, data: db.feedbacks[idx] });
      } else {
        res.status(404).json({ success: false, message: 'Not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update feedback' });
  }
});

// Delete feedback
router.delete('/feedbacks/:id', requireAuth, async (req, res) => {
  try {
    const { mode } = getDbStatus();
    if (mode === 'mongodb') {
      const { FeedbackModel: Feedback } = await import('../models/Feedback');
      await Feedback.findByIdAndDelete(req.params.id);
      getIO().emit('feedback_update');
      res.status(200).json({ success: true });
    } else {
      const db = getFallbackDb();
      if (db.feedbacks) {
        db.feedbacks = db.feedbacks.filter(f => f.id !== req.params.id);
        saveFallbackDb(db);
      }
      getIO().emit('feedback_update');
      res.status(200).json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete feedback' });
  }
});

// Add a Service
router.post('/services', requireAuth, async (req, res) => {
  try {
    const { title, description, iconName, details, duration, avgCost, order } = req.body;
    const { mode } = getDbStatus();
    if (mode === 'mongodb') {
      const { ServiceModel: Service } = await import('../models/Service');
      const service = await Service.create({ title, description, iconName, details, duration, avgCost, order });
      const data = service.toJSON();
      data.id = service.id;
      res.status(201).json({ success: true, data });
    } else {
      const db = getFallbackDb();
      if (!db.services) db.services = [];
      const newService = { id: Date.now().toString(), title, description, iconName, details, duration, avgCost, order };
      db.services.push(newService);
      saveFallbackDb(db);
      res.status(201).json({ success: true, data: newService });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create service' });
  }
});

// Delete a Service
router.delete('/services/:id', requireAuth, async (req, res) => {
  try {
    const { mode } = getDbStatus();
    if (mode === 'mongodb') {
      const { ServiceModel: Service } = await import('../models/Service');
      await Service.findByIdAndDelete(req.params.id);
      res.status(200).json({ success: true });
    } else {
      const db = getFallbackDb();
      if (db.services) {
        db.services = db.services.filter(s => s.id !== req.params.id);
        saveFallbackDb(db);
      }
      res.status(200).json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete service' });
  }
});

router.put('/settings', requireAuth, async (req, res) => {
  try {
    const { priorityPrice, emergencyPrice, formFields, demoMode } = req.body;
    const { mode } = getDbStatus();
    if (mode === 'mongodb') {
      const { SettingsModel: Settings } = await import('../models/Settings');
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create({ priorityPrice, emergencyPrice, formFields, demoMode });
      } else {
        if (priorityPrice !== undefined) settings.priorityPrice = priorityPrice;
        if (emergencyPrice !== undefined) settings.emergencyPrice = emergencyPrice;
        if (formFields !== undefined) settings.formFields = formFields;
        if (demoMode !== undefined) settings.demoMode = demoMode;
        await settings.save();
      }
      const data = settings.toJSON();
      data.id = settings.id;
      getIO().emit('settings_update');
      res.status(200).json({ success: true, data });
    } else {
      const db = getFallbackDb();
      if (!db.settings) db.settings = { priorityPrice: 1000, emergencyPrice: 3500, demoMode: false, formFields: { requirePhone: true, requireDate: true, requireMessage: true } };
      if (priorityPrice !== undefined) db.settings.priorityPrice = priorityPrice;
      if (emergencyPrice !== undefined) db.settings.emergencyPrice = emergencyPrice;
      if (formFields !== undefined) db.settings.formFields = formFields;
      if (demoMode !== undefined) db.settings.demoMode = demoMode;
      saveFallbackDb(db);
      getIO().emit('settings_update');
      res.status(200).json({ success: true, data: db.settings });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
});

// Update service
router.put('/services/:id', requireAuth, async (req, res) => {
  try {
    const { title, description, iconName, details, duration, avgCost, order } = req.body;
    const { mode } = getDbStatus();
    if (mode === 'mongodb') {
      const { ServiceModel: Service } = await import('../models/Service');
      const item = await Service.findByIdAndUpdate(req.params.id, { title, description, iconName, details, duration, avgCost, order }, { new: true });
      if (!item) return res.status(404).json({ success: false, message: 'Not found' });
      getIO().emit('services_update');
      res.status(200).json({ success: true, data: item });
    } else {
      const db = getFallbackDb();
      const idx = db.services?.findIndex(s => s.id === req.params.id);
      if (idx !== undefined && idx !== -1 && db.services) {
        db.services[idx] = { ...db.services[idx], title, description, iconName, details, duration, avgCost, order };
        saveFallbackDb(db);
        getIO().emit('services_update');
        res.status(200).json({ success: true, data: db.services[idx] });
      } else {
        res.status(404).json({ success: false, message: 'Not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating service' });
  }
});// Reorder items
router.put('/reorder', requireAuth, async (req, res) => {
  try {
    const { type, items } = req.body;
    // type: 'gallery' | 'doctors' | 'services' | 'blogs' | 'feedbacks'
    // items: { id: string, order: number }[]
    if (!type || !items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      let Model: any;
      switch (type) {
        case 'gallery': Model = (await import('../models/GalleryImage')).GalleryImageModel; break;
        case 'doctors': Model = (await import('../models/Doctor')).DoctorModel; break;
        case 'services': Model = (await import('../models/Service')).ServiceModel; break;
        case 'blogs': Model = (await import('../models/Blog')).BlogModel; break;
        case 'feedbacks': Model = (await import('../models/Feedback')).FeedbackModel; break;
        default: return res.status(400).json({ success: false, message: 'Invalid type' });
      }

      await Promise.all(items.map((item: any) => 
        Model.findByIdAndUpdate(item.id, { order: item.order })
      ));
    } else {
      const db = getFallbackDb();
      let collection: any[];
      switch (type) {
        case 'gallery': collection = db.gallery || []; break;
        case 'doctors': collection = db.doctors || []; break;
        case 'services': collection = db.services || []; break;
        case 'blogs': collection = db.blogs || []; break;
        case 'feedbacks': collection = db.feedbacks || []; break;
        default: return res.status(400).json({ success: false, message: 'Invalid type' });
      }

      items.forEach((updateItem: any) => {
        const idx = collection.findIndex((el: any) => el.id === updateItem.id);
        if (idx !== -1) {
          collection[idx].order = updateItem.order;
        }
      });
      saveFallbackDb(db);
    }
    
    // Notify clients about the update
    getIO().emit(`${type}_update`);
    
    res.status(200).json({ success: true, message: 'Order updated' });
  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({ success: false, message: 'Failed to update order' });
  }
});

export default router;
