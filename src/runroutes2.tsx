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

const hashRegExp = /^#\/?/;

const removeHash = () => {
  history.replaceState(
    '',
    document.title,
    window.location.pathname + window.location.search
  );
};

const reduceHashToKeyValue = (hash: string): { [key: string]: string } =>
  hash.split('&').reduce((carry, pair) => {
    const [key, value] = pair.split('=');

    return { ...carry, [key]: value };
  }, {});

export function runRoutes(
  gotrue: GoTrue,
  setUser: (value: User) => User | undefined,
  remember = true
): TokenParam {
  if (!document.location.hash) {
    return defaultParam;
  }

  const hash = document.location.hash.replace(hashRegExp, '');

  const onboardingMatch = hash.match(routes);
  const errorMatch = hash.match(errorRoute);
  const accessMatch = hash.match(accessTokenRoute);

  const params = reduceHashToKeyValue(hash);

  if (accessMatch) {
    if (!!document && params.access_token) {
      document.cookie = `nf_jwt=${params.access_token}`;
    }

    gotrue
      .createUser(params, remember)
      .then(setUser)
      .catch(console.error);
  }

  const confirmationMatch = hash.match(confirmationRoute);
  if (confirmationMatch) {
    gotrue
      .confirm(params.confirmation_token)
      .then(setUser)
      .catch(console.error);
  }

  removeHash();

  if (onboardingMatch) {
    return {
      ...defaultParam,
      type: onboardingMatch[1] as TokenParam['type'],
      token: onboardingMatch[2],
    };
  }

  if (errorMatch) {
    return {
      ...defaultParam,
      error: 'access_denied',
      status: 403,
    };
  }

  return defaultParam;
}
