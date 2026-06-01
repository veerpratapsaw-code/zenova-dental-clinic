import dotenv from 'dotenv';
// Load environment variables from .env file immediately
dotenv.config();

import express from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// Internal backend imports
import { connectDB } from './server/config/db';
import appointmentRoutes from './server/routes/appointmentRoutes';
import contactRoutes from './server/routes/contactRoutes';
import authRoutes from './server/routes/authRoutes';
import adminRoutes from './server/routes/adminRoutes';
import chatRoutes from './server/routes/chatRoutes';
import patientAuthRoutes from './server/routes/patientAuthRoutes';

// Resolve directory names for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Enable trust proxy so express-rate-limit can read real IP from Cloud Run reverse proxy
app.set('trust proxy', true);

// Setup essential security middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Disable default CSP to allow Vite preview iframes to render correctly
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());

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

// Auth and Admin Dashboard routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/patient', patientAuthRoutes);

// Support Services Metadata API (retained to feed clinical list components)
app.get('/api/services', (req, res) => {
  const services = [
    {
      id: 'implants',
      title: 'Dental Implants',
      description: 'Biomimetic titanium-grade restorations engineered to match biological bone structures for look, durability, and function.',
      iconName: 'Anchor',
      details: [
        'Pure surgical-grade titanium structures',
        'Advanced computer-guided guided placements',
        'Custom ceramic crowns with natural optical dispersion',
        'High bone-merging stability rate (99.2%)'
      ],
      duration: '60 - 90 mins (Per Implant)',
      avgCost: '$1,800 - $3,500'
    },
    {
      id: 'root-canal',
      title: 'Root Canal',
      description: 'Microscopic and pain-free endodontics designed to purge infection, secure biological structures, and restore complete health.',
      iconName: 'Stethoscope',
      details: [
        'Advanced high-magnification surgical micro-lenses',
        'Ultra-precise sonic irrigation disinfection',
        'Silent thermal thermoplastic fillings',
        'Virtually zero discomfort with state-of-the-art anesthesia'
      ],
      duration: '45 - 60 mins',
      avgCost: '$750 - $1,200'
    },
    {
      id: 'whitening',
      title: 'Teeth Whitening',
      description: 'Futuristic smart-laser light treatment designed to gently lift active stains without creating enamel, tissue, or nerve sensitivity.',
      iconName: 'Sparkles',
      details: [
        'Therapeutic laser light accelerated formula',
        'Personalized protective gingival barriers',
        'Gains up to 8-10 natural shades in single session',
        'Reinforced with calcium desensitizing minerals'
      ],
      duration: '45 mins',
      avgCost: '$299 - $499'
    },
    {
      id: 'makeover',
      title: 'Smile Makeover',
      description: 'A completely customized cosmetic design tailored geometrically to your facial contours, lips, and natural speech flow.',
      iconName: 'Smile',
      details: [
        'Complete digital smile design (DSD) modeling simulation',
        'Handcrafted porcelain thin-core veneers',
        'Bespoke laser crown lengthening for high-lip lines',
        'Pre-visualized 3D mockup trials before physical bonding'
      ],
      duration: 'Multiple sessions',
      avgCost: 'Custom Plan'
    },
    {
      id: 'invisalign',
      title: 'Invisalign Orthodontics',
      description: 'SmartTrack polyurethane orthodontic aligners that gently slide teeth into alignment without noticeable metal components.',
      iconName: 'Sparkle',
      details: [
        'Iterative digital 3D scans - no messy putty',
        'Ultra thin, crystal clear, food-friendly removable wear',
        'Bi-weekly gradual structural guidance cycles',
        'Integrated SmartForce attachments for difficult shifts'
      ],
      duration: 'Visit every 4-6 weeks',
      avgCost: '$3,200 - $5,800'
    },
    {
      id: 'cosmetic',
      title: 'Cosmetic Dentistry',
      description: 'Expert ceramic bonding, custom micro-contouring, and aesthetic enamel scuplting designed to perfect small visual discrepancies.',
      iconName: 'Gem',
      details: [
        'Minimally invasive composite cosmetic veneers',
        'Painless laser-guided structural tissue contouring',
        'Micro-abrasion treatment for enamel color spots',
        'Immediate same-day physical smile modifications'
      ],
      duration: '30 - 60 mins',
      avgCost: '$150 - $600'
    }
  ];

  res.status(200).json({
    success: true,
    message: 'Dental service structures listed successfully',
    data: services
  });
});

// Health Probe Check endpoint for external cloud diagnostics
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------------------
// SERVER INITIALIZATION & FRONTEND STATIC MOUNTING
// -------------------------------------------------------------------------

async function startServer() {
  // First, fire MongoDB database connector (operates with runtime file fallbacks if absent)
  await connectDB();

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
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n=============================================================');
    console.log(`🚀 ZENOVA CLINICS SECURE ENGINE BOOTED & RUNNING SUCCESSFULLY!`);
    console.log(`👉 Primary Endpoint: http://localhost:${PORT}`);
    console.log('=============================================================\n');
  });
}

startServer();
