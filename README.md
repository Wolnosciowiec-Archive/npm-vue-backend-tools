Vue Backend Tools
=================

Allows to call multiple backends, supports caching.

Features:
- Cache listings, reusable objects that only have to implement "id" field
- Multiple backends
- Custom headers per all backend calls
- Authorization per backend

### Created for wolnosciowiec.org

#### Example bootstrap

```js
/*
 * Initialize core classes used to interact with backend
 */
const backend = new BackendApi({
  'wolnosciowiec': {
    'url': isDevEnvironment() ? 'http://localhost' : 'https://wolnosciowiec.net',
    'authorization': ''
  },

  'news-feed-provider': {
    'url': isDevEnvironment() ? 'http://nfp.localhost/dev' : 'https://nfp.wolnosciowiec.net',
    'authorization': ''
  }
})

const pageFetcher = new PageFetcher(backend)

// Enable devtools
Vue.config.devtools = true
sync(store, router)

const nprogress = new NProgress({ parent: '.nprogress-container' })

const app = new Vue({
  router,
  store,
  nprogress,
  ...App,
  beforeCreate: function () {
    pageFetcher.setStore(this.$store)
    URLParametersManager.setParameters(this.$route.query)
  },
  watch: {
    $route () {
      URLParametersManager.setParameters(this.$route.query)
    }
  },
  provide: {
    'backend': backend,
    'pageFetcher': pageFetcher,
    'parameterManager': URLParametersManager
  }
})

export { app, router, store }
```

#### FormMapper.js

Maps attributes from router (URL) to the HTML form.

Example:
```js
FormMapper.mapForm(
  {
    'event_search_form[query]': 'form_query',
    'event_search_form[event_type][]': 'form_event_type',
    'event_search_form[start_date]': 'form_start_date',
    'event_search_form[end_date]': 'form_end_date',
    'event_search_form[place]': 'form_place',
    'event_search_form[city]': 'form_city',
    'event_search_form[country]': 'form_country',
    'when': 'form_when'
  },
  this.$refs.form,
  this.$route,
  this.$refs
)
```

#### BackendApi.js

Calls endpoints to get the data from backends.
A simple HTTP client, based on the Axios.

```js
this.backend.get({
  service: 'wolnosciowiec',
  path: '/api/events/overview/by-category',
  callback: function (response) {
    rThis.categories = response.data.data
    rThis.$store.commit('exportDataForPage', {
      'elements': response.data.data,
      'meta': {},
      'pageId': storeName,
      'collectionType': CollectionType
    })
  }
})
```

#### PageFetcher.js

It's a extended `BackendApi` with addition of the store support.
You can group response objects into collection, so for example when
a listing page will return "A", "B", "C" and then you want to see "A" in a 
different view then you can still access it from the store.

There are 3 store types:
- vuex (data is erased after page refresh)
- persistent (data kept forever, eg. a complete list of countries, does not need to be updated frequently)
- session (same here, but will disappear after the browser will be closed)

```js
this.pageFetcher.fetch({
  service: 'wolnosciowiec',
  path: '/api/information/' + pageId,
  collectionType: 'StaticPage',
  storeType: 'vuex',
  pageId: 'StaticPage_' + pageId,
  onComplete: function (response) {
    rThis.page = response.data.data
    rThis.isLoaderActive = false
  },
  onCached: function (data) {
    rThis.page = data[0]
    rThis.isLoaderActive = false
  },
  onElementsStore: function (response) { return [response.data.data] }
})
```

#### BackendProvider

An extension to the Vuex.

###### getPageData 

Fetches previously cached page.

```js
let data = this.$store.getters.getPageData(storeName, 'Post')

if (data.elements.length === 0) {
    // ...
}
```

###### getSingleElementData

Returns a single element from a page that was already cached.

###### exportDataForPage

Pushes data to the store, under a given `pageId` of specified `collectionType`, with some `meta` attributes like
information about the pagination or some other elements that are additionally on the page.

```js
rThis.$store.commit('exportDataForPage', {
  'elements': posts,
  'meta': response.data.pagination,
  'pageId': storeName,
  'collectionType': 'Post'
})
```
