/**
 * Combines use of store and API calls to provide data
 * to views
 */
class PageFetcher {
  constructor (backend) {
    this.backend = backend
  }

  setStore (store) {
    this.store = store
  }

  /**
   * Fetch data to the view
   * using store as a cache and backend as a data provider
   *
   * @param params
   */
  fetch (params) {
    // input parameters
    let pageId = params.pageId
    let service = params.service
    let path = params.path
    let postParams = params.hasOwnProperty('params') ? params.params : ''
    let method = params.hasOwnProperty('method') ? params.method.toLowerCase() : 'get'
    let collectionType = params.collectionType
    let storeType = params.hasOwnProperty('storeType') ? params.storeType : ''
    let onComplete = params.hasOwnProperty('onComplete') ? params.onComplete : function () { window.alert('implement onComplete') }
    let onCached = params.hasOwnProperty('onCached') ? params.onCached : function (data) { window.alert('implement onCached') }
    let onMetaStore = params.hasOwnProperty('onMetaStore') ? params.onMetaStore : function () { return {} }
    let onElementsStore = params.hasOwnProperty('onElementsStore') ? params.onElementsStore : function (response) { return response.data.data }

    // try to get data from the cache (store is used as a cache)
    let data = this.store.getters.getPageData(pageId, collectionType, storeType)

    // on cache miss get the fresh data
    if (data.elements.length === 0) {
      let pThis = this

      this.backend[method]({
        service: service,
        path: path,
        data: postParams,

        callback: function (response) {
          pThis.store.commit('exportDataForPage', {
            elements: onElementsStore(response), // callback: on storing the elements
            meta: onMetaStore(response), // callback: on storing the page metadata
            pageId: pageId,
            collectionType: collectionType,
            storeType: storeType
          })

          // callback: on complete
          onComplete(response)
        }
      })

      return
    }

    // callback: on cached version
    onCached(data)
  }
}

export default PageFetcher
