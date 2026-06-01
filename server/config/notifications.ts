// Types representing incoming notifications payload
export interface NotificationPayload {
  name: string;
  phone: string;
  email: string;
  treatmentType: string;
  preferredDate: string;
  message?: string;
  id?: string;
}

/**
 * RESEND API EMAIL DISPATCH SERVICE
 * Sends an email notification to om4202010@gmail.com on new bookings.
 */
export const sendEmailNotification = async (payload: NotificationPayload): Promise<boolean> => {
  const adminEmail = 'om4202010@gmail.com';
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey || resendApiKey.trim() === '') {
    const errMsg = 'RESEND_API_KEY environment variable is required but missing or empty.';
    console.error(`❌ Configuration Error: ${errMsg}`);
    throw new Error(errMsg);
  }

  // Render a clean HTML email template
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6fa; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #e1e8f5;">
      <div style="background-color: #7c3aed; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 0.5px;">✦ ZENOVA DENTAL CLINIC ✦</h1>
        <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">New Dental Appointment Booking Notification</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 24px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
        <p style="color: #4b5563; font-size: 15px; margin-top: 0; line-height: 1.5;">
          A new dental appointment has been recorded through the For Your Dentist website booking portal.
        </p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #6b7280; font-weight: bold; width: 140px;">Patient Name:</td>
            <td style="padding: 10px 0; color: #1f2937; font-weight: bold;">${payload.name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #6b7280; font-weight: bold;">Phone Number:</td>
            <td style="padding: 10px 0; color: #1f2937; font-family: monospace;">${payload.phone}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #6b7280; font-weight: bold;">Email Address:</td>
            <td style="padding: 10px 0; color: #1f2937;"><a href="mailto:${payload.email}" style="color: #7c3aed; text-decoration: none;">${payload.email}</a></td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #6b7280; font-weight: bold;">Selected Program:</td>
            <td style="padding: 10px 0; color: #7c3aed; font-weight: bold;">${payload.treatmentType}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; color: #6b7280; font-weight: bold;">Appointment Date:</td>
            <td style="padding: 10px 0; color: #1f2937; font-weight: bold;">${payload.preferredDate}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-weight: bold; vertical-align: top;">Medical Message:</td>
            <td style="padding: 10px 0; color: #4b5563; font-style: italic; line-height: 1.4;">"${payload.message || 'No dynamic clinical notes appended'}"</td>
          </tr>
        </table>
        
        <div style="text-align: center; margin-top: 25px; border-top: 1px dashed #e2e8f0; padding-top: 20px;">
          <span style="font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Protected Secure SSL Sync Transaction ID: ${payload.id || 'N/A'}</span>
        </div>
      </div>
    </div>
  `;

  const textContent = `
New Dental Appointment Booking

Patient Name: ${payload.name}
Phone Number: ${payload.phone}
Email: ${payload.email}
Treatment: ${payload.treatmentType}
Preferred Date: ${payload.preferredDate}
Message: ${payload.message || 'None'}
  `.trim();

  try {
    console.log(`📡 Atempting to dispatch email notification via Resend API to ${adminEmail}...`);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'For Your Dentist Portal <onboarding@resend.dev>',
        to: [adminEmail],
        subject: 'New Dental Appointment Booking',
        html: htmlContent,
        text: textContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API returned status ${response.status} ${response.statusText}: ${errorText}`);
    }

    const resData: any = await response.json();
    console.log(`✅ Appointment email successfully dispatched to ${adminEmail} via Resend. Response:`, resData);
    return true;
  } catch (err: any) {
    console.error(`❌ Failed to dispatch email via Resend API:`, err);
    throw new Error(`Resend Email Error: ${err.message || err}`);
  }
};

/**
 * Dispatches an email to the patient when their appointment status changes.
 */
export const sendStatusUpdateEmail = async (patientEmail: string, patientName: string, status: string, appointmentDate: string): Promise<boolean> => {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey || resendApiKey.trim() === '') {
    console.log('Skipping patient status email: RESEND_API_KEY is not configured.');
    return false;
  }

  const isConfirmed = status === 'confirmed';
  const subject = isConfirmed ? 'Your For Your Dentist Appointment is Confirmed! ✅' : 'Update regarding your For Your Dentist Appointment';
  const color = isConfirmed ? '#10b981' : '#f59e0b';
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px; text-align: center;">
      <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
        <div style="background-color: ${color}; padding: 30px 20px; color: white;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">For Your Dentist</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #0f172a; font-size: 20px; margin-top: 0;">Hello, ${patientName}!</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            ${isConfirmed 
              ? `Great news! Your dental appointment requested for <strong>${appointmentDate}</strong> has been officially confirmed by our staff.`
              : `Your dental appointment requested for <strong>${appointmentDate}</strong> has been marked as <strong>${status}</strong>.`
            }
          </p>
          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            If you have any questions or need to reschedule, please reply directly to this email or call our front desk at +1 (555) 019-8234.
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'For Your Dentist <onboarding@resend.dev>',
        to: [patientEmail],
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) throw new Error('Failed to send status email');
    return true;
  } catch (err) {
    console.error('Failed to dispatch status email via Resend API:', err);
    return false;
  }
};
