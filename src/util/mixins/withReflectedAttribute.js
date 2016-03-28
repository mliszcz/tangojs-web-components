
import * as converters from '../converters'

/**
 * Adds Javascript property that reflects DOM attribute.
 * @param {Object}                         descriptor
 * @param {string}                         descriptor.attributeName
 * @param {string}                         descriptor.reflectedName
 * @param {Function|string}                descriptor.type
 * @param {Object}                         descriptor.defaultValue
 * @param {function(t: Object): undefined} descriptor.onChange
 */
export default function withReflectedAttribute ({attributeName,
                                                 reflectedName,
                                                 type,
                                                 defaultValue,
                                                 onChange}) {

  const toAttribute = converters.getConvertToAttribute(type)
  const fromAttribute = converters.getConvertFromAttribute(type)

  const createdCallback = this.createdCallback || (() => {})
  const attributeChangedCallback = this.attributeChangedCallback || (() => {})

  const onChangeCallback = onChange || (() => {})

  if (!defaultValue && defaultValue !== false) {
    defaultValue = converters.getDefaultValue(type)
  }

  if (type === Boolean || type === 'boolean' || type === 'Boolean') {
    Object.defineProperty(this, reflectedName, {
      configurable: false,
      get: function () {
        return this.hasAttribute(attributeName)
      },
      set: function (value) {
        if (value === true) {
          this.setAttribute(attributeName, '')
        } else {
          this.removeAttribute(attributeName)
        }
      }
    })
  } else {
    Object.defineProperty(this, reflectedName, {
      configurable: false,
      get: function () {
        const value = this.getAttribute(attributeName)
        if (value !== null) {
          return fromAttribute(value)
        } else {
          return defaultValue
        }
      }, set: function (value) {
        this.setAttribute(attributeName, toAttribute(value))
      }
    })
  }

  this.createdCallback = function () {
    createdCallback.call(this)
    onChangeCallback.call(this, this[reflectedName])
  }

  this.attributeChangedCallback = function (localName, oldValue, newValue) {
    if (localName === attributeName) {
      onChangeCallback.call(this, this[reflectedName])
    }
    attributeChangedCallback.call(this, localName, oldValue, newValue)
  }

}
