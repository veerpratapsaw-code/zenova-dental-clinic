import { Request, Response, NextFunction } from 'express';

/**
 * Standard Email Validation Regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Standard Phone Validation Regex
 * Supports regional codes, optional country signs, spaces, hyphens, parentheses, and numbers.
 * Minimum 7 digits.
 */
const PHONE_REGEX = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

/**
 * Basic input sanitizer to escape fundamental script entities
 */
export const sanitizeString = (str: string): string => {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/[<>]/g, ''); // Remove angle brackets to avoid raw HTML injection
};

/**
 * Middleware validating clinical appointments submission payloads
 */
export const validateAppointmentInput = (req: Request, res: Response, next: NextFunction) => {
  const { name, phone, email, treatmentType, preferredDate, message } = req.body;
  const errors: string[] = [];

  // 1. Prevent completely empty submission
  if (!name && !phone && !email && !treatmentType && !preferredDate) {
    return res.status(400).json({
      success: false,
      message: 'Failed to log appointment: Submission body is completely empty'
    });
  }

  // 2. Full Name validation
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Full Patient Name is required.');
  } else {
    req.body.name = sanitizeString(name);
  }

  // 3. Phone number validation
  if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
    errors.push('A contact phone number is required.');
  } else {
    const cleanedPhone = phone.trim();
    // Validate clean length and basic structure
    if (cleanedPhone.replace(/[^0-9]/g, '').length < 7) {
      errors.push('Phone number must contain at least 7 numerical digits.');
    } else {
      req.body.phone = sanitizeString(cleanedPhone);
    }
  }

  // 4. Email format validation
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Patient email address is required.');
  } else {
    const cleanedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanedEmail)) {
      errors.push('Please enter a valid email address (e.g., patient@example.com).');
    } else {
      req.body.email = cleanedEmail;
    }
  }

  // 5. Treatment program selection validation
  if (!treatmentType || typeof treatmentType !== 'string' || treatmentType.trim().length === 0) {
    errors.push('Please select a specific dental specialty treatment.');
  } else {
    req.body.treatmentType = sanitizeString(treatmentType);
  }

  // 6. Preferred Date validation
  if (!preferredDate || typeof preferredDate !== 'string' || preferredDate.trim().length === 0) {
    errors.push('A target appointment date is required.');
  }

  // 7. Sanitizing message notes (Optional)
  if (message) {
    req.body.message = sanitizeString(message);
  } else {
    req.body.message = '';
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed for appointment booking',
      errors
    });
  }

  next();
};

/**
 * Middleware validating general contact form inquiry payloads
 */
export const validateContactInput = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, message } = req.body;
  const errors: string[] = [];

  // Prevent empty submissions
  if (!name && !email && !message) {
    return res.status(400).json({
      success: false,
      message: 'Failed to accept inquiry: Submission is completely empty'
    });
  }

  // Name check
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Sender Name is required.');
  } else {
    req.body.name = sanitizeString(name);
  }

  // Email check
  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    errors.push('Email address is required.');
  } else {
    const cleanedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanedEmail)) {
      errors.push('Please enter a valid email address.');
    } else {
      req.body.email = cleanedEmail;
    }
  }

  // Message body length check
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    errors.push('Inquiry message cannot be empty.');
  } else if (message.trim().length < 5) {
    errors.push('Inquiry message is too short (must be at least 5 characters).');
  } else {
    req.body.message = sanitizeString(message);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed for contact submission',
      errors
    });
  }

  next();
};
