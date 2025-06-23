import { User } from '@/domain/user/User';
import { IUserRepository } from '@/domain/user/IUserRepository';
import { UserDTO } from '../dto/UserDTO';
import { UserDomainError } from '@/domain/user/errors/UserDomainError';
import { Email } from '@/domain/shared/Email';

export class RegisterUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(name: string, email: string): Promise<UserDTO> {
    const emailVO = Email.create(email);
    const existingUser = await this.userRepository.findByEmail(emailVO);
    if (existingUser) {
      throw UserDomainError.alreadyExists(email);
    }

    const user = User.create(name, email);
    await this.userRepository.save(user);

    return new UserDTO(
      user.getName(),
      user.getEmail()
    );
  }
}