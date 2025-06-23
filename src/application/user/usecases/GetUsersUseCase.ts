import { IUserRepository } from '@/domain/user/IUserRepository';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  status: string;
}

export class GetUsersUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(): Promise<UserDTO[]> {
    const users = await this.userRepository.findAll();
    return users.map(user => ({
      id: user.getUserId(),
      name: user.getName(),
      email: user.getEmail(),
      status: user.getStatus()
    }));
  }
} 