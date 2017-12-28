
let axios = require('axios')

/**
 * Wrapper to the AXIOS library, makes requests to the backend
 *
 * Adds support for:
 *   - Multiple services definition (base urls, authorization)
 *   - Authorization per service
 *   - Custom headers defined for all requests
 */
class BackendApi {
  /**
   * Example services input:
   * {
   *     "wolnosciowiec": {"url": "https://wolnosciowiec.org", "authorization": "Bearer ...", "headers": {"X-Something": "value"}}
   * }
   *
   * @param services
   */
  constructor (services) {
    this.services = services
  }

  /**
   * POST request to the backend server
   *
   * @param {Object} args
   */
  post (args) {
    // @todo: Implement authorization and headers
    let service = args.service
    let path = args.hasOwnProperty('path') ? args.path : '/'
    let data = args.hasOwnProperty('data') ? args.data : ''
    let callback = args.hasOwnProperty('callback') ? args.callback : function () { }

    axios({
      method: 'post',
      url: this.getServiceParameter(service, 'url') + path,
      data: data
    })
      .then(callback)
      .catch(function (error) {
        console.error('HTTP Error:', error)
      })
  }

  /**
   * Make GET request to the backend server
   *
   * @param {Object} args
   */
  get (args) {
    let service = args.service
    let path = args.hasOwnProperty('path') ? args.path : '/'
    let callback = args.hasOwnProperty('callback') ? args.callback : function () { }

    console.info('[BackendApi] GET ' + service + ' -> ' + this.getServiceParameter(service, 'url') + path)
    // @todo: Implement authorization and headers

    axios({
      method: 'get',
      url: this.getServiceParameter(service, 'url') + path
    })
      .then(callback)
      .catch(function (error) {
        console.error('HTTP Error:', error)
      })
  }

  /**
   * Get a parameter from service configuration
   * eg. url, headers, authorization
   *
   * @param service
   * @param parameterName
   * @returns {*}
   */
  getServiceParameter (service, parameterName) {
    if (typeof this.services[service] !== 'object') {
      throw new Error('Service does not exists')
    }

    return this.services[service][parameterName]
  }
}

export default BackendApi
