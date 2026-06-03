import dotenv from 'dotenv';
// Load environment variables from .env file immediately
dotenv.config();

import express from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
// import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import http from 'http';
import { initSocket } from './server/socket';
// Internal backend imports
import { connectDB } from './server/config/db';
import appointmentRoutes from './server/routes/appointmentRoutes';
import contactRoutes from './server/routes/contactRoutes';
import authRoutes from './server/routes/authRoutes';
import adminRoutes from './server/routes/adminRoutes';
import chatRoutes from './server/routes/chatRoutes';
import patientAuthRoutes from './server/routes/patientAuthRoutes';
import blogRoutes from './server/routes/blogRoutes';
import feedbackRoutes from './server/routes/feedbackRoutes';
import doctorRoutes from './server/routes/doctorRoutes';
import galleryRoutes from './server/routes/galleryRoutes';

// Resolve directory names for ES module scope (Removed due to CJS build crash, unused)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Enable trust proxy so express-rate-limit can read real IP from Cloud Run reverse proxy
app.set('trust proxy', true);

// Setup essential security middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disable default CSP to allow Vite preview iframes to render correctly
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Setup rate-limiting to defend API routes against spamming and empty submissions
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per 15 minutes to prevent blocking during active testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests captured from this IP address block. Please try again in 15 minutes.'
  }
});

// Apply rate limiter specifically to appointment and contact post portals
app.use('/api/', apiRateLimiter);

// -------------------------------------------------------------------------
// BACKEND ROUTING INTEGRATIONS
// -------------------------------------------------------------------------

// Connect and mount clinical API routes
app.use('/api', appointmentRoutes);
app.use('/api', contactRoutes);
app.use('/api', chatRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/feedback', feedbackRoutes);

// Auth and Admin Dashboard routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/doctors', doctorRoutes);
app.use('/api/admin/gallery', galleryRoutes);
app.use('/api/patient', patientAuthRoutes);

import { getDbStatus, getFallbackDb } from './server/config/db';

app.get('/api/settings', async (req, res) => {
  try {
    const { mode } = getDbStatus();
    let data;
    if (mode === 'mongodb') {
      const { SettingsModel: Settings } = await import('./server/models/Settings');
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create({ priorityPrice: 1000, emergencyPrice: 3500 });
      }
      data = settings.toJSON();
      data.id = settings.id;
    } else {
      const db = getFallbackDb();
      data = db.settings || { priorityPrice: 1000, emergencyPrice: 3500 };
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching settings' });
  }
});

app.put('/api/settings/hero-stats', async (req, res) => {
  try {
    const { heroStats } = req.body;
    const { mode } = getDbStatus();
    
    if (mode === 'mongodb') {
      const { SettingsModel: Settings } = await import('./server/models/Settings');
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create({ priorityPrice: 1000, emergencyPrice: 3500, heroStats });
      } else {
        settings.heroStats = heroStats;
        await settings.save();
      }
    } else {
      const db = getFallbackDb();
      if (!db.settings) db.settings = { priorityPrice: 1000, emergencyPrice: 3500 };
      db.settings.heroStats = heroStats;
      const { saveFallbackDb } = await import('./server/config/db');
      saveFallbackDb(db);
    }
    
    const { getIO } = await import('./server/socket');
    getIO().emit('settings_update');
    
    res.status(200).json({ success: true, message: 'Hero stats updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating hero stats' });
  }
});

app.get('/api/services', async (req, res) => {
  try {
    const { mode } = getDbStatus();
    let data;
    if (mode === 'mongodb') {
      const { ServiceModel: Service } = await import('./server/models/Service');
      const docs = await Service.find().sort({ order: 1 });
      if (docs.length === 0) {
        // Seed default services if empty
        const initialServices = [
          {
            title: 'Dental Implants',
            description: 'Biomimetic titanium-grade restorations engineered to match biological bone structures for look, durability, and function.',
            iconName: 'Anchor',
            details: ['Pure surgical-grade titanium structures', 'Advanced computer-guided placements', 'Custom ceramic crowns with natural optical dispersion', 'High bone-merging stability rate (99.2%)'],
            duration: '60 - 90 mins (Per Implant)',
            avgCost: '$1,800 - $3,500',
            order: 1
          },
          {
            title: 'Root Canal',
            description: 'Microscopic and pain-free endodontics designed to purge infection, secure biological structures, and restore complete health.',
            iconName: 'Stethoscope',
            details: ['Advanced high-magnification surgical micro-lenses', 'Ultra-precise sonic irrigation disinfection', 'Silent thermal thermoplastic fillings', 'Virtually zero discomfort with state-of-the-art anesthesia'],
            duration: '45 - 60 mins',
            avgCost: '$750 - $1,200',
            order: 2
          },
          {
            title: 'Teeth Whitening',
            description: 'Futuristic smart-laser light treatment designed to gently lift active stains without creating enamel, tissue, or nerve sensitivity.',
            iconName: 'Sparkles',
            details: ['Therapeutic laser light accelerated formula', 'Personalized protective gingival barriers', 'Gains up to 8-10 natural shades in single session', 'Reinforced with calcium desensitizing minerals'],
            duration: '45 mins',
            avgCost: '$299 - $499',
            order: 3
          },
          {
            title: 'Smile Makeover',
            description: 'A completely customized cosmetic design tailored geometrically to your facial contours, lips, and natural speech flow.',
            iconName: 'Smile',
            details: ['Complete digital smile design (DSD) modeling simulation', 'Handcrafted porcelain thin-core veneers', 'Bespoke laser crown lengthening for high-lip lines', 'Pre-visualized 3D mockup trials before physical bonding'],
            duration: 'Multiple sessions',
            avgCost: 'Custom Plan',
            order: 4
          },
          {
            title: 'Invisalign Orthodontics',
            description: 'SmartTrack polyurethane orthodontic aligners that gently slide teeth into alignment without noticeable metal components.',
            iconName: 'Sparkle',
            details: ['Iterative digital 3D scans - no messy putty', 'Ultra thin, crystal clear, food-friendly removable wear', 'Bi-weekly gradual structural guidance cycles', 'Integrated SmartForce attachments for difficult shifts'],
            duration: 'Visit every 4-6 weeks',
            avgCost: '$3,200 - $5,800',
            order: 5
          },
          {
            title: 'Cosmetic Dentistry',
            description: 'Expert ceramic bonding, custom micro-contouring, and aesthetic enamel scuplting designed to perfect small visual discrepancies.',
            iconName: 'Gem',
            details: ['Minimally invasive composite cosmetic veneers', 'Painless laser-guided structural tissue contouring', 'Micro-abrasion treatment for enamel color spots', 'Immediate same-day physical smile modifications'],
            duration: '30 - 60 mins',
            avgCost: '$150 - $600',
            order: 6
          }
        ];
        await Service.insertMany(initialServices);
        const seededDocs = await Service.find().sort({ order: 1 });
        data = seededDocs.map((doc: any) => { const obj = doc.toJSON(); obj.id = doc.id; return obj; });
      } else {
        data = docs.map((doc: any) => { const obj = doc.toJSON(); obj.id = doc.id; return obj; });
      }
    } else {
      const db = getFallbackDb();
      if (!db.services || db.services.length === 0) {
        // Initialize default static services in fallback mode
        db.services = [
          { id: '1', title: 'Dental Implants', description: 'Biomimetic titanium-grade restorations engineered to match biological bone structures for look, durability, and function.', iconName: 'Anchor', details: ['Pure surgical-grade titanium structures', 'Advanced computer-guided placements', 'Custom ceramic crowns with natural optical dispersion', 'High bone-merging stability rate (99.2%)'], duration: '60 - 90 mins (Per Implant)', avgCost: '$1,800 - $3,500', order: 1 },
          { id: '2', title: 'Root Canal', description: 'Microscopic and pain-free endodontics designed to purge infection, secure biological structures, and restore complete health.', iconName: 'Stethoscope', details: ['Advanced high-magnification surgical micro-lenses', 'Ultra-precise sonic irrigation disinfection', 'Silent thermal thermoplastic fillings', 'Virtually zero discomfort with state-of-the-art anesthesia'], duration: '45 - 60 mins', avgCost: '$750 - $1,200', order: 2 },
          { id: '3', title: 'Teeth Whitening', description: 'Futuristic smart-laser light treatment designed to gently lift active stains without creating enamel, tissue, or nerve sensitivity.', iconName: 'Sparkles', details: ['Therapeutic laser light accelerated formula', 'Personalized protective gingival barriers', 'Gains up to 8-10 natural shades in single session', 'Reinforced with calcium desensitizing minerals'], duration: '45 mins', avgCost: '$299 - $499', order: 3 },
          { id: '4', title: 'Smile Makeover', description: 'A completely customized cosmetic design tailored geometrically to your facial contours, lips, and natural speech flow.', iconName: 'Smile', details: ['Complete digital smile design (DSD) modeling simulation', 'Handcrafted porcelain thin-core veneers', 'Bespoke laser crown lengthening for high-lip lines', 'Pre-visualized 3D mockup trials before physical bonding'], duration: 'Multiple sessions', avgCost: 'Custom Plan', order: 4 },
          { id: '5', title: 'Invisalign Orthodontics', description: 'SmartTrack polyurethane orthodontic aligners that gently slide teeth into alignment without noticeable metal components.', iconName: 'Sparkle', details: ['Iterative digital 3D scans - no messy putty', 'Ultra thin, crystal clear, food-friendly removable wear', 'Bi-weekly gradual structural guidance cycles', 'Integrated SmartForce attachments for difficult shifts'], duration: 'Visit every 4-6 weeks', avgCost: '$3,200 - $5,800', order: 5 },
          { id: '6', title: 'Cosmetic Dentistry', description: 'Expert ceramic bonding, custom micro-contouring, and aesthetic enamel scuplting designed to perfect small visual discrepancies.', iconName: 'Gem', details: ['Minimally invasive composite cosmetic veneers', 'Painless laser-guided structural tissue contouring', 'Micro-abrasion treatment for enamel color spots', 'Immediate same-day physical smile modifications'], duration: '30 - 60 mins', avgCost: '$150 - $600', order: 6 }
        ];
        const { saveFallbackDb } = await import('./server/config/db');
        saveFallbackDb(db);
      }
      data = db.services;
      data.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    }
    
    res.status(200).json({
      success: true,
      message: 'Dental service structures listed successfully',
      data: data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching services' });
  }
});

// Health Probe Check endpoint for external cloud diagnostics
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Gemini Transit Estimate
app.post('/api/transit-estimate', async (req, res) => {
  try {
    const { startAddr } = req.body;
    if (!startAddr) return res.status(400).json({ success: false, message: 'Start address is required' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      // Fallback
      const estimatedMinutes = Math.max(12, Math.floor(Math.random() * 25 + 10));
      return res.status(200).json({ success: true, time: `${estimatedMinutes} mins`, distance: "Unknown" });
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Estimate the driving distance and travel time from "${startAddr}" to "CityCenterDC, Washington, DC". 
Return the result STRICTLY as a JSON object with this exact structure, no markdown, no backticks:
{
  "time": "e.g., 15 mins",
  "distance": "e.g., 4 km"
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
    console.error('Transit Estimate Error:', error);
    // Instead of random fallback, return the actual error if it's a quota issue or API error
    if (error?.status === 429 || (error?.message && error.message.includes('Quota'))) {
      res.status(429).json({ success: false, message: "AI API Quota Exceeded. Please try again later." });
    } else {
      res.status(500).json({ success: false, message: "AI estimation failed. Please try again." });
    }
  }
});

// -------------------------------------------------------------------------
// SERVER INITIALIZATION & FRONTEND STATIC MOUNTING
// -------------------------------------------------------------------------

async function startServer() {
  // First, fire MongoDB database connector (operates with runtime file fallbacks if absent)
  await connectDB();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  // If in Development environment, mount Vite middleware to parse React SPA code live
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('[NODE ENVIRONMENT: DEVELOPMENT] Successfully mounted live Vite server.');
  } else {
    // If in Production, serve static pre-compiled React distribution directory
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`[NODE ENVIRONMENT: PRODUCTION] Active asset route set to: ${distPath}`);
  }

  // Bind server container to port 3000 to coordinate with Cloud ingress routing
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log('\n=============================================================');
    console.log(`🚀 ZENOVA CLINICS SECURE ENGINE BOOTED & RUNNING SUCCESSFULLY!`);
    console.log(`👉 Primary Endpoint: http://localhost:${PORT}`);
    console.log('=============================================================\n');
  });
}

startServer();
