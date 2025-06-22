import { CreatedResponse } from '../../shared/responses/SuccessResponse';

export class UserCreatedResponse extends CreatedResponse {
  constructor() {
    super('ユーザー');
  }
} 