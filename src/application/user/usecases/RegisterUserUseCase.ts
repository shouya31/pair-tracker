import { createUser, getUserName, getUserEmail } from '@/domain/user/User';
import { IUserRepository } from '@/domain/user/IUserRepository';
import { UserRegisterDTO } from '../dto/UserDTO';
import { userAlreadyExists } from '@/domain/user/errors/UserDomainError';
import { createEmail } from '@/domain/shared/Email';

export type RegisterUserUseCase = (
  name: string,
  email: string
) => Promise<UserRegisterDTO>;

export const createRegisterUserUseCase = (
  userRepository: IUserRepository
): RegisterUserUseCase => {
  return async (name: string, email: string): Promise<UserRegisterDTO> => {
    const emailVO = createEmail(email);

    const existingUser = await userRepository.findByEmail(emailVO);
    if (existingUser) {
      throw userAlreadyExists(email);
    }

    const user = createUser(name, emailVO);
    await userRepository.save(user);

    return {
      name: getUserName(user),
      email: getUserEmail(user)
    };
  };
};