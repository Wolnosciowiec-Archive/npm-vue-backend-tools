
class SessionStore {
  set (keys) {
    for (let key in keys) {
      window.sessionStorage.setItem(key, JSON.stringify(keys[key]))
    }
  }

  get (key, defaultValue) {
    let value = window.sessionStorage.getItem(key)
    return value ? JSON.parse(value) : defaultValue
  }
}

export default SessionStore
