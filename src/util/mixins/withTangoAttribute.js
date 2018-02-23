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

      const timer = Symbol.for('timer')
      
    }

    static get properties() {
      return {
	pollPeriod: {
	  type: Number,
	  value: 1000,
	  observer: 'onPollPeriodChange'
	},
        showQuality: {
          type: 'boolean',
          observer: 'showQualityChanged'
        },
        showName: {
          type: 'boolean',
          observer: 'showNameChanged'
        },
        showUnit: {
          type: 'boolean',
          observer: 'showUnitChanged'
        },
        precision: {
          type: 'number',
          observer: 'precisionChanged'
        }
      };
    }

    proxyChanged(proxy){
      if (proxy){
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
      const proxy =  new tangojs.core.api.AttributeProxy(devname, name)
      // update the info
      // Probably to refactor
      proxy.get_info().then(i => this._setInfo(i))
      return proxy
    }

    infoChanged(info) { 
      var unit = info.display_unit 
      if(unit === "No display unit") {
        // filter this, why it even works that way? 
        // here, if no unit is set, proper empty string is returned 
        this.unit = info.unit

      } else {
	this.unit = unit
      }
    }

    readProxy(proxy) {
      console.log('reading a proxy.')
      return proxy.read()
    }

    onModelRead (deviceAttributes) {
      const attribute = deviceAttributes[this.model];
      this.attribute = attribute;
      this.updateValueAndQuality(attribute.value, attribute.quality)
    }

    onModelError(error) {
      console.error(error)
      this.updateValueAndQuality('-error-', tangojs.core.tango.AttrQuality.ATTR_INVALID)
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

    updateValueAndQuality (value, quality) {
      this.qualityColor = this.getQualityColor(quality)
      if(this.precision)
        this.value = value.toFixed(this.precision)
    }

    getQualityColor (quality) {
      switch (quality) {
        case tangojs.core.tango.AttrQuality.ATTR_VALID: return '#80FF00'
        case tangojs.core.tango.AttrQuality.ATTR_INVALID: return '#880088'
        case tangojs.core.tango.AttrQuality.ATTR_ALARM: return '#FF0000'
        case tangojs.core.tango.AttrQuality.ATTR_CHANGING: return '#0080FF'
        case tangojs.core.tango.AttrQuality.ATTR_WARNING: return '#FFFF00'
        default: return '#0000FF'
      }
    }

    toggleVisibility (node, show) {
      // node.style.visibility = show ? 'visible' : 'hidden'
      node.style.display = show ? 'inline-block' : 'none'
    }

    onShowQualityChange (showQuality) {
      this.toggleVisibility(this.dom.led, showQuality)
    }

    onShowNameChange (showName) {
      this.toggleVisibility(this.dom.name, showName)
    }

    onShowUnitChange (showUnit) {
      this.toggleVisibility(this.dom.unit, showUnit)
    }

    onPrecisionChange (precision) {
      this.precision = precision
    }

  }
}
