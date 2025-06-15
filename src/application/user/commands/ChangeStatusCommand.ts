import { UserStatus } from '../../../domain/user/enums/UserStatus';

export class ChangeStatusCommand {
  constructor(
    public readonly userId: string,
    public readonly newStatus: UserStatus,
  ) {}
} 