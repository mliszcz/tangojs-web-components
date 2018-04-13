import withTango from "./withTango"
/**
 * Adds support for periodically polled model(s).
 *
 * Prototype that mixes this in should expose following functions:
 * - onModelRead  {function(resultMap: Object): undefined}
 * - onModelError {function(error: Object): undefined}
 * - createProxy  {function(model: string): (AttributeProxy|DeviceProxy)}
 * - readProxy    {function(proxy: (AttributeProxy|DeviceProxy)):
 *                  (DeviceAttribute|DevState)}
 *
 * Following functions and properties are added:
 * - proxy {Object}
 * - onModelChange {function(model: string): undefined}
 * - onPollPeriodChange {function(pollPeriod: number): undefined}
 * - restartPollingTimer {function(): undefined}
 */
export default function (superClass) {
  return class extends withTango(superClass) {
    constructor() {
      super();
    }

    createProxy(model) {
      console.log('creating a proxy')
      const proxy =  new tangojs.core.api.DeviceProxy(model)
      // update the info
      // Probably to refactor
      proxy.get_info().then(i => this._setInfo(i))
      return proxy
    }
  }
}
