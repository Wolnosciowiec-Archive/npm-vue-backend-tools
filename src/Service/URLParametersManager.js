
/**
 * Manages parameters in the URL
 * - Allows to add or delete values in lists
 * - Allows to keep some keys in the local storage for persistent settings
 *
 * Example use case (from Wolnosciowiec.org flash view):
 *  - There are filters that are visible in the URL
 *  - But there are ALSO filters that are persistent, kept in the local storage eg. "Never show from this source"
 */
class URLParametersManager {
  constructor (parameters) {
    this.parameters = parameters
    this.permanent = new PermanentParametersManager()
  }

  setParameters (parameters) {
    this.parameters = Object.assign({}, parameters)
  }

  /**
   * Sets an explicit value
   * eg. entry = value
   *
   * @param name
   * @param value
   */
  setParameter (name, value) {
    this.parameters[name] = value
  }

  /**
   * Manages a list type entry, appends an element
   * eg. entry[] = value
   *
   * @param parameterName
   * @param value
   */
  appendValueToParameter (parameterName, value) {
    this._assertParameterIsArray(parameterName)
    this.parameters[parameterName].push(value)
  }

  /**
   * Removes an element from array
   * eg. delete parameter[1] where 1 is index of found value
   *
   * @param parameterName
   * @param value
   */
  deleteValueFromParameter (parameterName, value) {
    this._assertParameterIsArray(parameterName)
    let foundAt = this.parameters[parameterName].indexOf(value)

    if (foundAt) {
      delete this.parameters[parameterName][foundAt]
    }
  }

  /**
   * Assert that parameter is array
   *   - If it does not exists then create an array
   *   - If it exists and is not an array, throw an exception
   *
   * @param parameterName
   * @param pageId
   * @private
   */
  _assertParameterIsArray (parameterName, pageId) {
    if (!this.hasParameter(parameterName, pageId)) {
      this.setParameter(parameterName, [])
    }

    if (!this.getParameters(pageId)[parameterName].hasOwnProperty('length')) {
      throw new Error('Parameter "' + parameterName + '" seems to not be a list, cannot append to it')
    }
  }

  /**
   * Check if the parameter is present
   *
   * @param name
   * @param pageId
   * @returns {boolean}
   */
  hasParameter (name, pageId) {
    return this.getParameters(pageId).hasOwnProperty(name)
  }

  /**
   * Delete a parameter without throwing a notice
   *
   * @param name
   */
  deleteParameter (name) {
    if (!this.hasParameter(name)) {
      return
    }

    delete this.parameters[name]
  }

  /**
   * Return a parameter value
   *
   * @param name
   * @param pageId
   * @returns {*}
   */
  getParameter (name, pageId) {
    if (!this.hasParameter(name, pageId)) {
      throw new Error('Parameter "' + name + '" does not exists')
    }

    return this.getParameters(pageId)[name]
  }

  /**
   * Return all parameters
   * To exclude non-explicit parameters just do not provide pageId
   *
   * @param pageId
   * @returns {*}
   */
  getParameters (pageId) {
    let tempParam = {}
    let permStruct = this.permanent._getPermanentStructure(pageId)

    for (let key in this.parameters) {
      tempParam[key] = this.parameters[key]
    }

    if (pageId && permStruct) {
      return Object.assign(tempParam, permStruct)
    }

    return tempParam
  }

  /**
   * Build a HTTP query string only from explicit parameters
   *
   * @returns {*}
   */
  buildQueryString () {
    let qs = ''
    let parameters = this.getParameters()

    for (let parameterName in parameters) {
      let value = parameters[parameterName]

      if (typeof value === 'object') {
        for (let subParameter in value) {
          qs += '&' + parameterName + '[]=' + value[subParameter].toString()
        }
        continue
      }

      qs += '&' + parameterName + '=' + value.toString()
    }

    return qs.substr(1)
  }
}

class PermanentParametersManager {
  setPermanentParameter (name, value, pageId) {
    this._createPermanentStructureIfNotExists(pageId)

    let struct = this._getPermanentStructure(pageId)
    struct[name] = value

    this._setPermanentStructure(pageId, struct)
  }

  appendValueToPermanentParameter (parameterName, value, pageId) {
    let struct = this._getPermanentStructure(pageId)

    if (typeof struct[parameterName] === 'undefined') {
      struct[parameterName] = []
    }

    if (struct[parameterName].indexOf(value) !== -1) {
      return
    }

    struct[parameterName].push(value)
    this._setPermanentStructure(pageId, struct)
  }

  /**
   * Returns all parameters for given pageId
   *
   * @param pageId
   * @returns {*}
   * @private
   */
  _getPermanentStructure (pageId) {
    let value = window.localStorage.getItem('url_params_' + pageId)

    if (value !== null) {
      return JSON.parse(value)
    }

    return {}
  }

  /**
   * Commits the permanent structure
   *
   * @param pageId
   * @param value
   * @private
   */
  _setPermanentStructure (pageId, value) {
    window.localStorage.setItem('url_params_' + pageId, JSON.stringify(value))
  }

  /**
   * Creates an empty structure and saves into the storage
   * in case it was not saved in the storage yet
   *
   * @param pageId
   * @private
   */
  _createPermanentStructureIfNotExists (pageId) {
    if (typeof window.localStorage.getItem('url_params_' + pageId) === 'undefined') {
      this._setPermanentStructure(pageId, {})
    }
  }

  deletePermanentValueFromParameter (parameterName, value, pageId) {
    let struct = this._getPermanentStructure(pageId)

    if (typeof struct[parameterName] === 'undefined') {
      struct[parameterName] = []
    }

    let foundAt = struct[parameterName].indexOf(value)

    if (foundAt !== -1) {
      struct[parameterName].splice(foundAt, 1)
      this._setPermanentStructure(pageId, struct)
    }
  }

  deletePermanentParameter (name, pageId) {
    let struct = this._getPermanentStructure(pageId)
    delete struct[name]

    this._setPermanentStructure(pageId, struct)
  }
}

export default URLParametersManager
