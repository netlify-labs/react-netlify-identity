export type TokenParam = {
  token: string | undefined;
  type: 'invite' | 'recovery' | 'email_change' | undefined;
  error?: 'access_denied';
  status?: 403;
};

export const defaultParam: TokenParam = {
  token: undefined,
  type: undefined,
  error: undefined,
  status: undefined,
};
