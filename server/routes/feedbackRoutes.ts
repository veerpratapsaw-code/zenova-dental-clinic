import express from 'express';
import { getFallbackDb, saveFallbackDb, getDbStatus } from '../config/db';
import { getIO } from '../socket';

const router = express.Router();

// Get approved feedbacks
router.get('/', async (req, res) => {
  try {
    const { mode } = getDbStatus();
    let data;
    if (mode === 'mongodb') {
      const { FeedbackModel: Feedback } = await import('../models/Feedback');
      const docs = await Feedback.find({ isApproved: true }).sort({ order: 1, createdAt: -1 });
      data = docs.map((doc: any) => {
        const obj = doc.toJSON();
        obj.id = doc.id;
        return obj;
      });
    } else {
      const db = getFallbackDb();
      data = (db.feedbacks || []).filter(f => f.isApproved);
      data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Submit a new feedback
router.post('/', async (req, res) => {
  try {
    const { author, quote, rating, treatmentRecieved, avatarUrl } = req.body;
    
    // Validate
    if (!author || !quote || !rating || !treatmentRecieved) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const { mode } = getDbStatus();
    if (mode === 'mongodb') {
      const { FeedbackModel: Feedback } = await import('../models/Feedback');
      const feedback = new Feedback({
        author,
        quote,
        rating,
        treatmentRecieved,
        isApproved: false, // Requires admin approval
        ...(avatarUrl && { avatarUrl })
      });
      await feedback.save();
      getIO().emit('feedback_update');
      res.status(201).json({ success: true, data: feedback });
    } else {
      const db = getFallbackDb();
      const newFeedback = {
        id: Date.now().toString(),
        author,
        quote,
        rating,
        treatmentRecieved,
        isApproved: false,
        avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop',
        createdAt: new Date().toISOString()
      };
      if (!db.feedbacks) db.feedbacks = [];
      db.feedbacks.push(newFeedback);
      saveFallbackDb(db);
      getIO().emit('feedback_update');
      res.status(201).json({ success: true, data: newFeedback });
    }
  } catch (error) {
    console.error('Feedback creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit feedback' });
  }
});

export default router;
