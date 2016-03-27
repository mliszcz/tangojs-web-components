
import { components } from '../tangojs-web-components'

/**
 * @typedef {Object} ComponentCapabilities
 * @property {boolean} multipleModels supports multiple models?
 * @property {boolean} attributes     supports attributes?
 * @property {boolean} commands       supports commands?
 * @property {boolean} status         supports status-fields?
 * @property {boolean} readOnly       supports read-only attributes?
 */

/**
 * @typedef {Object} ComponentDescriptor
 * @property {string}                tag          tag name
 * @property {ComponentCapabilities} capabilities supported caps.
 */

/**
 * Registers custom element as a TangoJS component.
 * @param {string}                 tagName
 * @param {Object}                 constructor
 * @param {?ComponentCapabilities} capabilities
 */
export function registerComponent (tagName, constructor, capabilities = {}) {

  const registeredConstructor = window.document.registerElement(tagName, {
    prototype: constructor.prototype
  })

  Object.defineProperty(registeredConstructor, 'descriptor', {
    value: {
      tag: tagName,
      capabilities
    }
  })

  components[constructor.name] = registeredConstructor
}

/**
 * Returns owner document of current script.
 * @return {HTMLDocument}
 */
export function getCurrentDocument () {
  const document = window.document
  const currentScript = (document._currentScript || document.currentScript)
  return currentScript.ownerDocument
}
