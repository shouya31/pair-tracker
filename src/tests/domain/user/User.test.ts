import { User } from '../../../domain/user/User';
import { Email } from '../../../domain/shared/Email';
import { UserStatus } from '../../../domain/user/UserStatus';

describe('User', () => {
  const validEmail = Email.create('test@example.com');

  describe('create', () => {
    it('should create a user with valid parameters', () => {
      const user = User.create(validEmail);
      expect(user.getEmail().getValue()).toBe('test@example.com');
      expect(user.getStatus()).toBe(UserStatus.ENROLLED);
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct a user with specified status', () => {
      const id = 'test-id';
      const user = User.reconstruct(id, validEmail, UserStatus.SUSPENDED);
      expect(user.getId()).toBe(id);
      expect(user.getEmail().getValue()).toBe('test@example.com');
      expect(user.getStatus()).toBe(UserStatus.SUSPENDED);
    });
  });

  describe('changeStatus', () => {
    it('should change status to a valid status', () => {
      const user = User.create(validEmail);
      user.changeStatus(UserStatus.SUSPENDED);
      expect(user.getStatus()).toBe(UserStatus.SUSPENDED);
    });

    it('should not change status of a withdrawn user', () => {
      const user = User.reconstruct('test-id', validEmail, UserStatus.WITHDRAWN);
      expect(() => user.changeStatus(UserStatus.ENROLLED))
        .toThrow('Cannot change status of withdrawn user');
    });
  });

  describe('equals', () => {
    it('should return true for same id', () => {
      const id = 'test-id';
      const user1 = User.reconstruct(id, validEmail, UserStatus.ENROLLED);
      const user2 = User.reconstruct(id, Email.create('other@example.com'), UserStatus.ENROLLED);
      expect(user1.equals(user2)).toBe(true);
    });

    it('should return false for different id', () => {
      const user1 = User.reconstruct('id1', validEmail, UserStatus.ENROLLED);
      const user2 = User.reconstruct('id2', validEmail, UserStatus.ENROLLED);
      expect(user1.equals(user2)).toBe(false);
    });
  });
}); 