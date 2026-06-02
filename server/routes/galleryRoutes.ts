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
      getIO().emit('gallery_update');
      res.status(200).json({ success: true, message: 'Deleted successfully' });
    } else {
      const db = getFallbackDb();
      if (db.gallery) {
        db.gallery = db.gallery.filter(g => g.id !== id);
        saveFallbackDb(db);
          }
      getIO().emit('gallery_update');
      res.status(200).json({ success: true, message: 'Deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update gallery image
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { title, category, spanClasses, imageUrl } = req.body;
    const { mode } = getDbStatus();
    if (mode === 'mongodb') {
      const { GalleryImageModel: GalleryImage } = await import('../models/GalleryImage');
      const item = await GalleryImage.findByIdAndUpdate(req.params.id, { title, category, spanClasses, imageUrl }, { new: true });
      if (!item) return res.status(404).json({ success: false, message: 'Not found' });
      getIO().emit('gallery_update');
      res.status(200).json({ success: true, data: item });
    } else {
      const db = getFallbackDb();
      const idx = db.gallery?.findIndex(g => g.id === req.params.id);
      if (idx !== undefined && idx !== -1 && db.gallery) {
        db.gallery[idx] = { ...db.gallery[idx], title, category, spanClasses, imageUrl };
        saveFallbackDb(db);
        getIO().emit('gallery_update');
        res.status(200).json({ success: true, data: db.gallery[idx] });
      } else {
        res.status(404).json({ success: false, message: 'Not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating gallery' });
  }
});

export default router;
