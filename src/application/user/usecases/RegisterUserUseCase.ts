import { IUserRepository } from '../../../domain/user/IUserRepository';
import { User } from '../../../domain/user/User';
import { Email } from '../../../domain/shared/Email';

export class RegisterUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}
  async execute(name: string, email: string): Promise<void> {
    if (!name.trim()) {
      throw new Error('名前を入力してください');
    }

    const emailVO = Email.create(email);
    const existingUser = await this.userRepository.findByEmail(emailVO);
    if (existingUser) {
      throw new Error('このメールアドレスは既に登録されています');
    }

    const user = User.create(name, email);
    await this.userRepository.save(user);
  }
}