import withTangoAttribute from './util/mixins/withTangoAttribute'
import withPolledModel from './util/mixins/withPolledModel'
import withReflectedAttribute from './util/mixins/withReflectedAttribute'
import withReflectedAttributes from './util/mixins/withReflectedAttributes'
import * as helpers from './util/helpers'
import * as converters from './util/converters'
import * as fn from './util/fn'

/**
 * Container for registered components.
 */
export const components = { }


/**
 * Utility functions for components
 */
export const util = Object.assign(
  {},
  helpers,
  { fn },
  { converters },
  {
    mixins: {
      withTangoAttribute,
      withPolledModel,
      withReflectedAttribute,
      withReflectedAttributes
    }
  })
