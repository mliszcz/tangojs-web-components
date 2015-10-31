# tangojs-web-components

tangojs-web-components is a collection of controls for
[tangojs](https://github.com/mliszcz/tangojs). The controls are
dessigned to work with any framework (or vanilla JS), and
offer standard semantics of HTML*Element.

## Installation

Available in Bower registry:
```
TODO
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
* Opera 34+

### Loading
TODO

## Components

All components are derived from
[`HTMLElement`](https://developer.mozilla.org/en/docs/Web/API/HTMLElement).
The behavior and layout depends on information received from underlying
model (e.g. `AttributeInfo` object).

* [tangojs-label](#Label)
* [tangojs-value](#Value)
* TODO

### Label

Displays value of an attribute. The attribute is polled at
constant rate.

Example:
```html
<tangojs-label
  model="my/dev/01/attr01"
  poll="1000"
  name
  unit
  onchange="handleChange"/>
</tangojs-label>
```

Property  | Type | Attribute | Remarks
--------- | ---- | --------- | -------
model | string          | model | -
poll  | number          | poll  | Poll period in milliseconds.
name  | boolean         | name  | Display name (from `AttributeInfo`).
unit  | boolean         | unit  | Display unit (from `AttributeInfo`).
proxy | DeviceAttribute | N/A   | TangoJS proxy.

### Value

Displays midifiable attribute value.

TODO
