import { CreatedResponseDTO } from '../../shared/responses/ResponseDTO';

export class UserCreatedResponseDTO extends CreatedResponseDTO {
  constructor() {
    super('ユーザー');
  }
} 