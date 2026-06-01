import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

let isMongoConnected = false;

// Path for JSON-based fallback database
const FALLBACK_DB_PATH = path.join(process.cwd(), 'db.json');

// Interface representation for local JSON storage fallback
export interface FallbackDatabase {
  appointments: Array<{
    id: string;
    name: string;
    phone: string;
    email: string;
    treatmentType: string;
    preferredDate: string;
    message?: string;
    patientId?: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    priorityLevel?: 'standard' | 'priority' | 'emergency';
    assignedTime?: string;
    adminNotes?: string;
    createdAt: string;
  }>;
  inquiries: Array<{
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: string;
  }>;
  users?: Array<{
    id: string;
    email: string;
    passwordHash: string;
    role: 'admin' | 'superadmin';
    createdAt: string;
  }>;
  patients: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
  }>;
}

// Low-overhead JSON Database Initializer/Reader
export const getFallbackDb = (): FallbackDatabase => {
  try {
    if (fs.existsSync(FALLBACK_DB_PATH)) {
      const data = fs.readFileSync(FALLBACK_DB_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        appointments: parsed.appointments || [],
        inquiries: parsed.inquiries || [],
        users: parsed.users || [],
        patients: parsed.patients || []
      };
    }
  } catch (error) {
    console.error('Error reading fallback JSON database:', error);
  }
  
  // Return a seeded structure if empty
  return { appointments: [], inquiries: [], users: [], patients: [] };
};

// Persist adjustments back to JSON file
export const saveFallbackDb = (data: FallbackDatabase) => {
  try {
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write to fallback JSON database:', error);
  }
};

export const connectDB = async (): Promise<boolean> => {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri || mongoUri.trim() === '') {
    console.warn('\n⚠️ WARNING: MONGODB_URI environment variable is missing.');
    console.warn('👉 Zenova is operating in low-overhead JSON file-fallback mode [db.json].\n');
    isMongoConnected = false;
    return false;
  }

  try {
    // Attempt Mongoose connection
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000 // Fails fast if connection is toxic or wrong
    });
    isMongoConnected = true;
    console.log('✅ MongoDB connected successfully to Mongoose Server!');
    return true;
  } catch (err: any) {
    console.error(`❌ Mongoose connection to MongoDB failed: ${err.message}`);
    console.warn('⚠️ Falling back to JSON database file mode [db.json].\n');
    isMongoConnected = false;
    return false;
  }
};

export const getDbStatus = (): { mode: 'mongodb' | 'json'; connected: boolean } => {
  return {
    mode: isMongoConnected ? 'mongodb' : 'json',
    connected: isMongoConnected
  };
};
