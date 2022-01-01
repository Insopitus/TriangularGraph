# What is a Trianglar Graph?
> Triangular graphs are graphs with three axis instead of two, taking the form of an equilateral triangle. The important features are that each axis is divided into 100, representing percentage. From each axis lines are drawn at an angle of 60 degrees to carry the values across the graph. The data used must be in the form of three components. 

# Demo
[demo](https://insopitus.github.io/TriangularGraph/)

# Installation
no npm package yet, so use one of these below:
1. script tag
```html
<script src="TriangularGraph.umd.js">
```
2. es module
```js
import TrianglarGraph from 'path/to/TrianglarGraph.js'
```

# Usage

```js
const graph = new TriangularGraph("#container",options)
```

The `options` object is described by the interface below:
```typescript
interface GraphOptions {
  /**width of the graph. if not given, the graph will use the width of the container div. */
  width?: number, //
  /**height of the graph. uses container height by default */
  height?: number,
  title?: TextOptions
  subtitle?: TextOptions
  axis?: AxisOptions,
  data: DataOptions[],
  /**cursor hover tooltip */
  tooltip?: {
    disable?: boolean
  }
}
/**all types of text */
interface TextOptions {
  disable?: boolean
  text?: string
  font?: string
  fontSize?: number
  /**font color, use CSS color string here*/
  color?: string
}
interface AxisOptions {
  titles?: TextOptions[]
  ticks?: TickOptions,
}
interface TickOptions {
  disable?: boolean,
  disableInnerLine?: boolean,
  innerLineColor?: string,
}
interface DataOptions {
  type?: 'dot' | 'image', 
  title?: string,
  dotSize?: number
  dotColor?: string
  imageURL?: string
  imageSize?: number
  coordinate?: [number, number, number]
}

```

## Properties

### domElement

The container div of the graph.

### data

The data set array passed in.

## Methods

### render(data?: DataOptions[]): void

Render the graph using a new data set. Call this method rather than instanciating a new triangular graph if you want to update the graph in an animation loop.

### destroy(): void

Destroy the graph, remove it from document.
