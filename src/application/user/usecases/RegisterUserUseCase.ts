import { v4 as uuidv4 } from 'uuid';
import { RegisterUserCommand } from '../commands/RegisterUserCommand';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { User } from '../../../domain/user/User';
import { Email } from '../../../domain/shared/Email';
import { UserDTO } from '../dto/UserDTO';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: RegisterUserCommand): Promise<UserDTO> {
    const email = Email.create(command.email);
    
    // メールアドレスの重複チェック
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = User.create(uuidv4(), email);
    await this.userRepository.save(user);

    return UserDTO.fromDomain(user);
  }
} 