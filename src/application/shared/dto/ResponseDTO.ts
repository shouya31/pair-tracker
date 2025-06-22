/**
 * レスポンスDTOの基底クラス
 */
export abstract class ResponseDTO {
  constructor(
    public readonly message: string
  ) {}

  abstract getStatusCode(): number;
}

/**
 * 作成成功レスポンスDTO
 */
export class CreatedResponseDTO extends ResponseDTO {
  constructor(resourceName: string) {
    super(`${resourceName}が正常に登録されました`);
  }

  getStatusCode(): number {
    return 201;
  }
}

/**
 * エラーレスポンスDTOの基底クラス
 */
export abstract class ErrorResponseDTO extends ResponseDTO {
  constructor(
    message: string,
    public readonly propertyName?: string,
    public readonly actualValue?: unknown
  ) {
    super(message);
  }
}

/**
 * バリデーションエラーレスポンスDTO
 */
export class ValidationErrorResponseDTO extends ErrorResponseDTO {
  getStatusCode(): number {
    return 400;
  }
}

/**
 * 重複エラーレスポンスDTO
 */
export class ConflictErrorResponseDTO extends ErrorResponseDTO {
  getStatusCode(): number {
    return 409;
  }
}

/**
 * システムエラーレスポンスDTO
 */
export class SystemErrorResponseDTO extends ErrorResponseDTO {
  getStatusCode(): number {
    return 500;
  }
} 