/**
 * レスポンスDTOの基底クラス
 * アプリケーション層からの応答を表現します
 */
export abstract class ResponseDTO {
  constructor(
    public readonly message: string
  ) {}
}

/**
 * 作成成功レスポンスDTO
 */
export class CreatedResponseDTO extends ResponseDTO {
  constructor(resourceName: string) {
    super(`${resourceName}が正常に登録されました`);
  }
} 