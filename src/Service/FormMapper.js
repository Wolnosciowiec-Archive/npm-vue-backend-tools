/**
 * Maps a current request to the form inputs
 * eg. ?page=123
 *
 * Input named eg. "search_form[page_number]" could be assigned with the "123" if mapped
 * Works only with Vue.js router
 *
 * Example use case:
 *   fillTheFormFromRequest: function () {
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
        }
 */

class FormMapper {
  static mapForm (mappedValues, form, route, refs) {
    for (let key in route.query) {
      if (!mappedValues.hasOwnProperty(key)) {
        continue
      }

      let input = refs[mappedValues[key]]
      let value = route.query[key]

      if (typeof input === 'undefined') {
        console.warn('[FormMapper] ' + mappedValues[key] + ' does not seem to exist in the document')
        return
      }

      // multiple-value widgets like <input type="radio">
      if (input instanceof window.HTMLInputElement && input.type === 'radio') {
        input = FormMapper.findFormInput(form, input.name, value)
        input.checked = true
        continue
      }

      // map query -> form
      input.value = value
    }
  }

  static findFormInput (form, inputName, value) {
    for (let k in form) {
      let input = form[k]

      if (input instanceof window.HTMLElement &&
        input.name === inputName &&
        input.value === value) {
        return input
      }
    }
  }
}

module.exports = FormMapper
