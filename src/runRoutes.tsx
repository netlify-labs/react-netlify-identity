import GoTrue, { User } from 'gotrue-js';
import { TokenParam, defaultParam } from './token';

/**
 * This code runs on every rerender so keep it light
 * keep checking the current route and do logic based on the route
 * as dictated by netlify identity's communication with us via hashes
 */

const routes = /(confirmation|invite|recovery|email_change)_token=([^&]+)/;
const errorRoute = /error=access_denied&error_description=403/;
const accessTokenRoute = /access_token=/;
const confirmationRoute = /confirmation_token=/;

export function runRoutes(
  gotrue: GoTrue,
  setUser: (value: User) => User | undefined,
  remember = true
): TokenParam {
  // early terminate if no hash
  if (!document?.location?.hash) {
    return defaultParam;
  }

  const hash = document.location.hash.replace(/^#\/?/, '');

  const m = hash.match(routes);
  if (m) {
    // store.verifyToken(m[1], m[2]);
    document.location.hash = '';
  }

  const em = hash.match(errorRoute);
  if (em) {
    // store.openModal("signup");
    document.location.hash = '';
  }
  const params = {} as { [key: string]: string };
  hash.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    params[key] = value;
  });

  const am = hash.match(accessTokenRoute);
  if (am) {
    if (!!document && params.access_token) {
      document.cookie = `nf_jwt=${params.access_token}`;
    }
    document.location.hash = '';
    // store.openModal("login");
    // store.completeExternalLogin(params);
    gotrue
      .createUser(params, remember)
      .then(setUser)
      .catch(console.error);
  }

  const cm = hash.match(confirmationRoute);
  if (cm) {
    document.location.hash = '';
    // store.openModal("login");
    // store.completeExternalLogin(params);
    gotrue
      .confirm(params.confirmation_token)
      .then(setUser)
      .catch(console.error);
  }

  if (m) {
    return {
      ...defaultParam,
      type: m[1] as TokenParam['type'],
      token: m[2],
    };
  }

  if (em) {
    return {
      ...defaultParam,
      error: 'access_denied',
      status: 403,
    };
  }

  return defaultParam;
}
