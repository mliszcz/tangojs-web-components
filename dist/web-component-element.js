(function (window) {
  'use strict'

  const console = window.console

  /** Declare simple property with accessors.
   * @param {Object} prototype property host
   * @param {string} property  property name
   */
  function defineSimpleProperty(prototype, property) {
    const key = Symbol.for(`__${property}`)
    Object.defineProperty(prototype, property, {
      configurable: true,
      get: function () { return this[key] },
      set: function (value) { this[key] = value }
    })
  }

  /** Returns property descriptor found in prototype chain.
   * @param {Object} object   target object
   * @param {string} property property name
   * @return {Object} property descriptor
   */
  function getPropertyDescriptor(object, property) {
    if (object) {
      const descriptor = Object.getOwnPropertyDescriptor(object, property)
      return descriptor || getPropertyDescriptor(Object.getPrototypeOf(object),
                                                 property)
    }
  }

  /** Attribute-property synchronization context for interceptors. */
  class AttributeSynchronizationContext {

    /**
     * @param {Object}   prototype target prototype
     * @param {string}   attribute attribute name
     * @param {string}   property  property name
     * @param {string}   type      attribute type
     * @param {Object}   value     default value
     * @param {Function} onChange  on-change callback
     */
    constructor(prototype,
                attribute,
                property,
                type,
                value,
                onChange) {

      /** @private */
      this.ctx = {
        prototype,
        attribute,
        property,
        type,
        value,
        onChange,

        syncFromAttr: Symbol(),
        syncFromProp: Symbol(),

        enableOnChange: Symbol(),

        converters: this.createConverters(type)
      }
    }

    /** Transform string into hypenated form.
     * @param {string} s input string
     * @return {string} s-in-hypenated-form
     */
    static hypenatedForm(s) {
      return s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    }

    /** Transform string into camel-cased form.
     * @param {string} s input string
     * @return {string} sInCamelCasedForm
     */
    static camelCasedForm(s) {
      return s.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    }

    /** Create converter function.
     * @param {string} type attribute type
     * @return {{attrToProp: Function, propToAttr: Function}}
     * @private
     */
    createConverters(type) {
      if (Array.isArray(type)) {
        const [first, ...rest] = type
        if (first == 'function') {
          return {
            attrToProp: v => new Function(...rest, v),
            propToAttr: v => v
          }
        } else {
          return {
            attrToProp: v => v,
            propToAttr: v => v
          }
        }
      }
      switch (type) {
        case 'string': return {
          attrToProp: v => v,
          propToAttr: v => v
        }
        case 'boolean': return {
          attrToProp: v => v !== null,
          propToAttr: v => ''
        }
        case 'number':
        default: return {
          attrToProp: JSON.parse,
          propToAttr: JSON.stringify
        }
      }
    }

    /** Intercept property setter in given context. */
    interceptPropertySetter() {

      const ctx = this.ctx
      const descriptor = getPropertyDescriptor(ctx.prototype, ctx.property)
      const setter = descriptor.set

      descriptor.set = function (value) {

        setter.call(this, value)

        if (! this[ctx.syncFromAttr]) {

          if (ctx.type === 'boolean' && !value) {
            this.removeAttribute(ctx.attribute)
          } else {
            if (ctx.type[0] !== 'function') {
              // FIXME add support for setting function
              this[ctx.syncFromProp] = true
              this.setAttribute(ctx.attribute,
                                ctx.converters.propToAttr(value))
            }
          }
          if (this[ctx.enableOnChange]) {
            ctx.onChange.call(this, value)
          }
        } else {
          this[ctx.syncFromAttr] = false
        }
      }

      Object.defineProperty(ctx.prototype, ctx.property, descriptor)
    }

    /** Intercept ACC in given context. */
    interceptAttributeChangedCallback() {

      const ctx = this.ctx
      const attributeChangedCallback =
        ctx.prototype.attributeChangedCallback || (() => {})

      ctx.prototype.attributeChangedCallback = function (attribute,
                                                         oldValue,
                                                         newValue) {
        if (attribute === ctx.attribute) {

          if (! this[ctx.syncFromProp]) {

            this[ctx.syncFromAttr] = true

            const value = ctx.converters.attrToProp(newValue)
            this[ctx.property] = value
            if (this[ctx.enableOnChange]) {
              ctx.onChange.call(this, value)
            }
          } else {
            this[ctx.syncFromProp] = false
          }
        } else {
          attributeChangedCallback.call(this, attribute, oldValue, newValue)
        }
      }
    }

    /** Intercept CC in given context.
     * @param {boolean} toProperty   synchronize attribute to property
     * @param {boolean} fromProperty synchronize property to attribute
     */
    interceptCreatedCallback(toProperty, fromProperty) {

      const ctx = this.ctx

      const createdCallback = ctx.prototype.createdCallback || (() => {})

      ctx.prototype.createdCallback = function () {

        this[ctx.enableOnChange] = false

        const attrValue = this.getAttribute(ctx.attribute)
        const propValue = this[ctx.property]
        const validAttr = (ctx.type === 'boolean' || attrValue !== null)
        const validProp = (propValue !== null && propValue !== undefined)

        if (toProperty) {
          if (validAttr) {
            this[ctx.property] = ctx.converters.attrToProp(attrValue)
          } else if (! validProp) {
            this[ctx.property] = ctx.value
          }
        } else if (fromProperty && ! validAttr) {
          if (validProp) {
            this.setAttribute(ctx.converters.propToAttr(propValue))
          } else {
            this.setAttribute(ctx.converters.propToAttr(ctx.value))
          }
        }

        createdCallback.call(this)

        if (toProperty) {
          ctx.onChange.call(this, this[ctx.property])
        } else {
          const attrVal = this.getAttribute(ctx.attribute)
          const value = ctx.converters.attrToProp(attrVal)
          ctx.onChange.call(this, value)
        }

        this[ctx.enableOnChange] = true
      }
    }
  }

  /**
   * Base class for all components.
   */
  function WebComponentElement() { }

  window.WebComponentElement = WebComponentElement

  /** Setup synchronization between property and attribute
   * @param {Object}   param
   * @param {Object}   param.prototype    target prototype
   * @param {string}   param.attribute    attribute name
   * @param {string}   param.property     property name
   * @param {string}   param.type         attribute type
   * @param {Object}   param.value        default value
   * @param {boolean}  param.toProperty   sync attribute to property
   * @param {boolean}  param.fromProperty sync property to attribute
   * @param {Function} param.onChange     on-change callback
   */
  WebComponentElement.wireAttribute = function ({prototype,
                                                 attribute,
                                                 property,
                                                 type,
                                                 value,
                                                 toProperty,
                                                 fromProperty,
                                                 onChange}) {

    const boolOr = (val, def) => (val === true || val === false) ? val : def
    toProperty = boolOr(toProperty, true)
    fromProperty = boolOr(fromProperty, true)

    attribute = attribute || property
    attribute = AttributeSynchronizationContext.hypenatedForm(attribute)
    property = AttributeSynchronizationContext.camelCasedForm(property)

    const ctx = new AttributeSynchronizationContext(prototype,
                                                    attribute,
                                                    property,
                                                    type || 'string',
                                                    value,
                                                    onChange || (() => {}))

    ctx.interceptCreatedCallback(toProperty, fromProperty)

    if (toProperty) {
      ctx.interceptAttributeChangedCallback()
    }

    if (fromProperty) {

      if (! getPropertyDescriptor(prototype, property)) {
        defineSimpleProperty(prototype, property)
      }

      const descriptor = getPropertyDescriptor(prototype, property)

      if (descriptor.configurable && descriptor.set) {
        ctx.interceptPropertySetter()
      } else {
        throw new Error(`property ${property} is non-configurable `
                        + `or setter is missing`)
      }
    }
  }

  /** Apply WebComponentElement.wireAttribute to multiple attributes at once.
   * @param {Object} prototype target prototype
   * @param {Object} mappings  mapping dictionary
   */
  WebComponentElement.wireAttributes = function (prototype, mappings) {
    Object.keys(mappings).forEach(property => {
      WebComponentElement.wireAttribute(Object.assign({prototype, property},
                                                      mappings[property]))
    })
  }

  /** Returns owner document for current script.
   * @param {Object} window object
   * @return {Object} current document
   */
  WebComponentElement.getCurrentDocument = function (window) {
    const document = window.document
    const currentScript = (document._currentScript || document.currentScript)
    return currentScript.ownerDocument
  }

  /**
   * Registers component and attaches it to global object.
   * @param {Object} window          window object
   * @param {Object} globalHost      global object to attach constructor
   * @param {Object} constructor     constructor function
   * @param {string} htmlElementName name to register as HTML element
   * @return {Object} constructor function
   */
  WebComponentElement.registerComponent = function (window,
                                                    globalHost,
                                                    constructor,
                                                    htmlElementName) {
    const ctor = window.document.registerElement(htmlElementName, constructor)
    globalHost[constructor.name] = ctor
    return ctor
  }

})(window)
