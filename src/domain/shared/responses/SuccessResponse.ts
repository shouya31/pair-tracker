/**
 * 成功レスポンスの基底クラス
 * ドメインの操作が成功した場合のメッセージを表現します
 */
export class SuccessResponse {
  constructor(
    public readonly message: string
  ) {}
}

/**
 * 作成成功レスポンス
 * リソースの作成が成功した場合のメッセージを表現します
 */
export class CreatedResponse extends SuccessResponse {
  constructor(resourceName: string) {
    super(`${resourceName}が正常に登録されました`);
  }
} 