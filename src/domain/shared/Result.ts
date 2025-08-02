export type Result<T, E> = Ok<T> | Err<E>;

export class Ok<T> {
  readonly _tag = 'Ok';
  constructor(readonly value: T) {}
}

export class Err<E> {
  readonly _tag = 'Err';
  constructor(readonly error: E) {}
}

export function ok<T>(value: T): Ok<T> {
  return new Ok(value);
}

export function err<E>(error: E): Err<E> {
  return new Err(error);
}

export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result._tag === 'Ok';
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result._tag === 'Err';
} 