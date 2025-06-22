import { z } from 'zod';

export const registerUserSchema = z.object({
  name: z.string().min(1, { message: '名前は必須です' }),
  email: z.string()
    .min(1, { message: 'メールアドレスは必須です' })
    .email({ message: 'メールアドレスの形式が正しくありません' })
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;