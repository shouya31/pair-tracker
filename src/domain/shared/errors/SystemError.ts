import { DomainError } from '../DomainError';

/**
 * システムエラーの基底クラス
 * システム内部で発生する技術的なエラーを表現します
 */
export class SystemError extends DomainError {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(`システムエラーが発生しました: ${message}`);
  }
}

/**
 * 予期せぬエラー
 * キャッチされなかった例外や、想定外のエラーを表現します
 */
export class UnexpectedError extends SystemError {
  constructor(cause?: Error) {
    super('予期せぬエラーが発生しました', cause);
  }
}
