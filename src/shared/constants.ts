import { FeedbackCategory, ReportReason } from './types';

export const CATEGORIES: readonly FeedbackCategory[] = [
  'Academics',
  'Faculty & Teaching',
  'Administration',
  'Examinations',
  'Infrastructure',
  'Campus Facilities',
  'Student Services',
  'Campus Life',
  'Suggestions',
  'Other',
] as const;

export const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  {
    value: 'personal_information',
    label: 'Personal Information (PII)',
    description: 'Contains student names, phone numbers, email addresses, or IDs.',
  },
  {
    value: 'harassment',
    label: 'Harassment or Bullying',
    description: 'Direct personal attacks or malicious behavior targeting individuals.',
  },
  {
    value: 'hate_speech',
    label: 'Hate Speech or Discrimination',
    description: 'Slurs, dehumanizing language, or attacks based on identity.',
  },
  {
    value: 'spam',
    label: 'Spam or Commercial Promotion',
    description: 'Advertising, repeated messages, or irrelevant bot content.',
  },
  {
    value: 'inappropriate_content',
    label: 'Inappropriate or Harmful Content',
    description: 'Graphic, sexually explicit, dangerous, or illegal content.',
  },
  {
    value: 'other',
    label: 'Other Concern',
    description: 'Violates community guidelines or principles of constructive feedback.',
  },
];

export const LIMITS = {
  TITLE_MAX_LENGTH: 100,
  BODY_MIN_LENGTH: 50,
  BODY_MAX_LENGTH: 1500,
  DETAILS_MAX_LENGTH: 500,
  FEED_PAGE_SIZE: 12,
  ADMIN_PAGE_SIZE: 20,
} as const;

export const GENERIC_AUTHOR_LABEL = 'Anonymous Student';
