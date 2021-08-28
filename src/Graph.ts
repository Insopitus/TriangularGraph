const SIN60 = Math.sin(Math.PI / 3)
const COS60 = Math.cos(Math.PI / 3)
let x = 0, y = 0 //reduce gc
export default class Graph {
  #context: CanvasRenderingContext2D
  constructor(query: string, options: GraphOptions) {
    const width = options.width ?? 600
    const height = options.height ?? 400
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    document.querySelector(query).appendChild(canvas)
    this.#context = canvas.getContext('2d')
    const offsetX = 100
    const offsetY = 0
    const edgeLength = 600
    console.time('render')
    this.drawTriangle(edgeLength, offsetX, offsetY)
    this.drawScale(options.scale, edgeLength, offsetX, offsetY)
    this.drawPoints(options.data, edgeLength, offsetX, offsetY)
    console.timeEnd('render')
  }
  private drawTriangle(edgeLength: number, offsetX: number, offsetY: number) {
    const ctx = this.#context
    ctx.fillStyle = 'white'
    const triangleHeight = edgeLength * SIN60
    ctx.moveTo(0 + offsetX, triangleHeight + offsetY)
    ctx.lineTo(.5 * edgeLength + offsetX, 0 + offsetY)
    ctx.lineTo(edgeLength + offsetX, triangleHeight + offsetY)
    ctx.lineTo(0 + offsetX, triangleHeight + offsetY)
    ctx.stroke()
    ctx.fill()
  }
  private drawScale(option: GraphOptions['scale'], triangleEdgeLength: number, offsetX: number, offsetY: number) {
    option ||= {}
    const scaleSize = 10 // 
    if (option.disable) return
    const ctx = this.#context
    ctx.strokeStyle = 'black'
    // u axis
    for (let i = 1; i <= 5; i++) {
      const pos = getCanvas2DCoord(.2 * i, 0, 1 - .2 * 1)
      applyTranformation(pos, triangleEdgeLength, [offsetX, offsetY])
      ctx.moveTo(pos[0], pos[1])
      ctx.lineTo(pos[0] - scaleSize * COS60, pos[1] + scaleSize * SIN60)
      ctx.stroke()
    }
    // v axis
    for (let i = 1; i <= 5; i++) {
      const pos = getCanvas2DCoord(1 - .2 * i, 0.2 * i, 0)
      applyTranformation(pos, triangleEdgeLength, [offsetX, offsetY])
      ctx.moveTo(pos[0], pos[1])
      ctx.lineTo(pos[0] + scaleSize, pos[1])
      ctx.stroke()
    }
    // w axis
    for (let i = 1; i <= 5; i++) {
      const pos = getCanvas2DCoord(0, 1 - .2 * i, .2 * i)
      applyTranformation(pos, triangleEdgeLength, [offsetX, offsetY])
      ctx.moveTo(pos[0], pos[1])
      ctx.lineTo(pos[0] - scaleSize * COS60, pos[1] - scaleSize * SIN60)
      ctx.stroke()
    }

  }
  private drawTitle(option: GraphOptions['title'], offsetX: number, offsetY: number) {

  }
  private drawPoints(content: GraphOptions['data'], triangleEdgeLength: number, offsetX: number, offsetY: number) {
    if (!content || content.length === 0) return
    let x = 0  //reduce gc
    let y = 0
    const ctx = this.#context
    ctx.strokeStyle = 'dodgerblue'
    for (let point of content) {
      [x, y] = getCanvas2DCoord(...point.coordinate)
      // avoiding using `applyTransformation` to reduce gc
      x *= triangleEdgeLength
      x += offsetX
      y *= triangleEdgeLength
      y += offsetY
      if (point.type === 'dot') {
        if (point.dotColor) ctx.fillStyle = point.dotColor
        const dotSize = point.dotSize || 5
        ctx.beginPath()
        ctx.arc(x, y, dotSize, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
}

interface GraphOptions {
  width?: number,
  height?: number,
  clockwise?: boolean,
  title?: TitleOptions[],
  scale?: ScaleOptions,
  data: DataOptions[],
}
interface TitleOptions {
  disable?: boolean
  text?: string
  fontSize?: number
}
interface ScaleOptions {
  disable?: boolean,
  innerLine?: boolean,
  innerLineColor?: string,
}
interface DataOptions {
  type?: 'dot' | 'image', //image not implemented
  dotSize?: number
  dotColor?: string
  imageURL?: string
  coordinate: [number, number, number]

}









// actually, w is ignored. u + v + w should always equal 1
export function getCanvas2DCoord(u: number, v: number, w: number): [number, number] {
  const x = v * COS60 + u
  const y = (1 - v) * SIN60  //canvas2d coordinate
  return [x, y]
}

function applyTranformation(position: [number, number], scale: number, translate: [number, number]) {
  position[0] *= scale
  position[1] *= scale
  position[0] += translate[0]
  position[1] += translate[1]
  return position
}