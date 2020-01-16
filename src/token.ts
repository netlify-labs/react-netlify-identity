export type TokenParam = {
  token: string | undefined;
  type: 'invite' | 'recovery' | 'email_change' | undefined;
  error: 'access_denied' | undefined;
  status: 403 | undefined;
};

export const defaultParam: TokenParam = {
  token: undefined,
  type: undefined,
  error: undefined,
  status: undefined,
};
