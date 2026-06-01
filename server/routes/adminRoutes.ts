import express from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { getFallbackDb, saveFallbackDb, getDbStatus } from '../config/db';
import { sendStatusUpdateEmail } from '../config/notifications';
import { AppointmentModel as Appointment } from '../models/Appointment';

const router = express.Router();

// Get all appointments
router.get('/appointments', requireAuth, async (req, res) => {
  try {
    const { mode } = getDbStatus();
    let data;
    if (mode === 'mongodb') {
      data = await Appointment.find();
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
        res.status(200).json({ success: true, data: apt });
      } else {
        res.status(404).json({ success: false, message: 'Not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating appointment' });
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
    
    const prompt = `You are an AI scheduling assistant for Zenova Dental Clinic.
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

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { temperature: 0.2 }
    });

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
      data = await Contact.find().sort({ createdAt: -1 });
    } else {
      const db = getFallbackDb();
      data = db.inquiries || [];
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching inquiries' });
  }
});

// AI Reply Drafter
router.post('/inquiries/:id/draft', requireAuth, async (req, res) => {
  try {
    const { inquiryText } = req.body;
    if (!inquiryText) return res.status(400).json({ success: false, message: 'Inquiry text is required' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(200).json({ success: true, draft: "Hello,\n\nThank you for reaching out to Zenova Dental Clinic. We have received your inquiry: '" + inquiryText + "'.\n\n[Mock AI Draft - Please configure Gemini API Key]\n\nBest regards,\nZenova Team" });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `You are a professional dental receptionist at Zenova Dental Clinic. 
Write a highly empathetic, professional, and helpful email reply to the following patient inquiry. 
Keep it concise but warm. End with "Best regards, The Zenova Team".
Do not use placeholders like [Your Name].

Patient Inquiry: "${inquiryText}"`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { temperature: 0.6 }
    });

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
            <h1 style="margin: 0; font-size: 20px; font-weight: bold;">Reply from Zenova Dental</h1>
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
        from: 'Zenova Support <onboarding@resend.dev>',
        to: [email],
        subject: 'Re: Your Inquiry with Zenova Dental',
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

export default router;
