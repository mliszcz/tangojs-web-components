(function (window) {
  'use strict'

  const console = window.console
  const document = window.document

  /** Composition of various mixins with tango-related logic. */
  function TangoJsElement() { }

  window.TangoJsElement = TangoJsElement

  window.tangojsWebComponents = window.tangojsWebComponents || {}

  /** Wrapper around WebComponentElement.registerComponent.
   * @param {Object} constructor function
   * @param {string} custom element name
   */
  TangoJsElement.registerComponent = function (constructor,
                                               htmlElementName) {
    WebComponentElement.registerComponent(window,
                                          window.tangojsWebComponents,
                                          constructor,
                                          htmlElementName)
  }

  /** Element with polled model.
   * Expected properties: pollPeriod: number, model: string | string[].
   * Expected callbacks: createProxy(model), readProxy(proxy).
   * Optional callbacks: onModelRead(results), onModelError(error).
   * @param {Function} proxyCall function invoked on proxy
   */
  TangoJsElement.withPolledModel = function (proxyCall) {

    const timer = Symbol()
    const proxy = Symbol()

    if (!this.onModelRead) {
      this.onModelRead = function () {}
    }

    if (!this.onModelError) {
      this.onModelError = function (error) {
        console.error(error)
      }
    }

    Object.defineProperty(this, 'proxy', {
      configurable: false,
      get: function () { return this[proxy] }
    })

    this.onModelChange = function (model) {
      this[proxy] = (Array.isArray(model) ? model : [model]).map(m => {
        return this.createProxy(m)
      })
      this.restartPollingTimer()
    }

    this.onPollPeriodChange = function (pollPeriod) {
      this.restartPollingTimer()
    }

    this.restartPollingTimer = function () {

      if (this[timer]) {
        clearInterval(this[timer])
      }

      this[timer] = setInterval(() => {

        Promise.all(this[proxy].map(p => this.readProxy(p)))
          .then(results => {
            this.onModelRead(results)
          })
          .catch(error => {
            this.onModelError(error)
          })
      }, this.pollPeriod)
    }

  }

  /** Marks prototoype as tangojs-form element. */
  TangoJsElement.withFormElement = function () {

    const column = (width) => `[col] ${width} [gutter] 10px`

    this.createFormGrid = function (formSlots = 5) {
      const grid = document.createElement('div')
      Object.assign(grid.style, {
        display: 'grid',
        // gridTemplateColumns: `repeat(${formSlots}, [col] 1fr [gutter] 10px)`,
        gridTemplateColumns:
          `${column('2fr')}
          ${column('1fr')}
          ${column('1fr')}
          ${column('30px')}
          ${column('20px')}`,
        gridTemplateRows: 'auto',
        gridAutoFlow: 'column'
      })
      return grid
    }

    this.createFormField = function (name, pos, span = 1) {
      const element = document.createElement(name)
      Object.assign(element.style, {
        gridColumn: `col ${pos} / span gutter ${span}`,
        display: 'block-inline',
        boxSizing: 'border-box',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        minWidth: '1px'
      })
      return element
    }

    this.createFlexFormField = function (name, pos, span = 1) {
      const flex = this.createFormField('div', pos, span)
      const element = document.createElement(name)
      flex.style.display = 'flex'
      element.style.flex = '1'
      flex.appendChild(element)
      return { flex, element }
    }

  }

})(window)
