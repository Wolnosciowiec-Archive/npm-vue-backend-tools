
class PermanentStore {
  set (keys) {
    for (let key in keys) {
      window.localStorage.setItem(key, JSON.stringify(keys[key]))
    }
  }

  get (key, defaultValue) {
    let value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : defaultValue
  }
}

export default PermanentStore
