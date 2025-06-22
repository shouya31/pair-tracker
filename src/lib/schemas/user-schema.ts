import { z } from 'zod';

export const registerUserSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email format' })
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;