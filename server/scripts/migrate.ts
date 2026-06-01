import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env' });

import User from '../models/User';
import { PatientModel } from '../models/Patient';
import { AppointmentModel } from '../models/Appointment';
import { ContactModel } from '../models/Contact';

const FALLBACK_DB_PATH = path.join(process.cwd(), 'db.json');

async function migrate() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('No MONGODB_URI found in .env');
    process.exit(1);
  }

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(mongoUri);
  console.log('Connected!');

  if (!fs.existsSync(FALLBACK_DB_PATH)) {
    console.log('No db.json found, nothing to migrate.');
    process.exit(0);
  }

  const data = JSON.parse(fs.readFileSync(FALLBACK_DB_PATH, 'utf-8'));

  // 1. Migrate Users (Admins)
  if (data.users && data.users.length > 0) {
    console.log(`Migrating ${data.users.length} users...`);
    for (const u of data.users) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create({
          email: u.email,
          passwordHash: u.passwordHash,
          role: u.role,
        });
      }
    }
  }

  // 2. Migrate Patients
  if (data.patients && data.patients.length > 0) {
    console.log(`Migrating ${data.patients.length} patients...`);
    for (const p of data.patients) {
      const exists = await PatientModel.findOne({ email: p.email });
      if (!exists) {
        await PatientModel.create({
          name: p.name,
          email: p.email,
          phone: p.phone,
          passwordHash: p.passwordHash || 'MIGRATED_NO_PASSWORD'
        });
      }
    }
  }

  // 3. Migrate Appointments
  if (data.appointments && data.appointments.length > 0) {
    console.log(`Migrating ${data.appointments.length} appointments...`);
    for (const a of data.appointments) {
      // Find patient if we have email matching
      const patient = await PatientModel.findOne({ email: a.email });
      
      const exists = await AppointmentModel.findOne({ email: a.email, preferredDate: new Date(a.preferredDate) });
      if (!exists) {
        await AppointmentModel.create({
          patientId: patient ? patient._id : null,
          name: a.name,
          phone: a.phone,
          email: a.email,
          treatmentType: a.treatmentType,
          preferredDate: new Date(a.preferredDate),
          message: a.message || '',
          status: a.status || 'pending',
          priority_level: 'standard'
        });
      }
    }
  }

  // 4. Migrate Inquiries (Contact)
  if (data.inquiries && data.inquiries.length > 0) {
    console.log(`Migrating ${data.inquiries.length} inquiries...`);
    for (const i of data.inquiries) {
      const exists = await ContactModel.findOne({ email: i.email, message: i.message });
      if (!exists) {
        await ContactModel.create({
          name: i.name,
          email: i.email,
          message: i.message,
          status: i.status || 'new'
        });
      }
    }
  }

  console.log('✅ Data Migration Complete!');
  process.exit(0);
}

migrate().catch(console.error);
