import express from 'express';
import { getFallbackDb, saveFallbackDb, getDbStatus } from '../config/db';
import { getIO } from '../socket';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

// Get all gallery images
router.get('/', async (req, res) => {
  try {
    const { mode } = getDbStatus();
    let data;
    if (mode === 'mongodb') {
      const { GalleryImageModel: GalleryImage } = await import('../models/GalleryImage');
      const docs = await GalleryImage.find();
      data = docs.map((doc: any) => {
        const obj = doc.toJSON();
        obj.id = doc.id;
        return obj;
      });
    } else {
      const db = getFallbackDb();
      data = db.gallery || [];
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add a new gallery image
router.post('/', requireAuth, async (req, res) => {
  try {
    const galleryData = req.body;
    const { mode } = getDbStatus();
    
    if (mode === 'mongodb') {
      const { GalleryImageModel: GalleryImage } = await import('../models/GalleryImage');
      const image = new GalleryImage(galleryData);
      await image.save();
    } else {
      const db = getFallbackDb();
      const newImage = {
        id: Date.now().toString(),
        ...galleryData,
        createdAt: new Date().toISOString()
      };
      if (!db.gallery) db.gallery = [];
      db.gallery.push(newImage);
      saveFallbackDb(db);
    }
    
    getIO().emit('gallery_update');
    res.status(201).json({ success: true, message: 'Gallery image added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add gallery image' });
  }
});

// Delete a gallery image
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { mode } = getDbStatus();
    
    if (mode === 'mongodb') {
      const { GalleryImageModel: GalleryImage } = await import('../models/GalleryImage');
      await GalleryImage.findByIdAndDelete(id);
    } else {
      const db = getFallbackDb();
      if (db.gallery) {
        db.gallery = db.gallery.filter(g => g.id !== id);
        saveFallbackDb(db);
      }
    }
    
    getIO().emit('gallery_update');
    res.status(200).json({ success: true, message: 'Gallery image deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete gallery image' });
  }
});

export default router;
