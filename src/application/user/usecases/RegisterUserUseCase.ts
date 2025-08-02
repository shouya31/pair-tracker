import { Result, isOk, isErr } from '../../../domain/shared/Result';
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
  if (isErr(userResult)) {
    return userResult;
  }

  const saveResult = await userRepository.save(userResult.value);
  if (isErr(saveResult)) {
    return saveResult;
  }

  return userResult;
}