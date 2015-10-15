(function (window) {
  'use strict'

  if (typeof window.tangojs === 'undefined') {
    throw new Error('window.tangojs not found.')
  }

  /**
   * Base class for all TangoJS HTML elements.
   */
  class TangoJsElement extends window.HTMLElement {

    constructor() {
      /* FF does not support default constructor yet */
    }

    /**
     * Performs static initialization and registers the control.
     * This has to be called in each controls JS script.
     * @param {string} tagName
     */
    static initialize(tagName) {

      // FIXME seems that prototype is inaccessible from lifecycle callbacks

      // let document = window.document
      //
      // // @see http://www.polymer-project.org/platform/html-imports.html
      // // @see https://groups.google.com/d/topic/polymer-dev/4UKty9tb1-s/discussion
      // let currentDocument =
      //   (document._currentScript || document.currentScript).ownerDocument
      //
      // window.console.log('registering', tagName, 'this', this)
      //
      // this.sourceDocument = currentDocument
      // this.targetDocument = document

      document.registerElement(tagName, this)
    }
  }

  window.TangoJsElement = TangoJsElement

})(window)
