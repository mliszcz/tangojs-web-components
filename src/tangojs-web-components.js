import withPolledModel from './util/mixins/withPolledModel'
import withFormElement from './util/mixins/withFormElement'
import WebComponentElement from './util/WebComponentElement'
import { registerComponent, getCurrentDocument } from './util/helpers'

/**
 * Container for registered components.
 */
export const components = { }


/**
 * Utilities for components.
 */
export const util = {
  mixins: {
    withPolledModel,
    withFormElement
  },
  WebComponentElement,
  registerComponent,
  getCurrentDocument
}
