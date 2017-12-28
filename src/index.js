
export default {
  BackendProvider: require('./Fetcher/BackendProvider.js'),
  PageFetcher: require('./Fetcher/PageFetcher.js'),
  AllowedFrames: require('./Fetcher/AllowedFrames.js'),

  BackendApi: require('./Service/BackendApi.js'),
  FormMapper: require('./Service/FormMapper.js'),
  URLParametersManager: require('./Service/URLParametersManager.js')
}

