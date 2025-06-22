import type { UserResponse } from './UserResponse';

export type RegisterSuccessResponse = {
  message: string;
  user: UserResponse;
};

export type RegisterErrorResponse = {
  error: string;
  field?: string;
  value?: string;
};

export type RegisterResponse = RegisterSuccessResponse | RegisterErrorResponse; 