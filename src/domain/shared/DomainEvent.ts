/**
 * ドメインイベントを表すマーカーインターフェース。
 * このインターフェースを実装することで、そのクラスがドメインイベントであることを示す。
 *
 * @see https://martinfowler.com/eaaDev/DomainEvent.html
 */
export interface DomainEvent {
  /**
   * イベントが発生した日時
   */
  occurredAt: Date;
}