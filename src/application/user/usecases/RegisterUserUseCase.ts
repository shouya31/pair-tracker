import { Result, isOk } from '../../../domain/shared/Result';
import { User } from '../../../domain/user/User';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { createUserService } from '../../../domain/user/UserDomainService';
import { DomainError } from '../../../domain/shared/DomainError';

export async function RegisterUserUseCase(
  name: string,
  email: string,
  userRepository: IUserRepository
): Promise<Result<User, DomainError>> {
  const userResult = await createUserService(name, email, userRepository);
  if (!isOk(userResult)) {
    return userResult;
  }

  const saveResult = await userRepository.save(userResult.value);
  if (!isOk(saveResult)) {
    return saveResult;
  }

  return userResult;
}