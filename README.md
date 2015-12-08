# tangojs-web-components

tangojs-web-components is a collection of controls for
[tangojs](https://github.com/mliszcz/tangojs). The controls are
designed to work with any framework (or vanilla JS), and
offer standard semantics of HTML*Element.

## Installation

It's available in Bower registry, just get it:
```
$ bower install tangojs-web-components
```

and drop desired components into your page:
```html
<link rel="import"
      href="bower_components/tangojs-web-components/src/components/label.html">
```

### Configuration
`tangojs-web-components` requires `tangojs` to be configured before any
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
* Mozilla Firefox 44+  
  Version 44 requires:
  * enabling `dom.webcomponents.enabled`
  * using
    [HTMLImports polyfill](http://webcomponents.org/polyfills/html-imports/)
  * applying [this patch](https://gist.github.com/d11ea630cc777012d69b.git)
    just before the polyfill is loaded
* Chrome 47+

## Components

All components are derived from
[`HTMLElement`](https://developer.mozilla.org/en/docs/Web/API/HTMLElement).
The behavior and layout depends on information received from underlying
model (e.g. `AttributeInfo` object).

* [tangojs-label](#label)
* [tangojs-line-edit](#lineedit)
* [tangojs-command-button](.#commandbutton)
* [tangojs-led](.#led)
* [tangojs-plot](.#plot)
* [tangojs-trend](.#trend)

### Label

*TODO: make LineEdit non-writable*

### LineEdit

Displays value of an attribute. The attribute is polled at
constant rate.

Example:
```html
<tangojs-line-edit
  model="my/dev/01/attr01"
  poll-period="1000"
  show-name
  show-unit>
</tangojs-line-edit>
```

Property   | Type    | Attribute   | Remarks
---------- | ------- | ----------- | -------
model      | string  | model       | Full attribute name.
pollPeriod | number  | poll-period | Poll period in milliseconds.
showName   | boolean | show-name   | Should display name (from `AttributeInfo`).
showUnit   | boolean | show-unit   | Should display unit (from `AttributeInfo`).

### CommandButton

Executes command on the device.

Example:
```html
<tangojs-command-button
  model="my/dev/01/cmd01"
  parameters="[6]">
  Click Me!
</tangojs-command-button>

```

Property   | Type     | Attribute   | Remarks
---------- | -------- | ----------- | -------
model      | string   | model       | Full command name.
parameters | object   | parameters  | Parameters passed to the command.
onresult   | function | N/A         | Callback invoked on successful call.

### Led

*TODO*

### Plot

*TODO*

### Trend

*same as plot*
