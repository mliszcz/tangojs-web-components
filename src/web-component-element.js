(function (window) {
  'use strict'

  let _attrMap = Symbol('attributeMapping')
  let _attrChg = Symbol('selfAttributeChage')

  /**
   * Base class for all components.
   * Handles attribute - property synchronization.
   */
  let WebComponentElement = function () {}
  WebComponentElement.prototype = Object.create(HTMLElement.prototype)

  /**
   * Component initialization. Invalidates all attributes, enforcing calls to
   * attributeChangedCallback. Shlould be invoked by subclass before specific
   * subclass logic.
   */
  WebComponentElement.prototype.createdCallback = function () {

    // indicates that there was change in specified attribute
    this[_attrChg] = {}

    for (var i=0; i<this.attributes.length; ++i) {
      this.attributeChangedCallback(this.attributes[i].name,
                                    null,
                                    this.attributes[i].value)
    }
  }

  /**
   * Reflects change in an attribute into the corresponding property.
   */
  WebComponentElement.prototype.attributeChangedCallback = function(attribute,
                                                                    oldValue,
                                                                    newValue) {

    let mapping
      = (Object.getPrototypeOf(this)[_attrMap] || {})[attribute]

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
   *                                  information.
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

    let boolOr = (val, def) => (val === true || val === false) ? val : def

    let converter = (type) => {
      switch (type) {
        case 'string': return { to: v => v, from: v => v }
        case 'boolean': return { to: v => true, from: v => '' }
        default: return { to: JSON.parse, from: JSON.stringify }
      }
    }

    // attach mapping for reuse in WebComponentElement prototype methods
    prototype[_attrMap] = attributeMapping

    // intercept setters
    Object.keys(attributeMapping).forEach(attribute => {

      let mapping = attributeMapping[attribute]
      mapping.property = mapping.property || attribute
      let property = mapping.property

      mapping.mapTo = boolOr(mapping.mapTo, true)
      mapping.mapFrom = boolOr(mapping.mapFrom, true)

      let converters = converter(mapping.type)
      mapping.mapToFn = mapping.mapToFn || converters.to
      mapping.mapFromFn = mapping.mapFromFn || converters.from

      let descriptor = Object.getOwnPropertyDescriptor(prototype, property)

      if (mapping.mapFrom) {
        if (descriptor && descriptor.configurable) {

          let setter = descriptor.set
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

  window.WebComponentElement = WebComponentElement

})(window)
