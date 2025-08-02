import { IUserRepository } from '@/domain/user/IUserRepository';
import { UserGetDTO } from '../dto/UserDTO';
import { getUserId, getUserNameVO, getUserEmail, getUserStatus } from '@/domain/user/User';
export type GetUsersUseCase = () => Promise<UserGetDTO[]>;

// TODO：ページネーション対応、findAll自体を無くしたい
export const createGetUsersUseCase = (
  userRepository: IUserRepository
): GetUsersUseCase => {
  return async (): Promise<UserGetDTO[]> => {
    const users = await userRepository.findAll();
    return users.map(user => ({
      id: getUserId(user),
      name: getUserNameVO(user),
      email: getUserEmail(user),
      status: getUserStatus(user)
    }));
  };
};
