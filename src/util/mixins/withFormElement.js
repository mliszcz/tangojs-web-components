
/**
 * Adds methods for creating fields that may be placed on tangojs-form.
 */
export default function () {

  const column = (width) => `[col] ${width} [gutter] 10px`

  this.createFormGrid = function (formSlots = 5) {
    const grid = document.createElement('div')
    Object.assign(grid.style, {
      display: 'grid',
      // gridTemplateColumns: `repeat(${formSlots}, [col] 1fr [gutter] 10px)`,
      gridTemplateColumns:
        `${column('2fr')}
        ${column('1fr')}
        ${column('1fr')}
        ${column('30px')}
        ${column('20px')}`,
      gridTemplateRows: 'auto',
      gridAutoFlow: 'column'
    })
    return grid
  }

  this.createFormField = function (name, pos, span = 1) {
    const element = document.createElement(name)
    Object.assign(element.style, {
      gridColumn: `col ${pos} / span gutter ${span}`,
      display: 'block-inline',
      boxSizing: 'border-box',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      minWidth: '1px'
    })
    return element
  }

  this.createFlexFormField = function (name, pos, span = 1) {
    const flex = this.createFormField('div', pos, span)
    const element = document.createElement(name)
    flex.style.display = 'flex'
    element.style.flex = '1'
    flex.appendChild(element)
    return { flex, element }
  }

}
