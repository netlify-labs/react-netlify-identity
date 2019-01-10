import React from 'react';

import GoTrue, { User } from 'gotrue-js';

type authChangeParam = (user?: User) => string | void;

interface NIProps {
  children: any;
  domain: string;
  onAuthChange?: authChangeParam;
}
const NetlifyIdentity = ({ children, domain, onAuthChange }: NIProps) =>
  children(useNetlifyIdentity(domain, onAuthChange));

export default NetlifyIdentity;
export function useNetlifyIdentity(
  domain: string,
  onAuthChange: authChangeParam = () => {}
) {
  const goTrueInstance = new GoTrue({
    APIUrl: `${domain}/.netlify/identity`,
    setCookie: true
  });

  const [user, setUser] = React.useState<User | undefined>(undefined);
  const _setUser = (_user: User | undefined) => {
    setUser(_user);
    onAuthChange(_user); // if someone's subscribed to auth changes, let 'em know
    return _user; // so that we can continue chaining
  };
  /******* OPERATIONS */
  // make sure the Registration preferences under Identity settings in your Netlify dashboard are set to Open.
  const signupUser = (email: string, password: string, data: Object) =>
    goTrueInstance.signup(email, password, data).then(_setUser); // TODO: make setUser optional?
  const loginUser = (email: string, password: string) =>
    goTrueInstance.login(email, password).then(_setUser);
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
        Authorization: 'Bearer ' + user.token.access_token
      }
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
    delete: genericAuthedFetch('DELETE')
  };

  // // confirmation
  // http://lea.verou.me/2011/05/get-your-hash-the-bulletproof-way/
  React.useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash.slice(0, 19) === 'confirmation_token=') {
      // we are in a confirmation!
      const token = hash.slice(19);
      goTrueInstance
        .confirm(token)
        .then(_setUser)
        .catch(console.error);
      // .then(
      //   () =>
      //     (window.location =
      //       window.location.origin + window.location.pathname) // strip hash
      // )
    }
  }, []);

  /******* hook API */
  return {
    user,
    setUser, // use carefully!! mostly you should use the methods below
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
    _domain: domain
  };
}
