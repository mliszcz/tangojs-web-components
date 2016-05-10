
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
export default function () {

  const timer = Symbol.for('timer')
  const proxy = Symbol.for('proxy')

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

  Object.defineProperty(this, 'proxy', {
    configurable: false,
    get: function () { return this[proxy] }
  })

  this.onModelChange = function (model) {
    this[proxy] = (Array.isArray(model) ? model : [model])
      .reduce((p, m) => (p[m] = this.createProxy(m), p), {})
    this.restartPollingTimer()
  }

  this.onPollPeriodChange = function () {
    this.restartPollingTimer()
  }

  this.restartPollingTimer = function () {

    clearInterval(this[timer])

    this[timer] = setInterval(() => {

      const promisedResults = Object
        .keys(this[proxy])
        .map(m => this.readProxy(this[proxy][m]).then(x => [m, x]))

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

}
