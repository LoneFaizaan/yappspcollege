import { CATEGORIES, LIMITS, REPORT_REASONS } from './constants';
import { FeedbackCategory, FeedbackSubmissionRequest, ReportReason, ReportSubmissionRequest } from './types';

export interface PiiDetectionResult {
  hasPii: boolean;
  warnings: string[];
  types: ('email' | 'phone' | 'student_id' | 'social_url')[];
}

/**
 * Scans text for potential Personally Identifiable Information (PII)
 * such as email addresses, phone numbers, student ID patterns, and personal social handles.
 */
export function detectPotentialPii(text: string): PiiDetectionResult {
  if (!text) {
    return { hasPii: false, warnings: [], types: [] };
  }

  const warnings: string[] = [];
  const types: ('email' | 'phone' | 'student_id' | 'social_url')[] = [];

  // Email pattern
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i;
  if (emailRegex.test(text)) {
    types.push('email');
    warnings.push('An email address was detected. Please remove any personal or institutional emails.');
  }

  // Phone number pattern (covers 10-15 digit sequences with optional country codes, brackets, spaces, dashes)
  const phoneRegex = /(?:(?:\+|00)\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}\b/;
  // Avoid matching simple isolated 4-digit years like 2024
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 10) {
    types.push('phone');
    warnings.push('A phone or mobile number was detected. Please remove all phone numbers.');
  }

  // Student registration / roll number / ID patterns
  // E.g.: "roll: 21BCE1042", "Reg No 202100412", "ID: 492019", "21BCSE0492"
  const studentIdRegex = /\b(?:(?:roll|reg(?:istration)?|id|matric(?:ulation)?|enrollment|scholar)\s*(?:no\.?|number|#)?\s*[:=\-]?\s*[a-z0-9_-]{5,20})\b|\b(?:[0-9]{2}[a-z]{2,5}[0-9]{3,6})\b/i;
  if (studentIdRegex.test(text)) {
    types.push('student_id');
    warnings.push('A student ID, roll number, or registration code pattern was detected.');
  }

  // Direct personal social media links
  const socialUrlRegex = /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com\/|facebook\.com\/|linkedin\.com\/in\/|t\.me\/|wa\.me\/|twitter\.com\/|x\.com\/)[a-zA-Z0-9._-]+/i;
  if (socialUrlRegex.test(text)) {
    types.push('social_url');
    warnings.push('A social media profile link was detected. Please avoid linking personal profiles.');
  }

  return {
    hasPii: types.length > 0,
    warnings,
    types,
  };
}

/**
 * Validates feedback submission inputs
 */
export function validateFeedbackSubmission(data: unknown): {
  isValid: boolean;
  errors: Record<string, string>;
  cleaned?: {
    title: string | null;
    body: string;
    category: FeedbackCategory;
    turnstileToken: string;
  };
} {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: { form: 'Invalid request body' } };
  }

  const req = data as Partial<FeedbackSubmissionRequest>;

  // Honeypot check: bot prevention
  if (req.honeypot && req.honeypot.trim().length > 0) {
    return { isValid: false, errors: { form: 'Submission rejected' } };
  }

  // Category validation
  if (!req.category || !CATEGORIES.includes(req.category as FeedbackCategory)) {
    errors.category = 'Please select a valid feedback category';
  }

  // Title validation (optional, max 100 characters)
  let cleanTitle: string | null = null;
  if (req.title !== undefined && req.title !== null && req.title.trim() !== '') {
    const trimmedTitle = req.title.trim();
    if (trimmedTitle.length > LIMITS.TITLE_MAX_LENGTH) {
      errors.title = `Title must not exceed ${LIMITS.TITLE_MAX_LENGTH} characters`;
    } else {
      cleanTitle = trimmedTitle;
    }
  }

  // Body validation (required, 50-1500 chars)
  let cleanBody = '';
  if (!req.body || typeof req.body !== 'string' || req.body.trim().length < LIMITS.BODY_MIN_LENGTH) {
    errors.body = `Feedback message must be at least ${LIMITS.BODY_MIN_LENGTH} characters long (currently ${req.body ? req.body.trim().length : 0})`;
  } else if (req.body.trim().length > LIMITS.BODY_MAX_LENGTH) {
    errors.body = `Feedback message must not exceed ${LIMITS.BODY_MAX_LENGTH} characters`;
  } else {
    cleanBody = req.body.trim();
  }

  // Turnstile token
  if (!req.turnstileToken || typeof req.turnstileToken !== 'string' || req.turnstileToken.trim() === '') {
    errors.turnstile = 'Security verification is required. Please check the Turnstile challenge.';
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    cleaned: {
      title: cleanTitle,
      body: cleanBody,
      category: req.category as FeedbackCategory,
      turnstileToken: req.turnstileToken!.trim(),
    },
  };
}

/**
 * Validates report submission inputs
 */
export function validateReportSubmission(data: unknown): {
  isValid: boolean;
  errors: Record<string, string>;
  cleaned?: {
    feedbackId: string;
    reason: ReportReason;
    details: string | null;
    turnstileToken: string;
  };
} {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: { form: 'Invalid request body' } };
  }

  const req = data as Partial<ReportSubmissionRequest>;

  // Honeypot check
  if (req.honeypot && req.honeypot.trim().length > 0) {
    return { isValid: false, errors: { form: 'Report rejected' } };
  }

  // Feedback ID
  if (!req.feedbackId || typeof req.feedbackId !== 'string' || req.feedbackId.trim() === '') {
    errors.feedbackId = 'Invalid feedback reference';
  }

  // Reason
  const validReasons = REPORT_REASONS.map((r) => r.value);
  if (!req.reason || !validReasons.includes(req.reason as ReportReason)) {
    errors.reason = 'Please select a valid report reason';
  }

  // Details (optional, max 500 chars)
  let cleanDetails: string | null = null;
  if (req.details !== undefined && req.details !== null && req.details.trim() !== '') {
    const trimmed = req.details.trim();
    if (trimmed.length > LIMITS.DETAILS_MAX_LENGTH) {
      errors.details = `Report details must not exceed ${LIMITS.DETAILS_MAX_LENGTH} characters`;
    } else {
      cleanDetails = trimmed;
    }
  }

  // Turnstile token
  if (!req.turnstileToken || typeof req.turnstileToken !== 'string' || req.turnstileToken.trim() === '') {
    errors.turnstile = 'Security verification is required';
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    cleaned: {
      feedbackId: req.feedbackId!.trim(),
      reason: req.reason as ReportReason,
      details: cleanDetails,
      turnstileToken: req.turnstileToken!.trim(),
    },
  };
}
