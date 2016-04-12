
import withReflectedAttribute from './withReflectedAttribute'

import { hypenatedForm } from '../helpers'
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
