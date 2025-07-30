import { Result, ok, err, isOk } from '../shared/Result';
import { User, createUser } from './User';
import { IUserRepository } from './IUserRepository';
import { DomainError, createDomainError } from '../shared/DomainError';
import { createEmail } from '../shared/Email';

export async function createUserService(
  name: string,
  email: string,
  userRepository: IUserRepository
): Promise<Result<User, DomainError>> {
  const emailResult = createEmail(email);
  if (!isOk(emailResult)) {
    return err(emailResult.error);
  }

  const existingUser = await userRepository.findByEmail(emailResult.value);
  if (existingUser !== null) {
    return err(createDomainError(`メールアドレス ${email} は既に使用されています`));
  }

  const userResult = createUser(name, email);
  if (!isOk(userResult)) {
    return err(userResult.error);
  }

  return ok(userResult.value);
}