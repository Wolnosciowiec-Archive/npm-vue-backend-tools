/**
 * Vue.js 2 / Vuex module
 * Adds a support for backend calling with multiple backends support, advanced caching objects using store
 */

const PermanentStore = require('./Store/PermanentStore.js').default
const SessionStore = require('./Store/SessionStore.js').default
const VuexStore = require('./Store/VuexStore.js').default
const VoidStore = require('./Store/VoidStore.js').default

const state = {
  elementsReferencesPerPage: {},
  elementsByType: {},
  pagesMeta: {}
}

function createStoreManager (name, state) {
  if (name === 'permanent') {
    return new PermanentStore()
  } else if (name === 'session') {
    return new SessionStore()
  } else if (name === 'void') {
    return new VoidStore()
  }

  return new VuexStore(state)
}

// getters

/**
 * Get collection part for specific page that was already fetched from backend
 *
 * @param state
 * @returns {Function}
 */
const getPageData = function (state) {
  return function (pageId, collectionType, storeType) {
    let results = []
    let storeManager = createStoreManager(storeType, state)

    // data from store
    let elementsReferencesPerPage = storeManager.get('elementsReferencesPerPage', {})
    let elementsByType = storeManager.get('elementsByType', {})
    let pagesMeta = storeManager.get('pagesMeta', {})

    if (typeof elementsReferencesPerPage[pageId] === 'undefined') {
      return {
        'elements': [],
        'meta': null,
        '__err': 'Not found'
      }
    }

    for (let key in elementsReferencesPerPage[pageId]) {
      results.push(elementsByType[collectionType][elementsReferencesPerPage[pageId][key]])
    }

    return {
      'elements': results,
      'meta': pagesMeta[pageId] ? pagesMeta[pageId] : null
    }
  }
}

/**
 * Get single element if fetched from backend before
 *
 * @param state
 * @returns {Function}
 */
const getSingleElementData = function (state) {
  return function (id, collectionType) {
    if (typeof state.elementsByType[collectionType] === 'undefined') {
      return null
    }

    return (typeof state.elementsByType[collectionType][id] !== 'undefined') ? state.elementsByType[collectionType][id] : null
  }
}

const mutations = {

  /**
   * Export collection data from backend to store
   * so every element could be indexed and accessible later
   * for other pages that use same entities
   *
   * @param state
   * @param args
   */
  exportDataForPage (state, args) {
    let pageId = args.pageId
    let meta = args.meta
    let elements = args.elements
    let collectionType = args.collectionType
    let storeType = args.hasOwnProperty('storeType') ? args.storeType : 'store'
    let storeManager = createStoreManager(storeType, state)

      // globally indexed data in the store
    let elementsReferencesPerPage = storeManager.get('elementsReferencesPerPage', {})
    let pagesMeta = storeManager.get('pagesMeta', {})
    let elementsByType = storeManager.get('elementsByType', {})

    elementsReferencesPerPage[pageId] = []
    pagesMeta[pageId] = meta

    for (let index in elements) {
      let element = elements[index]
      elementsReferencesPerPage[pageId].push(element.id)

      if (typeof elementsByType[collectionType] === 'undefined') {
        elementsByType[collectionType] = {}
      }

      elementsByType[collectionType][element.id] = element
    }

    storeManager.set({
      'elementsReferencesPerPage': elementsReferencesPerPage,
      'pagesMeta': pagesMeta,
      'elementsByType': elementsByType
    })
  }
}

export default {
  mutations,
  state,

  getters: {
    getPageData,
    getSingleElementData
  }
}
