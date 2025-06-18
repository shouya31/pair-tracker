import { IUserRepository } from '../../../domain/user/IUserRepository';
import { User } from '../../../domain/user/User';

export class RegisterUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(name: string, email: string): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(User.create(name, email).getEmailVO());
    if (existingUser) {
      throw new Error('このメールアドレスは既に登録されています');
    }

    const user = User.create(name, email);
    await this.userRepository.save(user);
  }
}