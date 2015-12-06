(function (window) {
  'use strict'

  const _attrMap = Symbol('attributeMapping')
  const _attrChg = Symbol('selfAttributeChage')

  /**
   * Base class for all components.
   * Handles attribute - property synchronization.
   */
  const WebComponentElement = function () {}
  WebComponentElement.prototype = Object.create(HTMLElement.prototype)

  /**
   * Component initialization. Invalidates all attributes, enforcing calls to
   * attributeChangedCallback. Shlould be invoked by subclass before specific
   * subclass logic.
   */
  WebComponentElement.prototype.createdCallback = function () {

    // indicates that there was change in specified attribute
    this[_attrChg] = {}

    for (let i=0; i<this.attributes.length; ++i) {
      this.attributeChangedCallback(this.attributes[i].name,
                                    null,
                                    this.attributes[i].value)
    }
  }

  /**
   * Reflects change in an attribute into the corresponding property.
   */
  WebComponentElement.prototype.attributeChangedCallback = function (attribute,
                                                                     oldValue,
                                                                     newValue) {
    const mapping = (Object.getPrototypeOf(this)[_attrMap] || {})[attribute]

    if (mapping && mapping.mapTo) {
      if (this[_attrChg][attribute]) {
        // prevent re-setting when this callback
        // was triggered by property change
        this[_attrChg][attribute] = undefined
      } else {
        this[mapping.property] = mapping.mapToFn(newValue)
      }
    }
  }

  /**
   * Attaches attributeMapping to given prototype and intercepts all relevant
   * setters for attribute mapping purposes.
   * @param {Object} prototype        Prototype for attribute binding. Should
   *                                  inherit from WebComponentElement.
   * @param {Object} attributeMapping Object containing attribute mapping
   *                                  information or String denoting attribute
   *                                  type.
   * @example
   * WebComponentElement.bindAttributes(MyAmazingElement.prototype, {
   *   'attribute1': {
   *     property: 'property1', // defaults to attribute name
   *     type: 'string'  // optional
   *     mapTo: true,    // should map attribute -> property ? (default: true)
   *     mapFrom: true,  // should map property -> attribute ? (default: true)
   *     mapToFn: <fn>,  // mapping function (default depends on type)
   *     mapFromFn: <fn> // as above
   *   }
   * })
   */
  WebComponentElement.bindAttributes = function (prototype, attributeMapping) {

    const boolOr = (val, def) => (val === true || val === false) ? val : def

    const converter = (type) => {
      switch (type) {
        case 'string': return { to: v => v, from: v => v }
        case 'boolean': return { to: v => true, from: v => '' }
        case 'number':
        default: return { to: JSON.parse, from: JSON.stringify }
      }
    }

    const hypenated = (s) => s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    const camelCase = (s) => s.replace(/-([a-z])/g, (g) => g[1].toUpperCase())

    // attach mapping for reuse in WebComponentElement prototype methods
    prototype[_attrMap] = attributeMapping

    // intercept setters
    Object.keys(attributeMapping).forEach(attribute => {

      if (typeof attributeMapping[attribute] === 'string') {
        attributeMapping[attribute] = { type: attributeMapping[attribute] }
      }

      const mapping = attributeMapping[attribute]

      attribute = hypenated(attribute)
      attributeMapping[attribute] = mapping

      mapping.property = mapping.property || camelCase(attribute)
      const property = mapping.property

      mapping.mapTo = boolOr(mapping.mapTo, true)
      mapping.mapFrom = boolOr(mapping.mapFrom, true)

      const converters = converter(mapping.type)
      mapping.mapToFn = mapping.mapToFn || converters.to
      mapping.mapFromFn = mapping.mapFromFn || converters.from

      const descriptor = Object.getOwnPropertyDescriptor(prototype, property)

      if (mapping.mapFrom) {
        if (descriptor && descriptor.configurable) {

          const setter = descriptor.set
          descriptor.set = function (value) {
            setter.call(this, value)
            if (mapping.type === 'boolean' && !value) {
              this.removeAttribute(attribute)
            } else {
              this[_attrChg][attribute] = true
              this.setAttribute(attribute, mapping.mapFromFn(value))
            }
          }
          Object.defineProperty(prototype, property, descriptor)

        } else {
          console.error(`Property ${property} does not exists `
                        `or in non-configurable`)
        }
      }
    })
  }

  /**
   * Defines property accessors on given prototype. This will become obsolete
   * when ES7 Class Fields are finally shipped.
   * @param {Object}   prototype  Prototype for defining properties.
   * @param {String[]} properties Array of property names.
   */
  WebComponentElement.defineProperties = function (prototype, properties) {
    properties.forEach(property =>
      Object.defineProperty(prototype, property, {
        configurable: true,
        get: function () {
          return this[`_${property}`]
        },
        set: function (value) {
          this[`_${property}`] = value
        }
      })
    )
  }

  /**
   * @return {Object} Current document.
   */
  WebComponentElement.getCurrentDocument = function (window) {
    const document = window.document
    const currentScript = (document._currentScript || document.currentScript)
    return currentScript.ownerDocument
  }

  window.WebComponentElement = WebComponentElement

})(window)
