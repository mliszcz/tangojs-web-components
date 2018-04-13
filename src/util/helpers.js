
import { components } from '../tangojs-web-components'

/**
 * @typedef {Object} ComponentCapabilities
 * @property {boolean} attributeModel
 * @property {boolean} commandModel
 * @property {boolean} statusModel
 * @property {boolean} readOnlyModel
 */

/**
 * @typedef {Object} ComponentAttribute
 * @property {Function} type
 */

/**
 * @typedef {Object} ComponentDescriptor
 * @property {string}                          tagName
 * @property {ComponentCapabilities}           capabilities
 * @property {Map<string, ComponentAttribute>} attributes
 *
 * The purpose of descriptor is to allow for automatic component discovery
 * by external tools.
 */

/**
 * Registers custom element as a TangoJS component.
 * @param {string}                 tagName
 * @param {Function}               constructor
 * @param {?ComponentDescriptor}   descriptor
 * @return {Function}
 */
export function registerComponent (tagName,
                                   constructor,
                                   descriptor) {

  //const registeredConstructor = window.document.registerElement(tagName, {
  //  prototype: constructor.prototype
  //})

  //Object.defineProperty(registeredConstructor, 'descriptor', {
  //  value: descriptor ? Object.assign({}, descriptor, { tagName }) : undefined
  //})

  //components[constructor.name] = registeredConstructor

  //return registeredConstructor
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
