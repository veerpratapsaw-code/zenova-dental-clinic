import { Request, Response } from 'express';
import { ContactModel } from '../models/Contact';
import { getDbStatus, getFallbackDb, saveFallbackDb } from '../config/db';

/**
 * Log general medical contact inquiry
 * POST /api/contact
 */
export const createContactInquiry = async (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  const dbStatus = getDbStatus();

  try {
    let inquiryData: any;

    if (dbStatus.connected) {
      const contact = new ContactModel({
        name,
        email,
        message
      });

      const savedDoc = await contact.save();
      inquiryData = {
        id: savedDoc._id.toString(),
        name: savedDoc.name,
        email: savedDoc.email,
        message: savedDoc.message,
        createdAt: savedDoc.createdAt.toISOString()
      };
    } else {
      const localDb = getFallbackDb();
      const newLocalId = `inq-${Math.random().toString(36).substring(2, 11)}`;

      const newLocalInquiry = {
        id: newLocalId,
        name,
        email,
        message,
        createdAt: new Date().toISOString()
      };

      localDb.inquiries.unshift(newLocalInquiry);
      saveFallbackDb(localDb);
      inquiryData = newLocalInquiry;
    }

    // Interactive developer console report for contacts
    console.log(`\n=============================================================`);
    console.log(`✉️  NEW CLINIC CONTACT RECORDED`);
    console.log(`👤 Name: ${inquiryData.name}`);
    console.log(`📧 Email: ${inquiryData.email}`);
    console.log(`📝 Message: "${inquiryData.message}"`);
    console.log(`=============================================================\n`);

    return res.status(201).json({
      success: true,
      message: 'Inquiry log received! Our dental support crew will notify you via email shortly.',
      data: inquiryData,
      dbMode: dbStatus.mode
    });

  } catch (error: any) {
    console.error('Error in createContactInquiry controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Server failed to record contact inquiry',
      errors: [error.message || 'Server error occurred during execution']
    });
  }
};


/**
 * Get list of contact inquiries
 * GET /api/contact
 */
export const getContactInquiries = async (req: Request, res: Response) => {
  const dbStatus = getDbStatus();

  try {
    let inquiries: any[] = [];

    if (dbStatus.connected) {
      const docs = await ContactModel.find().sort({ createdAt: -1 });
      inquiries = docs.map(doc => ({
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        message: doc.message,
        createdAt: doc.createdAt.toISOString()
      }));
    } else {
      const localDb = getFallbackDb();
      inquiries = localDb.inquiries;
    }

    return res.status(200).json({
      success: true,
      message: 'Support and contact inquiries listed successfully',
      data: inquiries,
      dbMode: dbStatus.mode
    });

  } catch (error: any) {
    console.error('Error in getContactInquiries controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to request clinic inquiries database',
      errors: [error.message || 'Unexpected server error']
    });
  }
};
