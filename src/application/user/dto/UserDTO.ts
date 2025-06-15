import { User } from '../../../domain/user/User';
import { UserStatus } from '../../../domain/user/enums/UserStatus';

export class UserDTO {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly status: UserStatus,
  ) {}

  static fromDomain(user: User): UserDTO {
    return new UserDTO(
      user.getId(),
      user.getEmail().getValue(),
      user.getStatus(),
    );
  }
} 