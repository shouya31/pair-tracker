import { CreatedResponseDTO } from '@/application/shared/dto/ResponseDTO';

export class UserCreatedResponseDTO extends CreatedResponseDTO {
  constructor() {
    super('ユーザー');
  }
}