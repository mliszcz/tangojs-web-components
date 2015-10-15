(function (window) {
  'use strict'

  var document = window.document

  // @see http://www.polymer-project.org/platform/html-imports.html
  // @see https://groups.google.com/d/topic/polymer-dev/4UKty9tb1-s/discussion
  var currentDocument =
    (document._currentScript || document.currentScript).ownerDocument

  var template = currentDocument.querySelector('template')

  class TangoJsLabelElement extends window.TangoJsElement {

    constructor() {
      // FIXME why not called? probably related to:
      // https://www.polymer-project.org/1.0/docs/devguide/registering-elements.html#custom-constructor
      window.console.log('constructor')
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
      this._deviceProxy = new window.tangojs.DeviceProxy(names[1])
      this._attributeProxy = this._deviceProxy.createDeviceAttribute(names[2])

      this._attributeProxy.readInfo().then(result => {

        this._root.getElementById('name').textContent = result._info.name
        this._root.getElementById('unit').textContent = result._info.unit

        var valueElement = this._root.getElementById('value')
        var inputElement = this._root.getElementById('input')

        inputElement.oninput = (event) => {
          // console.log('event', event.target.value)
          this._attributeProxy.writeValue(event.target.value).then(() =>
            console.log('success'))
        }

        this._timer = setInterval(() => {
          this._attributeProxy.readValue().then(result => {
            valueElement.textContent = result.argout
          })
        }, this.poll)
      })
    }

    createdCallback() {
      this.createInnerDOM()
      this.setupAttributes()
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
