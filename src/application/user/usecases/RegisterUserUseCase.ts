import { IUserRepository } from '../../../domain/user/IUserRepository';
import { User } from '../../../domain/user/User';
import { Email } from '../../../domain/shared/Email';
import { UserNameValidationError } from '../../../domain/user/errors/UserNameValidationError';
import { UserAlreadyExistsError } from '../../../domain/user/errors/UserValidationError';
import { UserCreatedResponseDTO } from '../dto/UserResponseDTO';

export class RegisterUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(name: string, email: string): Promise<UserCreatedResponseDTO> {
    if (!name.trim()) {
      throw UserNameValidationError.required();
    }

    const emailVO = Email.create(email);
    const existingUser = await this.userRepository.findByEmail(emailVO);
    if (existingUser) {
      throw new UserAlreadyExistsError(email);
    }

    const user = User.create(name, email);
    await this.userRepository.save(user);

    return new UserCreatedResponseDTO();
  }
}