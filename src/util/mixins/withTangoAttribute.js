
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

      if (!this.createProxy) {
        console.warn('Mixing prototype lacks \'createProxy\' method.')
      }

      if (!this.readProxy) {
        console.warn('Mixing prototype lacks \'readProxy\' method.')
      }

      if (!this.onModelRead) {
        this.onModelRead = function () {}
      }

      if (!this.onModelError) {
        this.onModelError = function (error) {
          console.error(error)
        }
      }
      const timer = Symbol.for('timer')
      
    }

    

    static get properties() {
      return {
	proxy: {
          type: Object,
	  readOnly: true,
        },
	model: {
	  type: String,
	  observer: 'onModelChange'
	},
	pollPeriod: {
	  type: Number,
	  value: 1000,
	  observer: 'onPollPeriodChange'
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
        this.restartPollingTimer()
      } else {
        this.stopPollingTimer()
      }
    }

    onPollPeriodChange(newValue, oldValue) {
      if (this.proxy) {
	console.log('poll period changed '+newValue)
        this.restartPollingTimer()
      }
    }

    createProxy(model) {
      const [_, devname, name] = model.match(/^(.+)\/([A-Za-z0-9_]+)$/)
      console.log('creating a proxy')
      return new tangojs.core.api.AttributeProxy(devname, name)
    }

    readProxy(proxy) {
      console.log('reading a proxy. argument: '+proxy+', this.proxy '+this.proxy)
      return proxy.read()
    }

    onModelRead (deviceAttributes) {
      const attribute = deviceAttributes[this.model];
      this.attribute = attribute.value;
      this.attributeValue = attribute.value;
    }

	  
    restartPollingTimer() {
      console.log('restartPolling with period '+this.pollPeriod)
      this.stopPollingTimer()

      this.timer = setInterval(() => {
        const promisedResults = Object
          .keys(this.proxy)
          .map(m => this.readProxy(this.proxy[m]).then(x => [m, x]))

        Promise.all(promisedResults)
          .then(results => {
            const resultsMap = results.reduce(
              (acc, [m, x]) => (acc[m] = x, acc),
              {})
            this.onModelRead(resultsMap)
          })
          .catch(error => {
            this.onModelError(error)
          })
      }, this.pollPeriod) // FIXME: poolPeriod may be stored in mixin closure.
    }

    stopPollingTimer() {
      clearInterval(this.timer)
    }
  }
}
