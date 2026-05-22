import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  totp: z.string().min(6).max(10)
});
