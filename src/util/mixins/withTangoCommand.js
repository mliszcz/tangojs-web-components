import withTango from './withTango'
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

    static get properties() {
      return {
	arguments: {
	  type: String,
	},
      };
    }

    createProxy(model) {
      const [_, devname, name] = model.match(/^(.+)\/([A-Za-z0-9_]+)$/)
      console.log('creating a proxy')
      return new tangojs.core.api.CommandProxy(devname, name)
    }

    proxyChanged(proxy){
      this.proxy[this.model].get_info().then(i => this._setInfo(i))
    }

    infoChanged(info) { 
      this.name = info.cmd_name
    }

    execute(event){
      const devDataIn = new tangojs.core.api.DeviceData(this.arguments)
      console.log('command proxy:'+this.proxy)
      this.proxy[this.model].inout(devDataIn).then(devDataOut => {
	// What to do?
	//this.dispatchEvent(new CommandButtonResultEvent(devDataOut))
      })
    }	    

  }
}

