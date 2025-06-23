import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string()
    .min(1, 'チーム名は必須です')
    .max(3, 'チーム名は3文字以下で入力してください'),
  memberIds: z.array(z.string()).min(3, 'チームには最低3名のメンバーが必要です'),
});