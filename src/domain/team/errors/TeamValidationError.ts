import { RequiredValueError, StringLengthError, FormatError } from '../../shared/errors/ValidationError';

export class TeamNameRequiredError extends RequiredValueError {
  constructor() {
    super('チーム名');
  }
}

export class TeamNameLengthError extends StringLengthError {
  constructor(value: string) {
    super('チーム名', value, undefined, 3);
  }
}

export class TeamIdRequiredError extends RequiredValueError {
  constructor() {
    super('チームID');
  }
}

export class TeamIdFormatError extends FormatError {
  constructor(value: string) {
    super('チームID', value, 'UUID');
  }
} 