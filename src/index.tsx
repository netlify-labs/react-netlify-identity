import React from 'react';

import GoTrue, { User, Settings } from 'gotrue-js';
import { runRoutes } from './runRoutes';

type authChangeParam = (user?: User) => string | void;

export type Settings = Settings;
export type User = User;

const defaultSettings = {
  autoconfirm: false,
  disable_signup: false,
  external: {
    bitbucket: false,
    email: true,
    facebook: false,
    github: false,
    gitlab: false,
    google: false,
  },
};

export type ReactNetlifyIdentityAPI = {
  user: User | undefined;
  /** not meant for normal use! you should mostly use one of the other exported methods to update the user instance */
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  isConfirmedUser: boolean;
  isLoggedIn: boolean;
  signupUser: (
    email: string,
    password: string,
    data: Object
  ) => Promise<User | undefined>;
  loginUser: (
    email: string,
    password: string,
    remember?: boolean
  ) => Promise<User | undefined>;
  logoutUser: () => Promise<User | undefined>;
  requestPasswordRecovery: (email: string) => Promise<void>;
  recoverAccount: (
    token: string,
    remember?: boolean | undefined
  ) => Promise<User>;
  updateUser: (fields: Object) => Promise<User | undefined>;
  getFreshJWT: () => Promise<string>;
  authedFetch: {
    get: (endpoint: string, obj?: {}) => Promise<any>;
    post: (endpoint: string, obj?: {}) => Promise<any>;
    put: (endpoint: string, obj?: {}) => Promise<any>;
    delete: (endpoint: string, obj?: {}) => Promise<any>;
  };
  _goTrueInstance: GoTrue;
  _url: string;
  loginProvider: (
    provider: 'bitbucket' | 'github' | 'gitlab' | 'google'
  ) => void;
  acceptInviteExternalUrl: (
    provider: 'bitbucket' | 'github' | 'gitlab' | 'google',
    token: string
  ) => string;
  settings: Settings;
};

const [_useIdentityContext, _IdentityCtxProvider] = createCtx<
  ReactNetlifyIdentityAPI
>();
export const useIdentityContext = _useIdentityContext; // we dont want to expose _IdentityCtxProvider

/** most people should use this provider directly */
export function IdentityContextProvider({
  url,
  children,
  onAuthChange = () => {},
}: {
  url: string;
  children: React.ReactNode;
  onAuthChange?: authChangeParam;
}) {
  /******** SETUP */
  if (!url || !validateUrl(url)) {
    // just a safety check in case a JS user tries to skip this
    throw new Error(
      'invalid netlify instance URL: ' +
        url +
        '. Please check the docs for proper usage or file an issue.'
    );
  }
  const identity = useNetlifyIdentity(url, onAuthChange);
  return (
    <_IdentityCtxProvider value={identity}>{children}</_IdentityCtxProvider>
  );
}

/** some people may want to use this as a hook and bring their own contexts */
export function useNetlifyIdentity(
  url: string,
  onAuthChange: authChangeParam = () => {}
): ReactNetlifyIdentityAPI {
  const goTrueInstance = new GoTrue({
    APIUrl: `${url}/.netlify/identity`,
    setCookie: true,
  });

  const [user, setUser] = React.useState<User | undefined>(
    goTrueInstance.currentUser() || undefined
  );
  const _setUser = (_user: User | undefined) => {
    setUser(_user);
    onAuthChange(_user); // if someone's subscribed to auth changes, let 'em know
    return _user; // so that we can continue chaining
  };

  React.useEffect(() => {
    runRoutes(goTrueInstance, _setUser);
  }, []);

  /******* OPERATIONS */
  // make sure the Registration preferences under Identity settings in your Netlify dashboard are set to Open.
  // https://react-netlify-identity.netlify.com/login#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NTY0ODY3MjEsInN1YiI6ImNiZjY5MTZlLTNlZGYtNGFkNS1iOTYzLTQ4ZTY2NDcyMDkxNyIsImVtYWlsIjoic2hhd250aGUxQGdtYWlsLmNvbSIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImdpdGh1YiJ9LCJ1c2VyX21ldGFkYXRhIjp7ImF2YXRhcl91cmwiOiJodHRwczovL2F2YXRhcnMxLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzY3NjQ5NTc_dj00IiwiZnVsbF9uYW1lIjoic3d5eCJ9fQ.E8RrnuCcqq-mLi1_Q5WHJ-9THIdQ3ha1mePBKGhudM0&expires_in=3600&refresh_token=OyA_EdRc7WOIVhY7RiRw5w&token_type=bearer
  /******* external oauth */
  type Provider = 'bitbucket' | 'github' | 'gitlab' | 'google';

  const loginProvider = (provider: Provider) => {
    const url = goTrueInstance.loginExternalUrl(provider);
    window.location.href = url;
  };
  const acceptInviteExternalUrl = (provider: Provider, token: string) =>
    goTrueInstance.acceptInviteExternalUrl(provider, token);
  const _settings = goTrueInstance.settings.bind(goTrueInstance);
  const [settings, setSettings] = React.useState<Settings>(defaultSettings);
  React.useEffect(() => {
    _settings().then(x => setSettings(x));
  }, [_settings]);

  /******* email auth */
  const signupUser = (email: string, password: string, data: Object) =>
    goTrueInstance.signup(email, password, data).then(_setUser); // TODO: make setUser optional?
  const loginUser = (
    email: string,
    password: string,
    remember: boolean = true
  ) => goTrueInstance.login(email, password, remember).then(_setUser);
  const requestPasswordRecovery = (email: string) =>
    goTrueInstance.requestPasswordRecovery(email);
  const recoverAccount = (token: string, remember?: boolean | undefined) =>
    goTrueInstance.recover(token, remember);
  const updateUser = (fields: Object) => {
    if (user == null) {
      throw new Error('No current user found - are you logged in?');
    } else {
      return user!
        .update(fields) // e.g. { email: "example@example.com", password: "password" }
        .then(_setUser);
    }
  };
  const getFreshJWT = () => {
    if (!user) throw new Error('No current user found - are you logged in?');
    return user.jwt();
  };
  const logoutUser = () => {
    if (!user) throw new Error('No current user found - are you logged in?');
    return user.logout().then(() => _setUser(undefined));
  };

  const genericAuthedFetch = (method: string) => (
    endpoint: string,
    obj = {}
  ) => {
    if (!user || !user.token || !user.token.access_token)
      throw new Error('no user token found');
    const defaultObj = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + user.token.access_token,
      },
    };
    const finalObj = Object.assign(defaultObj, { method }, obj);
    return fetch(endpoint, finalObj).then(res =>
      finalObj.headers['Content-Type'] === 'application/json' ? res.json() : res
    );
  };
  const authedFetch = {
    get: genericAuthedFetch('GET'),
    post: genericAuthedFetch('POST'),
    put: genericAuthedFetch('PUT'),
    delete: genericAuthedFetch('DELETE'),
  };

  /******* hook API */
  return {
    user,
    /** not meant for normal use! you should mostly use one of the other exported methods to update the user instance */
    setUser,
    isConfirmedUser: !!(user && user.confirmed_at),
    isLoggedIn: !!user,
    signupUser,
    loginUser,
    logoutUser,
    requestPasswordRecovery,
    recoverAccount,
    updateUser,
    getFreshJWT,
    authedFetch,
    _goTrueInstance: goTrueInstance,
    _url: url,
    loginProvider,
    acceptInviteExternalUrl,
    settings,
  };
}

/**
 *
 *
 * Utils
 *
 */

function validateUrl(value: string) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
    value
  );
}

// lazy initialize contexts without providing a Nullable type upfront
function createCtx<A>() {
  const ctx = React.createContext<A | undefined>(undefined);
  function useCtx() {
    const c = React.useContext(ctx);
    if (!c) throw new Error('useCtx must be inside a Provider with a value');
    return c;
  }
  return [useCtx, ctx.Provider] as const;
}

// // Deprecated for now
// interface NIProps {
//   children: any
//   url: string
//   onAuthChange?: authChangeParam
// }
// export default function NetlifyIdentity({ children, url, onAuthChange }: NIProps) {
//   return children(useNetlifyIdentity(url, onAuthChange))
// }
