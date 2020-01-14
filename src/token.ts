export type TokenParam = {
  token: string | undefined;
  type:
    | 'confirmation'
    | 'invite'
    | 'recovery'
    | 'email_change'
    | 'access'
    | 'confirmation'
    | undefined;
  error?: 'access_denied';
  status?: 403;
};

export const defaultParam: TokenParam = {
  token: undefined,
  type: undefined,
};
