
import withReflectedAttribute from './withReflectedAttribute'

const hypenatedForm = s => s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
const camelCasedForm = s => s.replace(/-([a-z])/g, (g) => g[1].toUpperCase())

/**
 * Applies withReflectedAttribute muliple times.
 * @param {Object} descriptors
 */
export default function withReflectedAttributes (descriptorMap) {

  Object.keys(descriptorMap).forEach(reflectedName => {
    const newDescriptor = Object.assign(
      {},
      descriptorMap[reflectedName],
      {
        reflectedName,
        attributeName: hypenatedForm(reflectedName)
      })
    withReflectedAttribute.call(this, newDescriptor)
  })
}
