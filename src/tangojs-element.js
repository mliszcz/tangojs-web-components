(function (window) {
  'use strict'

  const console = window.console

  /** Composition of various mixins with tango-related logic. */
  function TangoJsElement() { }

  window.TangoJsElement = TangoJsElement

  /** Element with polled model.
   * Expected properties: pollPeriod: number, model: string | string[]
   * Adds onModelChange method which should be wired to attribute.
   * @param {Object}   proxyConstructor constructor for proxies
   * @param {Function} dataConsumer     function called on interval
   * @param {Function} changeCallback   callback for model change
   */
  TangoJsElement.withPolledModel = function (proxyConstructor,
                                             onAttributesRead,
                                             onAttributesError,
                                             changeCallback) {

    const timer = Symbol()
    const proxy = Symbol()

    onAttributesError = onAttributesError || ((e) => console.error(e))

    Object.defineProperty(this, 'proxy', {
      configurable: false,
      get: function () { return this[proxy] }
    })

    this.onModelChange = function (model) {
      this.createAttributeProxies(Array.isArray(model) ? model : [model])
      this.restartPollingTimer()
      if (changeCallback) {
        changeCallback.call(this, model)
      }
    }

    this.createAttributeProxies = function (modelArray) {
      this[proxy] = modelArray.map(model => {
        const [_, devname, name] = model.match(/^(.+)\/([A-Za-z0-9_]+)$/)
        return new (Function.prototype.bind.call(proxyConstructor,
                                                 {},
                                                 devname,
                                                 name))
      })
    }

    this.restartPollingTimer = function () {

      if (this[timer]) {
        clearInterval(this[timer])
      }

      this[timer] = setInterval(() => {

        Promise.all(this[proxy].map(proxy => proxy.read()))
          .then(deviceAttributes => {
            onAttributesRead.call(this, deviceAttributes)
          })
          .catch(error => {
            onAttributesError.call(this, error)
          })
      }, this.pollPeriod)
    }

  }

})(window)
