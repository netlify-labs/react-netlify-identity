import React from "react"
import { Router, Link, navigate } from "@reach/router"
import "./App.css"
import { useNetlifyIdentity, Settings } from "react-netlify-identity"
import useLoading from "./useLoading"

let IdentityContext = React.createContext<ReturnType<typeof useNetlifyIdentity>>(undefined!)
type MaybePathProps = { path?: string }
function PrivateRoute(props: React.PropsWithoutRef<MaybePathProps & { as: React.ComponentType<MaybePathProps> }>) {
  const identity = React.useContext(IdentityContext)
  let { as: Comp } = props
  return identity.user ? (
    <Comp />
  ) : (
    <div>
      <h3>You are trying to view a protected page. Please log in</h3>
      <Login />
    </div>
  )
}

function Login({  }: MaybePathProps) {
  const { loginUser, signupUser, settings, loginProvider } = React.useContext(IdentityContext)
  const formRef = React.useRef<HTMLFormElement>(null!)
  const [msg, setMsg] = React.useState("")
  const [isLoading, load] = useLoading()
  const [setting, setSetting] = React.useState<Settings | null>(null)
  React.useEffect(() => {
    settings().then(x => setSetting(x))
  }, [])
  const signup = () => {
    const email = formRef.current.email.value
    const password = formRef.current.password.value
    load(signupUser(email, password, { data: "signed up thru react-netlify-identity" }))
      .then(user => {
        console.log("Success! Signed up", user)
        navigate("/dashboard")
      })
      .catch(err => void console.error(err) || setMsg("Error: " + err.message))
  }
  return (
    <form
      ref={formRef}
      onSubmit={e => {
        e.preventDefault()
        const email = formRef.current.email.value
        const password = formRef.current.password.value
        load(loginUser(email, password))
          .then(user => {
            console.log("Success! Logged in", user)
            navigate("/dashboard")
          })
          .catch(err => void console.error(err) || setMsg("Error: " + err.message))
      }}
    >
      <div>
        <label>
          Email:
          <input type="email" name="email" />
        </label>
      </div>
      <div>
        <label>
          Password:
          <input type="password" name="password" />
        </label>
      </div>
      {isLoading ? (
        <Spinner />
      ) : (
        <div>
          <input type="submit" value="Log in" />
          <button onClick={signup}>Sign Up </button>
          {msg && <pre>{msg}</pre>}
        </div>
      )}
      {setting && <pre>{JSON.stringify(setting, null, 2)}</pre>}
      {setting && setting.external.github && <div onClick={() => loginProvider("github")}>GitHub</div>}
    </form>
  )
}

function Home({  }: MaybePathProps) {
  return (
    <div>
      <h3>Welcome to the Home page!</h3>
      <p>
        this is a <b>Public Page</b>, not behind an authentication wall
      </p>
      <div style={{ backgroundColor: "#EEE", padding: "1rem" }}>
        <div>
          <a
            href={`https://app.netlify.com/start/deploy?repository=https://github.com/netlify/create-react-app-lambda/tree/reachRouterAndGoTrueDemo&stack=cms`}
          >
            <img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify" />
          </a>
        </div>
        This demo is{" "}
        <a href="https://github.com/netlify/create-react-app-lambda/tree/reachRouterAndGoTrueDemo">Open Source.</a>{" "}
      </div>
    </div>
  )
}

function About({  }: MaybePathProps) {
  return <div>About</div>
}

function Dashboard({  }: MaybePathProps) {
  const props = React.useContext(IdentityContext)
  const { isConfirmedUser, authedFetch } = props
  const [isLoading, load] = useLoading()
  const [msg, setMsg] = React.useState("Click to load something")
  const handler = () => {
    load(authedFetch.get("/.netlify/functions/authEndPoint")).then(setMsg)
  }
  return (
    <div>
      <h3>This is a Protected Dashboard!</h3>
      {!isConfirmedUser && (
        <pre style={{ backgroundColor: "papayawhip" }}>
          You have not confirmed your email. Please confirm it before you ping the API.
        </pre>
      )}
      <hr />
      <div>
        <p>You can try pinging our authenticated API here.</p>
        <p>If you are logged in, you should be able to see a `user` info here.</p>
        <button onClick={handler}>Ping authenticated API</button>
        {isLoading ? <Spinner /> : <pre>{JSON.stringify(msg, null, 2)}</pre>}
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div className="sk-folding-cube">
      <div className="sk-cube1 sk-cube" />
      <div className="sk-cube2 sk-cube" />
      <div className="sk-cube4 sk-cube" />
      <div className="sk-cube3 sk-cube" />
    </div>
  )
}
function Nav() {
  const { isLoggedIn } = React.useContext(IdentityContext)
  return (
    <nav>
      <Link to="/">Home</Link> | <Link to="dashboard">Dashboard</Link>
      {" | "}
      <span>{isLoggedIn ? <Logout /> : <Link to="login">Log In/Sign Up</Link>}</span>
    </nav>
  )
}
function Logout() {
  const { logoutUser } = React.useContext(IdentityContext)
  return <button onClick={logoutUser}>You are signed in. Log Out</button>
}

function App() {
  // TODO: SUPPLY A URL EITHER FROM ENVIRONMENT VARIABLES OR SOME OTHER STRATEGY
  // e.g. 'https://unruffled-roentgen-04c3b8.netlify.com'
  const domainToUse =
    new URL(window.location.origin).hostname === "localhost"
      ? "http://react-netlify-identity.netlify.com"
      : window.location.origin
  const [url, setUrl] = React.useState(domainToUse)
  const identity = useNetlifyIdentity(url)
  console.log({ identity, url })
  return (
    <IdentityContext.Provider value={identity}>
      <div className="App">
        <div className="Appheader">
          <h1 className="title">
            <span>Netlify Identity</span>
            <span className="italic">&</span> <span>Reach Router</span>
          </h1>
          <label>
            <a href="https://www.netlify.com/docs/identity/">Netlify Identity</a> Instance:{" "}
            <input
              type="text"
              placeholder="your instance here e.g. https://unruffled-roentgen-04c3b8.netlify.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
              size={50}
            />
            <div>
              <div style={{ display: "inline-block" }}>
                {window.location.hostname === "localhost" ? (
                  <pre>WARNING: this demo doesn't work on localhost</pre>
                ) : (
                  <pre>your instance here e.g. https://unruffled-roentgen-04c3b8.netlify.com</pre>
                )}
              </div>
            </div>
          </label>
        </div>
        <Nav />
        <Router>
          <Home path="/" />
          <About path="/about" />
          <Login path="/login" />
          <PrivateRoute as={Dashboard} path="/dashboard" />
        </Router>
      </div>
    </IdentityContext.Provider>
  )
}

export default App
