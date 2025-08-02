import { Result, ok, err, isOk, isErr } from '../shared/Result';
import { User, createUser } from './User';
import { IUserRepository } from './IUserRepository';
import { DomainError, createDomainError, ERROR_CODES } from '../shared/DomainError';
import { createEmail } from '../shared/Email';
import { Email } from '../shared/Email';

export async function createUserService(
  name: string,
  email: string,
  userRepository: IUserRepository
): Promise<Result<User, DomainError>> {
  const emailResult = createEmail(email);
  if (isErr(emailResult)) {
    return err(emailResult.error);
  }

  const duplicateCheckResult = await checkEmailDuplicate(emailResult.value, userRepository);
  if (isErr(duplicateCheckResult)) {
    return duplicateCheckResult;
  }

  const userResult = createUser(name, email);
  if (isErr(userResult)) {
    return err(userResult.error);
  }

  return ok(userResult.value);
}

/**
 * メールアドレスの重複チェックを行うドメイン関数
 * ビジネスルール：同じメールアドレスで複数のユーザーを作成してはいけない
 */
export async function checkEmailDuplicate(
  email: Email,
  userRepository: IUserRepository
): Promise<Result<void, DomainError>> {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser !== null) {
    return err(createDomainError(
      `メールアドレス ${email.value} は既に使用されています`,
      ERROR_CODES.ALREADY_EXISTS
    ));
  }
  return ok(undefined);
}