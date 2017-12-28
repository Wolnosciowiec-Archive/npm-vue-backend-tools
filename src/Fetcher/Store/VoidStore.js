
class VoidStore {
  set (keys) { return {} }

  get (key, defaultValue) { return defaultValue }
}

export default VoidStore
