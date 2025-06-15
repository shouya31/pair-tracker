import { RegisterUserUseCase } from '../../../../application/user/usecases/RegisterUserUseCase';
import { RegisterUserCommand } from '../../../../application/user/commands/RegisterUserCommand';
import { MockUserRepository } from '../../../mocks/MockUserRepository';
import { Email } from '../../../../domain/shared/Email';
import { UserStatus } from '../../../../domain/user/enums/UserStatus';

describe('RegisterUserUseCase', () => {
  let userRepository: MockUserRepository;
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    userRepository = new MockUserRepository();
    useCase = new RegisterUserUseCase(userRepository);
  });

  it('should register a new user', async () => {
    const command = new RegisterUserCommand('test@example.com');
    const result = await useCase.execute(command);

    expect(result.email).toBe('test@example.com');
    expect(result.status).toBe(UserStatus.Enrolled);

    const savedUser = await userRepository.findByEmail(Email.create('test@example.com'));
    expect(savedUser).not.toBeNull();
    expect(savedUser?.getEmail().getValue()).toBe('test@example.com');
    expect(savedUser?.getStatus()).toBe(UserStatus.Enrolled);
  });

  it('should not register a user with duplicate email', async () => {
    const command = new RegisterUserCommand('test@example.com');
    await useCase.execute(command);

    await expect(useCase.execute(command))
      .rejects
      .toThrow('User with this email already exists');
  });

  it('should throw error for invalid email', async () => {
    const command = new RegisterUserCommand('invalid-email');
    await expect(useCase.execute(command))
      .rejects
      .toThrow('Invalid email format');
  });
}); 