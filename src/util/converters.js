
/**
 * Conversion functions between IDL attributes and content attributes.
 * @see https://html.spec.whatwg.org/multipage/infrastructure.html#reflecting-content-attributes-in-idl-attributes
 */

/*
 * For simplicity we assume that there are five data types:
 * - Number
 * - String
 * - Boolean
 * - Array (containing data of types shown above)
 * - Object (everything else)
 *
 * Object type cannot be converted.
 *
 * IDL attribute is a Javascript entity, backed by content attribute.
 * Content attribute is a plain-old javascript string.
 */

const stringIdentity = x => `${x}`

const jsonParse = x => JSON.parse(x)
const jsonStringify = x => JSON.stringify(x)

const arrayParse = (x, elemParse) => x.split(',').map(e => elemParse(e.trim()))
const arrayStringify = (x, elemStringify) => x.map(elemStringify).join(',')

const booleanParse = x => x !== null
const booleanStringify = () => ''

const normalizeType = type => {
  if (Array.isArray(type)) {
    return type.map(normalizeType)
  } else {
    switch (type) {
      case Array:
      case 'Array':
      case 'array': return Array
      case Number:
      case 'Number':
      case 'number': return Number
      case Boolean:
      case 'Boolean':
      case 'boolean': return Boolean
      case String:
      case 'String':
      case 'string': return String
    }
    throw new Error(`Unsupported type ${type}.`)
  }
}

export function getConvertToAttribute (type) {
  const ntype = normalizeType(type)
  if (Array.isArray(ntype) && ntype[0] === Array) {
    return x => arrayStringify(x, getConvertToAttribute(ntype[1]))
  } else {
    switch (ntype) {
      case Number: return jsonStringify
      case Boolean: return booleanStringify
      case String: return stringIdentity
    }
    throw new Error(`No converter found for ${ntype} type.`)
  }
}

export function getConvertFromAttribute (type) {
  const ntype = normalizeType(type)
  if (Array.isArray(ntype) && ntype[0] === Array) {
    return x => arrayParse(x, getConvertFromAttribute(ntype[1]))
  } else {
    switch (ntype) {
      case Number: return jsonParse
      case Boolean: return booleanParse
      case String: return stringIdentity
    }
    throw new Error(`No converter found for ${ntype} type.`)
  }
}

export function getDefaultValue (type) {
  const ntype = normalizeType(type)
  if (Array.isArray(ntype) && ntype[0] === Array) {
    return []
  } else {
    switch (ntype) {
      case Number: return 0
      case Boolean: return false
      case String: return ''
    }
    throw new Error(`No default value found for ${ntype} type.`)
  }
}
