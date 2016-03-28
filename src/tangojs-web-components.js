import withPolledModel from './util/mixins/withPolledModel'
import withFormElement from './util/mixins/withFormElement'
import withReflectedAttribute from './util/mixins/withReflectedAttribute'
import withReflectedAttributes from './util/mixins/withReflectedAttributes'
import { registerComponent, getCurrentDocument } from './util/helpers'
import * as converters from './util/converters'
import * as fn from './util/fn'

/**
 * Container for registered components.
 */
export const components = { }


/**
 * Utility functions for components
 */
export const util = {
  mixins: {
    withPolledModel,
    withFormElement,
    withReflectedAttribute,
    withReflectedAttributes
  },
  fn,
  converters,
  registerComponent,
  getCurrentDocument
}
