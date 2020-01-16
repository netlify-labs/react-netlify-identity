import React, {
  useState,
  useMemo,
  useEffect,
  createContext,
  useContext,
  useCallback,
  // types
  ReactNode,
} from 'react';

import GoTrue, {
  User as GoTrueUser,
  Settings as GoTrueSettings,
} from 'gotrue-js';
import { runRoutes } from './runRoutes';
import { TokenParam, defaultParam } from './token';

type authChangeParam = (user?: User) => string | void;

export type Settings = GoTrueSettings;
export type User = GoTrueUser;
type Provider = 'bitbucket' | 'github' | 'gitlab' | 'google';

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

const errors = {
  noUserFound: 'No current user found - are you logged in?',
  noUserTokenFound: 'no user token found',
  tokenMissingOrInvalid: 'either no token found or invalid for this purpose',
};

type MaybeUserPromise = Promise<User | undefined>;

export type ReactNetlifyIdentityAPI = {
  user: User | undefined;
  /** not meant for normal use! you should mostly use one of the other exported methods to update the user instance */
  setUser: (_user: GoTrueUser | undefined) => GoTrueUser | undefined;
  isConfirmedUser: boolean;
  isLoggedIn: boolean;
  signupUser: (
    email: string,
    password: string,
    data: Object
  ) => MaybeUserPromise;
  loginUser: (
    email: string,
    password: string,
    remember?: boolean
  ) => MaybeUserPromise;
  logoutUser: () => MaybeUserPromise;
  requestPasswordRecovery: (email: string) => Promise<void>;
  recoverAccount: (remember?: boolean) => MaybeUserPromise;
  updateUser: (fields: object) => MaybeUserPromise;
  getFreshJWT: () => Promise<string>;
  authedFetch: {
    get: (endpoint: string, obj?: {}) => Promise<any>;
    post: (endpoint: string, obj?: {}) => Promise<any>;
    put: (endpoint: string, obj?: {}) => Promise<any>;
    delete: (endpoint: string, obj?: {}) => Promise<any>;
  };
  _goTrueInstance: GoTrue;
  _url: string;
  loginProvider: (provider: Provider) => void;
  acceptInviteExternalUrl: (provider: Provider) => string;
  settings: Settings;
  param: TokenParam;
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
  children: ReactNode;
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
  onAuthChange: authChangeParam = () => {},
  enableRunRoutes: boolean = true
): ReactNetlifyIdentityAPI {
  const goTrueInstance = useMemo(
    () =>
      new GoTrue({
        APIUrl: `${url}/.netlify/identity`,
        setCookie: true,
      }),
    [url]
  );

  /******* STATE and EFFECTS */

  const [user, setUser] = useState<User | undefined>(
    goTrueInstance.currentUser() || undefined
  );

  const _setUser = useCallback(
    (_user: User | undefined) => {
      setUser(_user);
      onAuthChange(_user); // if someone's subscribed to auth changes, let 'em know
      return _user; // so that we can continue chaining
    },
    [onAuthChange]
  );

  const [param, setParam] = useState<TokenParam>(defaultParam);

  useEffect(() => {
    if (enableRunRoutes) {
      const param = runRoutes(goTrueInstance, _setUser);

      if (param.token || param.error) {
        setParam(param);
      }
    }
  }, []);

  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    goTrueInstance.settings
      .bind(goTrueInstance)()
      .then(x => setSettings(x));
  }, []);

  /******* OPERATIONS */
  // make sure the Registration preferences under Identity settings in your Netlify dashboard are set to Open.
  // https://react-netlify-identity.netlify.com/login#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NTY0ODY3MjEsInN1YiI6ImNiZjY5MTZlLTNlZGYtNGFkNS1iOTYzLTQ4ZTY2NDcyMDkxNyIsImVtYWlsIjoic2hhd250aGUxQGdtYWlsLmNvbSIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImdpdGh1YiJ9LCJ1c2VyX21ldGFkYXRhIjp7ImF2YXRhcl91cmwiOiJodHRwczovL2F2YXRhcnMxLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzY3NjQ5NTc_dj00IiwiZnVsbF9uYW1lIjoic3d5eCJ9fQ.E8RrnuCcqq-mLi1_Q5WHJ-9THIdQ3ha1mePBKGhudM0&expires_in=3600&refresh_token=OyA_EdRc7WOIVhY7RiRw5w&token_type=bearer
  /******* external oauth */

  /**
   * @see https://github.com/netlify/gotrue-js/blob/master/src/index.js#L71
   */
  const loginProvider = useCallback(
    (provider: Provider) => {
      const url = goTrueInstance.loginExternalUrl(provider);
      window.location.href = url;
    },
    [goTrueInstance]
  );

  /**
   * @see https://github.com/netlify/gotrue-js/blob/master/src/index.js#L92
   */
  const acceptInviteExternalUrl = useCallback(
    (provider: Provider) => {
      if (!param.token || param.type !== 'invite') {
        throw new Error(errors.tokenMissingOrInvalid);
      }

      const url = goTrueInstance.acceptInviteExternalUrl(provider, param.token);
      // clean up consumed token
      setParam(defaultParam);

      return url;
    },
    [goTrueInstance, param]
  );

  /******* email auth */
  /**
   * @see https://github.com/netlify/gotrue-js/blob/master/src/index.js#L50
   */
  const signupUser = useCallback(
    (
      email: string,
      password: string,
      data: Object,
      directLogin: boolean = true
    ) =>
      goTrueInstance.signup(email, password, data).then(user => {
        if (directLogin) {
          return _setUser(user);
        }

        return user;
      }),
    [goTrueInstance, _setUser]
  );

  /**
   * @see https://github.com/netlify/gotrue-js/blob/master/src/index.js#L57
   */
  const loginUser = useCallback(
    (email: string, password: string, remember: boolean = true) =>
      goTrueInstance.login(email, password, remember).then(_setUser),
    [goTrueInstance, _setUser]
  );

  /**
   * @see https://github.com/netlify/gotrue-js/blob/master/src/index.js#L80
   */
  const requestPasswordRecovery = useCallback(
    (email: string) => goTrueInstance.requestPasswordRecovery(email),
    [goTrueInstance]
  );

  /**
   * @see https://github.com/netlify/gotrue-js/blob/master/src/index.js#L87
   */
  const recoverAccount = useCallback(
    (remember?: boolean) => {
      if (!param.token || param.type !== 'recovery') {
        throw new Error(errors.tokenMissingOrInvalid);
      }

      return goTrueInstance
        .recover(param.token, remember)
        .then(user => {
          return _setUser(user);
        })
        .finally(() => {
          // clean up consumed token
          setParam(defaultParam);
        });
    },
    [goTrueInstance, _setUser, param]
  );

  /**
   * @see https://github.com/netlify/gotrue-js/blob/master/src/user.js#L54
   */
  const updateUser = useCallback(
    (fields: object) => {
      if (!user) {
        throw new Error(errors.noUserFound);
      }

      return user!
        .update(fields) // e.g. { email: "example@example.com", password: "password" }
        .then(_setUser);
    },
    [user]
  );

  /**
   * @see https://github.com/netlify/gotrue-js/blob/master/src/user.js#L63
   */
  const getFreshJWT = useCallback(() => {
    if (!user) {
      throw new Error(errors.noUserFound);
    }

    return user.jwt();
  }, [user]);

  /**
   * @see https://github.com/netlify/gotrue-js/blob/master/src/user.js#L71
   */
  const logoutUser = useCallback(() => {
    if (!user) {
      throw new Error(errors.noUserFound);
    }

    return user.logout().then(() => _setUser(undefined));
  }, [user]);

  const genericAuthedFetch = (method: string) => (
    endpoint: string,
    options: RequestInit = {}
  ) => {
    if (!user?.token?.access_token) {
      throw new Error(errors.noUserTokenFound);
    }

    const defaultObj = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + user.token.access_token,
      },
    };
    const finalObj = Object.assign(defaultObj, { method }, options);

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
    setUser: _setUser,
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
    param,
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
  const ctx = createContext<A | undefined>(undefined);
  function useCtx() {
    const c = useContext(ctx);
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
