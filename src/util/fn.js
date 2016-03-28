
/**
 * Various functional operations.
 */

/**
 * @param {Array<T>} array
 * @param {function(t: T): V} fn
 * @return {Array<[V, Array<T>]}
 */
export function groupBy (array, fn) {
  const map =  array.reduce((grouped, element) => {
    const key = fn(element)
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key).push(element)
    return grouped
  }, new Map())
  return [...map]
}
