import { Result, isOk } from '../../../domain/shared/Result';
import { User } from '../../../domain/user/User';
import { UserRepository } from '../../../domain/user/UserRepository';
import { createUserService } from '../../../domain/user/UserDomainService';
import { DomainError } from '../../../domain/shared/DomainError';

export class RegisterUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    name: string,
    email: string
  ): Promise<Result<User, DomainError>> {
    const userResult = await createUserService(name, email, this.userRepository);
    if (!isOk(userResult)) {
      return userResult;
    }

    const saveResult = await this.userRepository.save(userResult.value);
    if (!isOk(saveResult)) {
      return saveResult;
    }

    return saveResult;
  }
}