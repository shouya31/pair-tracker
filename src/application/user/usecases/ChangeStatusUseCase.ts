import { ChangeStatusCommand } from '../commands/ChangeStatusCommand';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { UserDTO } from '../dto/UserDTO';

export class ChangeStatusUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: ChangeStatusCommand): Promise<UserDTO> {
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.changeStatus(command.newStatus);
    await this.userRepository.save(user);

    return UserDTO.fromDomain(user);
  }
}