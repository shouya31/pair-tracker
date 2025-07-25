import { createUser, getUserName, getUserEmail } from '@/domain/user/User';
import { IUserRepository } from '@/domain/user/IUserRepository';
import { UserDTO } from '../dto/UserDTO';
import { UserDomainError } from '@/domain/user/errors/UserDomainError';
import { createEmail, Email } from '@/domain/shared/Email';

export class RegisterUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(name: string, email: string): Promise<UserDTO> {
    const emailVO = createEmail(email);
    const existingUser = await this.userRepository.findByEmail(emailVO);
    if (existingUser) {
      throw UserDomainError.alreadyExists(email);
    }

    const user = createUser(name, email);
    await this.userRepository.save(user);

    return new UserDTO(
      getUserName(user),
      getUserEmail(user)
    );
  }
}