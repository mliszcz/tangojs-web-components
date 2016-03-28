import withPolledModel from './util/mixins/withPolledModel'
import withFormElement from './util/mixins/withFormElement'
import withReflectedAttribute from './util/mixins/withReflectedAttribute'
import withReflectedAttributes from './util/mixins/withReflectedAttributes'
import { registerComponent, getCurrentDocument } from './util/helpers'
import * as converters from './util/converters'

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
  converters,
  registerComponent,
  getCurrentDocument
}
