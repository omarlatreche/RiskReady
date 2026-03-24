import { localApi } from './api.local'
import { remoteApi, setRemoteUserId, setRemoteOrgId } from './api.remote'

let _useRemote = false

export function setApiMode(remote) {
  _useRemote = remote
}

export { setRemoteUserId, setRemoteOrgId }

export const api = new Proxy({}, {
  get(_, method) {
    const backend = _useRemote ? remoteApi : localApi
    const fn = backend[method]
    if (typeof fn === 'function') {
      return (...args) => fn.apply(backend, args)
    }
    // Fallback: if method missing on current backend, try the other
    const fallback = _useRemote ? localApi : remoteApi
    const fallbackFn = fallback[method]
    if (typeof fallbackFn === 'function') {
      return (...args) => fallbackFn.apply(fallback, args)
    }
    return fn
  },
})
