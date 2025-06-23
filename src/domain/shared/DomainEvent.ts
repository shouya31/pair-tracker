/**
 * ドメインイベントを表すマーカーインターフェース。
 * このインターフェースを実装することで、そのクラスがドメインイベントであることを示す。
 *
 * @see https://martinfowler.com/eaaDev/DomainEvent.html
 */
/* eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/consistent-type-definitions */
export interface DomainEvent {
  /**
   * イベントが発生した日時
   */
  occurredAt: Date;
}