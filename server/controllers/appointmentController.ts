import { Request, Response } from 'express';
import { AppointmentModel } from '../models/Appointment';
import { getDbStatus, getFallbackDb, saveFallbackDb } from '../config/db';
import { sendEmailNotification } from '../config/notifications';
import { getIO } from '../socket';

/**
 * Handle creation of a new medical appointment
 * POST /api/appointments
 */
export const createAppointment = async (req: Request, res: Response) => {
  const { name, phone, email, treatmentType, preferredDate, message, patientId, priorityLevel } = req.body;
  const dbStatus = getDbStatus();

  try {
    let appointmentData: any;

    if (dbStatus.connected) {
      // Create and save to real MongoDB
      const appointment = new AppointmentModel({
        name,
        phone,
        email,
        treatmentType,
        preferredDate,
        message,
        patientId,
        status: 'pending',
        priorityLevel: priorityLevel || 'standard'
      });

      const savedDoc = await appointment.save();
      // Map MongoDB _id cleanly to id for unified frontend consumption
      appointmentData = {
        id: savedDoc._id.toString(),
        name: savedDoc.name,
        phone: savedDoc.phone,
        email: savedDoc.email,
        treatmentType: savedDoc.treatmentType,
        preferredDate: savedDoc.preferredDate,
        message: savedDoc.message,
        patientId: savedDoc.patientId,
        status: savedDoc.status,
        priorityLevel: savedDoc.priorityLevel,
        createdAt: savedDoc.createdAt.toISOString()
      };
    } else {
      // Local fallback mode: write to our json database file
      const localDb = getFallbackDb();
      const newLocalId = `zen-${Math.random().toString(36).substring(2, 11)}`;
      
      const newLocalApp = {
        id: newLocalId,
        name,
        phone,
        email,
        treatmentType,
        preferredDate,
        message,
        patientId,
        status: 'pending' as const,
        priorityLevel: priorityLevel || 'standard',
        createdAt: new Date().toISOString()
      };

      localDb.appointments.unshift(newLocalApp);
      saveFallbackDb(localDb);
      appointmentData = newLocalApp;
    }

    // Emit realtime event
    getIO().emit('new_appointment', appointmentData);

    // Return polished successful responses
    return res.status(201).json({
      success: true,
      message: 'Your cosmetic dental appointment has been recorded!',
      data: appointmentData,
      dbMode: dbStatus.mode
    });

  } catch (error: any) {
    console.error('CRITICAL: Error in createAppointment controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server failed to record appointment or send email notification.',
      errors: [error.message || 'Server encountered an unexpected execution crash']
    });
  }
};


/**
 * Handle listing of logged appointments (to support frontend inquiries or clinical status dashboards)
 * GET /api/appointments
 */
export const getAppointments = async (req: Request, res: Response) => {
  const dbStatus = getDbStatus();

  try {
    let appointments: any[] = [];

    if (dbStatus.connected) {
      const docs = await AppointmentModel.find().sort({ createdAt: -1 });
      appointments = docs.map(doc => ({
        id: doc._id.toString(),
        name: doc.name,
        phone: doc.phone,
        email: doc.email,
        treatmentType: doc.treatmentType,
        preferredDate: doc.preferredDate,
        message: doc.message,
        status: doc.status,
        createdAt: doc.createdAt.toISOString()
      }));
    } else {
      const localDb = getFallbackDb();
      appointments = localDb.appointments;
    }

    return res.status(200).json({
      success: true,
      message: 'Appointments fetched successfully',
      data: appointments,
      dbMode: dbStatus.mode
    });

  } catch (error: any) {
    console.error('Error in getAppointments controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to request historical appointments database',
      errors: [error.message || 'Unexpected server error']
    });
  }
};

/**
 * Get live queue status for Priority UI
 * GET /api/appointments/queue-status
 */
export const getQueueStatus = async (req: Request, res: Response) => {
  try {
    const dbStatus = getDbStatus();
    let standardCount = 0;
    let priorityCount = 0;
    
    if (dbStatus.connected) {
      standardCount = await AppointmentModel.countDocuments({ status: 'pending', priorityLevel: 'standard' });
      priorityCount = await AppointmentModel.countDocuments({ status: 'pending', priorityLevel: 'priority' });
    } else {
      const db = getFallbackDb();
      standardCount = db.appointments.filter(a => a.status === 'pending' && a.priorityLevel === 'standard').length;
      priorityCount = db.appointments.filter(a => a.status === 'pending' && a.priorityLevel === 'priority').length;
    }

    res.status(200).json({
      success: true,
      data: {
        standardCount,
        priorityCount
      }
    });
  } catch (error: any) {
    console.error('Queue Status Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch queue status' });
  }
};
