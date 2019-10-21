import React from "react"

export default function useLoading() {
  const [isLoading, setState] = React.useState(false)
  const mount = React.useRef(false)
  React.useEffect(() => {
    mount.current = true
    return () => void (mount.current = false)
  }, [])
  function load<A>(aPromise: Promise<A>) {
    setState(true)
    return aPromise.finally(() => mount.current && setState(false))
  }
  return [isLoading, load] as [boolean, <A>(aPromise: Promise<A>) => Promise<A>]
}
