import React from "react"

import GoTrue, { User, Settings } from "gotrue-js"
import { runRoutes } from "./runRoutes"

type authChangeParam = (user?: User) => string | void

interface NIProps {
  children: any
  domain: string
  onAuthChange?: authChangeParam
}

export type Settings = Settings
export type User = User
export default function NetlifyIdentity({ children, domain, onAuthChange }: NIProps) {
  return children(useNetlifyIdentity(domain, onAuthChange))
}
export function useNetlifyIdentity(domain: string, onAuthChange: authChangeParam = () => {}) {
  /******** SETUP */
  if (!domain || !validateUrl(domain)) {
    // just a safety check in case a JS user tries to skip this
    throw new Error(
      "invalid netlify instance URL: " + domain + ". Please check the docs for proper usage or file an issue."
    )
  }
  const goTrueInstance = new GoTrue({
    APIUrl: `${domain}/.netlify/identity`,
    setCookie: true
  })

  const [user, setUser] = React.useState<User | undefined>(goTrueInstance.currentUser() || undefined)
  const _setUser = (_user: User | undefined) => {
    setUser(_user)
    onAuthChange(_user) // if someone's subscribed to auth changes, let 'em know
    return _user // so that we can continue chaining
  }

  React.useEffect(() => {
    runRoutes(goTrueInstance, _setUser)
  }, [])

  /******* OPERATIONS */
  // make sure the Registration preferences under Identity settings in your Netlify dashboard are set to Open.
  // https://react-netlify-identity.netlify.com/login#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NTY0ODY3MjEsInN1YiI6ImNiZjY5MTZlLTNlZGYtNGFkNS1iOTYzLTQ4ZTY2NDcyMDkxNyIsImVtYWlsIjoic2hhd250aGUxQGdtYWlsLmNvbSIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImdpdGh1YiJ9LCJ1c2VyX21ldGFkYXRhIjp7ImF2YXRhcl91cmwiOiJodHRwczovL2F2YXRhcnMxLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzY3NjQ5NTc_dj00IiwiZnVsbF9uYW1lIjoic3d5eCJ9fQ.E8RrnuCcqq-mLi1_Q5WHJ-9THIdQ3ha1mePBKGhudM0&expires_in=3600&refresh_token=OyA_EdRc7WOIVhY7RiRw5w&token_type=bearer
  /******* external oauth */
  type Provider = "bitbucket" | "github" | "gitlab" | "google"

  const loginProvider = (provider: Provider) => {
    const url = goTrueInstance.loginExternalUrl(provider)
    if (window) window.location.href = url
  }
  const acceptInviteExternalUrl = (provider: Provider, token: string) =>
    goTrueInstance.acceptInviteExternalUrl(provider, token)
  const settings: () => Promise<Settings> = goTrueInstance.settings.bind(goTrueInstance)

  /******* email auth */
  const signupUser = (email: string, password: string, data: Object) =>
    goTrueInstance.signup(email, password, data).then(_setUser) // TODO: make setUser optional?
  const loginUser = (email: string, password: string, remember: boolean = true) =>
    goTrueInstance.login(email, password, remember).then(_setUser)
  const requestPasswordRecovery = (email: string) => goTrueInstance.requestPasswordRecovery(email)
  const recoverAccount = (token: string, remember?: boolean | undefined) => goTrueInstance.recover(token, remember)
  const updateUser = (fields: Object) => {
    if (user == null) {
      throw new Error("No current user found - are you logged in?")
    } else {
      return user!
        .update(fields) // e.g. { email: "example@example.com", password: "password" }
        .then(_setUser)
    }
  }
  const getFreshJWT = () => {
    if (!user) throw new Error("No current user found - are you logged in?")
    return user.jwt()
  }
  const logoutUser = () => {
    if (!user) throw new Error("No current user found - are you logged in?")
    return user.logout().then(() => _setUser(undefined))
  }

  const genericAuthedFetch = (method: string) => (endpoint: string, obj = {}) => {
    if (!user || !user.token || !user.token.access_token) throw new Error("no user token found")
    const defaultObj = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + user.token.access_token
      }
    }
    const finalObj = Object.assign(defaultObj, { method }, obj)
    return fetch(endpoint, finalObj).then(res =>
      finalObj.headers["Content-Type"] === "application/json" ? res.json() : res
    )
  }
  const authedFetch = {
    get: genericAuthedFetch("GET"),
    post: genericAuthedFetch("POST"),
    put: genericAuthedFetch("PUT"),
    delete: genericAuthedFetch("DELETE")
  }

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
    _domain: domain,
    loginProvider,
    acceptInviteExternalUrl,
    settings
  }
}

function validateUrl(value: string) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
    value
  )
}
