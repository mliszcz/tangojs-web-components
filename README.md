# tangojs-web-components

tangojs-web-components is a collection of controls for
[tangojs](https://github.com/mliszcz/tangojs-core). The controls are
designed to work with any framework (or vanilla JS), and
offer standard semantics of HTML*Element.

## Installation

It's available in npmjs registry, just get it:
```
$ npm install tangojs-web-components
```

and drop desired components onto your page:
```html
<link rel="import"
      href="node_modules/tangojs-web-components/dist/components/label.html">
```

### Configuration
`tangojs-web-components` requires `tangojs-core` to be configured before any
components are created. Example:
```html
<!-- load scripts -->

<script type="text/javascript">
  (function () {
    var model = demoModel.createModel()
    var conn = new tangojsConnectorLocal.LocalConnector(model)
    tangojs.setConnector(conn)
  })()
</script>

<!-- import components -->
<!-- use components -->
```

### Requirements
* Mozilla Firefox 45+
  * enable [`dom.webcomponents.enabled`](about:config)
  * enable [`layout.css.grid.enabled`](about:config)
  * use
    [HTMLImports polyfill](http://webcomponents.org/polyfills/html-imports/)
  * apply [this patch](https://github.com/mliszcz/html-imports-firefox-patch)
    just before the polyfill is loaded
* Google Chrome 49+
  * enable [experimental-web-platform-features](
    chrome://flags/#enable-experimental-web-platform-features)

## Components

All components are derived from
[`HTMLElement`](https://developer.mozilla.org/en/docs/Web/API/HTMLElement).
The behavior and layout depends on information received from underlying
model (e.g. `AttributeInfo` object).

* [tangojs-label](#label)
* [tangojs-line-edit](#lineedit)
* [tangojs-command-button](#commandbutton)
* [tangojs-state-led](#led)
* [tangojs-plot](#plot)
* [tangojs-trend](#trend)
* [tangojs-form](#form)

### Label

Displays value of an read-only attribute. The attribute is polled at
constant rate.

Example:
```html
<tangojs-label
  model="my/dev/01/attr01"
  poll-period="1000"
  show-name
  show-unit>
</tangojs-label>
```

Property    | Type    | Attribute    | Remarks
----------- | ------- | ------------ | -------
model       | string  | model        | Full attribute name.
pollPeriod  | number  | poll-period  | Poll period in milliseconds.
showName    | boolean | show-name    | Should display name.
showUnit    | boolean | show-unit    | Should display unit.
showQuality | boolean | show-quality | Should display quality led.

### LineEdit

Displays value of an writable attribute. The attribute is polled at
constant rate.

*TODO: handle attribute types, e.g. input[type=number] for numbers,
toggle / radio-btn for booleans*

Example:
```html
<tangojs-line-edit
  model="my/dev/01/attr01"
  poll-period="1000"
  show-name
  show-unit>
</tangojs-line-edit>
```

Property    | Type    | Attribute    | Remarks
----------- | ------- | ------------ | -------
model       | string  | model        | Full attribute name.
pollPeriod  | number  | poll-period  | Poll period in milliseconds.
showName    | boolean | show-name    | Should display name.
showUnit    | boolean | show-unit    | Should display unit.
showQuality | boolean | show-quality | Should display quality led.

### CommandButton

Executes command on the device. Takes arbitrary HTML nodes as children.

Example:
```html
<tangojs-command-button
  model="my/dev/01/cmd01"
  parameters="6">
  Click Me!
</tangojs-command-button>
```

Property   | Type     | Attribute   | Remarks
---------- | -------- | ----------- | -------
model      | string   | model       | Full command name.
parameters | object   | parameters  | Parameters passed to the command.
onresult   | function | N/A         | Callback invoked on successful call.

### Led

Displays device state.

Example:
```html
<tangojs-state-led
  model="my/dev/01"
  poll-period="1000"
  show-name
  show-led>
</tangojs-state-led>
```

Property   | Type    | Attribute   | Remarks
---------- | ------- | ----------- | -------
model      | string  | model       | Full device name.
pollPeriod | number  | poll-period | Poll period in milliseconds.
showName   | boolean | show-name   | Should display name.
showLed    | boolean | show-led    | Should display led.

### Plot

*TODO*

### Trend

Plots multiple attributes over time.
Example:
```html
<tangojs-trend
  model='["tangojs/test/dev1/sine_trend", "tangojs/test/dev1/scalar"]'
  poll-period="1000"
  data-limit="5">
</tangojs-trend>
```

Property   | Type     | Attribute   | Remarks
---------- | -------- | ----------- | -------
model      | string[] | model       | Array of attribute names.
pollPeriod | number   | poll-period | Poll period in milliseconds.
dataLimit  | number   | data-limit  | Max no. of entries per dataset.

**Note:** `tangojs-trend` widget is built
on top of [Chart.js](http://www.chartjs.org/). You have to include
dependencies manually:

```
<script src="node_modules/moment/min/moment.min.js"></script>
<script src="node_modules/chart.js/Chart.min.js"></script>
```

### Form

Displays widgets for multiple attributes. Widgets are selected according
to the attribute type.

Example:
```html
<tangojs-form
  model='["tangojs/test/dev1/sine_trend", "tangojs/test/dev1/scalar"]'
  poll-period="1000">
</tangojs-form>
```

Property   | Type     | Attribute   | Remarks
---------- | -------- | ----------- | -------
model      | string[] | model       | Array of attribute names.
pollPeriod | number   | poll-period | Poll period in milliseconds.
