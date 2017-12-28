
class VuexStore {
  constructor (state) {
    this.state = state
  }

  set (keys) {
    for (let key in keys) {
      this.state[key] = keys[key]
    }
  }

  get (key, defaultValue) {
    return typeof this.state[key] === 'undefined' ? defaultValue : this.state[key]
  }
}

export default VuexStore
