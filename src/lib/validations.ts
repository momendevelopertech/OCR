import { z } from 'zod';

export const EGYPTIAN_ID_REGEX = /^[23]\d{13}$/;

export const egyptianIdSchema = z
  .string()
  .regex(EGYPTIAN_ID_REGEX, 'National ID must be 14 digits starting with 2 or 3');

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const uploadTicketSchema = z.object({
  nationalId: egyptianIdSchema,
  studentName: z.string().min(1, 'Student name is required'),
  faculty: z.string().optional(),
  academicYear: z.string().optional(),
});

export type UploadTicketFormData = z.infer<typeof uploadTicketSchema>;
