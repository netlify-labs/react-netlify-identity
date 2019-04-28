import GoTrue, { User } from "gotrue-js"

/**
 * This code runs on every rerender so keep it light
 * keep checking the current route and do logic based on the route
 * as dictated by netlify identity's communication with us via hashes
 */

const routes = /(confirmation|invite|recovery|email_change)_token=([^&]+)/
const errorRoute = /error=access_denied&error_description=403/
const accessTokenRoute = /access_token=/
const confirmationRoute = /confirmation_token=/

export function runRoutes(gotrue: GoTrue, setUser: (value: User) => User | undefined, remember = true) {
  const hash = (document.location.hash || "").replace(/^#\/?/, "")
  if (!hash) return // early terminate if no hash

  const m = hash.match(routes)
  if (m) {
    // store.verifyToken(m[1], m[2]);
    document.location.hash = ""
  }

  const em = hash.match(errorRoute)
  if (em) {
    // store.openModal("signup");
    document.location.hash = ""
  }

  const am = hash.match(accessTokenRoute)
  if (am) {
    const params = {}
    hash.split("&").forEach(pair => {
      const [key, value] = pair.split("=")
      params[key] = value
    })
    document.location.hash = ""
    // store.openModal("login");
    // store.completeExternalLogin(params);
    gotrue
      .createUser(params, remember)
      .then(setUser)
      .catch(console.error)
  }

  const cm = hash.match(confirmationRoute)
  if (cm) {
    const params = {}
    hash.split("&").forEach(pair => {
      const [key, value] = pair.split("=")
      params[key] = value
    })
    document.location.hash = ""
    // store.openModal("login");
    // store.completeExternalLogin(params);
    gotrue
      .confirm(params["confirmation_token"])
      .then(setUser)
      .catch(console.error)
  }
}
