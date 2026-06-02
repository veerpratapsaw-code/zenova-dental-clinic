import express from 'express';
import { getFallbackDb } from '../config/db';
import { getDbStatus } from '../config/db';
import { BlogModel as Blog } from '../models/Blog';

const router = express.Router();

// Get all blogs
router.get('/', async (req, res) => {
  try {
    const { mode } = getDbStatus();
    let data;
    if (mode === 'mongodb') {
      const docs = await Blog.find().sort({ order: 1, createdAt: -1 });
      data = docs.map(doc => {
        const obj = doc.toJSON();
        obj.id = doc.id;
        return obj;
      });
    } else {
      const db = getFallbackDb();
      data = db.blogs || [];
      data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching blogs' });
  }
});

// Get blog by slug
router.get('/:slug', async (req, res) => {
  try {
    const { mode } = getDbStatus();
    let post;
    if (mode === 'mongodb') {
      const doc = await Blog.findOne({ slug: req.params.slug });
      if (doc) {
        post = doc.toJSON();
        post.id = doc.id;
      }
    } else {
      const db = getFallbackDb();
      post = (db.blogs || []).find(b => b.slug === req.params.slug);
    }
    
    if (!post) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }
    
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching blog post' });
  }
});

export default router;
