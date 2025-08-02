export type UserRegisterDTO = {
  readonly name: string;
  readonly email: string;
};

export type UserGetDTO = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly status: string;
};