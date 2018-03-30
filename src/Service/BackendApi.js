
let axios = require('axios')

/**
 * Wrapper to the AXIOS library, makes requests to the backend
 *
 * Adds support for:
 *   - Multiple services definition (base urls, authorization)
 *   - Custom headers defined for all requests
 */
class BackendApi {
  /**
   * Example services input:
   * {
   *     "wolnosciowiec": {"url": "https://wolnosciowiec.org", "headers": {"X-Something": "value"}, "error_handler": function (error, args) { }}
   * }
   *
   * @param [{url: string, headers: Array, error_handler: function}] services
   */
  constructor (services) {
    this.services = services
  }

  /**
   * POST request to the backend server
   *
   * @param {{service: string, path: string, callback: function, headers: Object, data: Object}} args
   */
  post (args) {
    args.method = 'post'
    return this.request(args)
  }

  /**
   * Make GET request to the backend server
   *
   * @param {{service: string, path: string, callback: function, headers: Object, data: Object}}  args
   */
  get (args) {
    args.method = 'get'
    return this.request(args)
  }

  /**
   * @param {{method: string, service: string, path: string, callback: function, headers: Object, data: Object}} args
   */
  request (args) {
    let method = args.hasOwnProperty('method') ? args.method.toLowerCase() : 'get'
    let service = args.service
    let path = args.hasOwnProperty('path') ? args.path : '/'
    let callback = args.hasOwnProperty('callback') ? args.callback : function () { }
    let headers = args.hasOwnProperty('headers') ? args.headers : {}
    let data = args.hasOwnProperty('data') ? args.data : ''

    axios({
      method: method,
      url: this.getServiceParameter(service, 'url') + path,
      data: data,
      headers: Object.assign(this.getServiceParameter(service, 'headers', {}), headers)
    })
      .then(callback)
      .catch(function (error) {
        console.error('HTTP Error:', error)

        let errorHandler = this.getServiceParameter(service, 'error_handler', null)

        if (errorHandler !== null) {
          errorHandler(error, args)
        }
      })
  }

  /**
   * Get a parameter from service configuration
   * eg. url, headers, authorization
   *
   * @param service
   * @param parameterName
   * @param defaultValue
   *
   * @returns {*}
   */
  getServiceParameter (service, parameterName, defaultValue) {
    if (typeof this.services[service] !== 'object') {
      throw new Error('Service does not exists')
    }

    if (!this.services[service].hasOwnProperty(parameterName)) {
      return defaultValue
    }

    return this.services[service][parameterName]
  }
}

export default BackendApi
