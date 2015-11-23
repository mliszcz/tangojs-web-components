(function (window) {
  'use strict'

  /*
  why ctor is not called:
  https://www.polymer-project.org/1.0/docs/devguide/registering-elements.html#custom-constructor
  */

  var document = window.document
  var currentDocument =
    (document._currentScript || document.currentScript).ownerDocument

  var template = currentDocument.querySelector('template')

  class TangoJsLabelElement extends window.TangoJsElement {

    constructor() { }

    createdCallback() {
      this.createInnerDOM()
      this.setupAttributes()
    }

    /** @private */
    createInnerDOM() {
      var clone = document.importNode(template.content, true)
      this._root = this.createShadowRoot()
      this._root.appendChild(clone)
    }

    /** @private */
    setupAttributes() {
      this.model = this.getAttribute('model') || undefined
      this.poll = parseInt(this.getAttribute('poll') || '1000')
      this.setAttribute('title', this.model)
    }

    /** @private */
    startPolling() {

      if (!this._model) {
        return
      }

      if (this._timer) {
        clearInterval(this._timer)
      }

      var names = this._model.match(/^(.+)\/([A-Za-z0-9_]+)$/)

      this._deviceProxy = new window.tangojs.proxy.DeviceProxy(names[1])
      this._attributeProxy = new window.tangojs.proxy.AttributeProxy(names[1],
                                                                     names[2])

      this._attributeProxy.get_info().then(attributeInfo => {

        this._root.getElementById('name').textContent = attributeInfo.name
        this._root.getElementById('unit').textContent = attributeInfo.unit

        var valueElement = this._root.getElementById('value')
        var inputElement = this._root.getElementById('input')

        inputElement.oninput = (event) => {
          // console.log('event', event.target.value)
          var da = new window.tangojs.struct.DeviceAttribute({
            value: event.target.value
          })
          this._attributeProxy.write(da).then(() =>
            console.log('success'))
        }

        this._timer = setInterval(() => {
          this._attributeProxy.read().then(deviceAttribute => {
            valueElement.textContent = deviceAttribute.value
          })
        }, this.poll)
      })
    }

    get model() {
      return this._model
    }

    set model(value) {
      this._model = value
      this.setAttribute('model', value)
      this.startPolling()
    }

    // TODO configure other properties

    attributeChangedCallback(attrName, oldValue, newValue) {
        this[attrName] = newValue
    }
  }

  TangoJsLabelElement.initialize('tangojs-label')

})(window)
