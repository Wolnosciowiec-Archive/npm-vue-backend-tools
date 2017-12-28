/**
 * Vuex module that remembers which urls could be showed in an iframe
 */
export default {
  mutations: {
    /**
     * Grant access to previewing an URL in the frame
     *
     * @param state
     * @param url
     */
    allowPageInFrame: function (state, url) {
      if (state.allowedUrls.indexOf(url) > -1) {
        return
      }

      state.allowedUrls.push(url)
    }
  },
  state: {
    allowedUrls: []
  },

  getters: {
    /**
     * Checks if the URL can be previewed in a frame
     *
     * @param state
     * @returns {Function}
     */
    isUrlAllowedInFrame: function (state) {
      return function (url) {
        return state.allowedUrls.indexOf(url) > -1
      }
    }
  }
}
