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
  return class extends superClass {
    constructor() {
      super();
    }

    static get properties() {
      return {
	proxy: {
          type: Object,
	  readOnly: true,
	  observer: 'proxyChanged'
        },
	model: {
	  type: String,
	  observer: 'onModelChange'
	},
	info: {
          type: Object,
	  readOnly: true,
	  observer: 'infoChanged'
        }
      };
    }

    onModelChange(model, oldValue) {
      if (model) {
	console.log('model changed '+model)
        this._setProxy(
	  (Array.isArray(model) ? model : [model])
            .reduce((p, m) => (p[m] = this.createProxy(m), p), {})
	)
      } else {
        this._setProxy(null)
      }
    }

  }
}
