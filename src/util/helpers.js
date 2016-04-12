
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
 * @param {Object}                 attributes
 */
export function registerComponent (tagName,
                                   constructor,
                                   capabilities = {},
                                   attributes = {}) {

  const registeredConstructor = window.document.registerElement(tagName, {
    prototype: constructor.prototype
  })

  Object.defineProperty(registeredConstructor, 'descriptor', {
    value: {
      tag: tagName,
      capabilities,
      attributes
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

/**
 * Loads stylesheet from external HTML file.
 * @param {string} styleModuleId
 * @param {?string} stylesheetId
 * @return {HTMLStyleElement}
 */
export function importStyleModule (styleModuleId, stylesheetId) {
  const currentDocument = getCurrentDocument()
  const styleModule = currentDocument.getElementById(styleModuleId).import
  const style = stylesheetId
    ? styleModule.getElementById(stylesheetId)
    : styleModule.querySelector('style')
  return currentDocument.importNode(style, true)
}

export function hypenatedForm (s) {
  return s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

export function camelCasedForm (s) {
  return s.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}
