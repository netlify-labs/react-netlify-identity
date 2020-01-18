import GoTrue, { User } from 'gotrue-js';
import { TokenParam, defaultParam } from './token';

/**
 * This code runs on every rerender so keep it light
 * keep checking the current route and do logic based on the route
 * as dictated by netlify identity's communication with us via hashes
 */

const routes = /(confirmation|invite|recovery|email_change|access)_token=([^&]+)/;
const errorRoute = /error=access_denied&error_description=403/;

const reduceHashToKeyValue = (hash: string): { [key: string]: string } =>
  hash.split('&').reduce((carry, pair) => {
    const [key, value] = pair.split('=');

    return { ...carry, [key]: value };
  }, {});

const hashReplace = /^#\/?/;

export function runRoutes(
  gotrue: GoTrue,
  setUser: (value: User) => User | undefined,
  remember = true
): TokenParam {
  // early terminate if no hash
  // also accounts for document.cookie further down
  if (!document?.location?.hash) {
    return defaultParam;
  }

  const hash = document.location.hash.replace(hashReplace, '');

  try {
    history.pushState(
      '',
      document.title,
      window.location.pathname + window.location.search
    );
  } catch (_) {
    window.location.href.substr(0, window.location.href.indexOf('#'));
  }

  // earliest possible bail on any match
  if (hash.match(errorRoute)) {
    return {
      ...defaultParam,
      error: 'access_denied',
      status: 403,
    };
  }

  const matchesActionHashes = hash.match(routes);

  if (matchesActionHashes) {
    const params = reduceHashToKeyValue(hash);

    if (params.confirmation_token) {
      gotrue
        .confirm(params.confirmation_token)
        .then(setUser)
        .catch(console.error);

      // dont notify dev as this package does not export its own method for this
      return defaultParam;
    }

    if (params.access_token) {
      document.cookie = `nf_jwt=${params.access_token}`;

      gotrue
        .createUser(params, remember)
        .then(setUser)
        .catch(console.error);

      // also dont notify dev here for the same reasons as above
      return defaultParam;
    }

    // pass responsibility to dev in all other cases
    return {
      ...defaultParam,
      type: matchesActionHashes[1] as TokenParam['type'],
      token: matchesActionHashes[2],
    };
  }

  return defaultParam;
}
