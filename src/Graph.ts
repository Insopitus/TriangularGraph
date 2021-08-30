const SIN60 = Math.sin(Math.PI / 3)
const COS60 = Math.cos(Math.PI / 3)
export default class Graph {
  context: CanvasRenderingContext2D
  options: GraphOptions
  constructor(query: string, options: GraphOptions) {
    if (!options) throw 'option is needed.'
    this.options = options
    const width = options.width || 600
    const height = options.height || 400
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    document.querySelector(query).appendChild(canvas)
    this.context = canvas.getContext('2d', { alpha: false })
    this.context.fillStyle = 'gray'
    this.context.fillRect(0, 0, width, height)
    this.render(options.data)
    // this.#context.translate(.5,.5)
  }
  render(data?: GraphOptions['data']) {
    data ||= this.options.data
    const offsetX = 200
    const offsetY = 100
    const edgeLength = 600
    const t1 = performance.now()
    // this.context.translate(offsetX,offsetY)
    this.drawTriangle(edgeLength, offsetX, offsetY)
    this.drawScale(this.options.scale, edgeLength, offsetX, offsetY)
    this.drawPoints(data, edgeLength, offsetX, offsetY)
    this.drawAxisTitle(this.options.axisTitle, edgeLength, offsetX, offsetY)
    console.log(`Rendering ${data.length} points took ${performance.now() - t1} ms.`)
  }
  private drawTriangle(edgeLength: number, offsetX: number, offsetY: number) {
    const ctx = this.context
    ctx.fillStyle = 'white'
    const triangleHeight = edgeLength * SIN60
    ctx.beginPath()
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1
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
    const ctx = this.context
    ctx.strokeStyle = 'black'
    // u axis
    for (let i = 1; i <= 5; i++) {
      const pos = getCanvas2DCoord(.2 * i, 0, 1 - .2 * 1)
      applyTranformation(pos, triangleEdgeLength, [offsetX, offsetY])
      ctx.beginPath()
      ctx.moveTo(pos[0], pos[1])
      ctx.lineTo(pos[0] - scaleSize * COS60, pos[1] + scaleSize * SIN60)
      ctx.stroke()
    }
    // v axis
    for (let i = 1; i <= 5; i++) {
      const pos = getCanvas2DCoord(1 - .2 * i, 0.2 * i, 0)
      applyTranformation(pos, triangleEdgeLength, [offsetX, offsetY])
      ctx.beginPath()
      ctx.moveTo(pos[0], pos[1])
      ctx.lineTo(pos[0] + scaleSize, pos[1])
      ctx.stroke()
    }
    // w axis
    for (let i = 1; i <= 5; i++) {
      const pos = getCanvas2DCoord(0, 1 - .2 * i, .2 * i)
      applyTranformation(pos, triangleEdgeLength, [offsetX, offsetY])
      ctx.beginPath()
      ctx.moveTo(pos[0], pos[1])
      ctx.lineTo(pos[0] - scaleSize * COS60, pos[1] - scaleSize * SIN60)
      ctx.stroke()
    }

  }
  private drawAxisTitle(data: GraphOptions['axisTitle'], edgeLength: number, offsetX: number, offsetY: number) {
    if (!data) return
    const margin = 50
    const ctx = this.context
    ctx.font = '30px Arial'
    ctx.fillStyle = 'black'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // u axis
    if (!data[0].disable) {
      const pos1 = getCanvas2DCoord(.5, 0, .5)
      applyTranformation(pos1, edgeLength, [offsetX, offsetY + margin])
      ctx.beginPath()
      ctx.fillText(data[0].text, ...pos1)
    }
    // v axis
    if (!data[1].disable) {
      const pos2 = getCanvas2DCoord(.5, .5, 0)
      applyTranformation(pos2, edgeLength, [offsetX + margin, offsetY])
      ctx.save()
      ctx.translate(...pos2)
      ctx.rotate(Math.PI/3)
      ctx.beginPath()
      ctx.fillText(data[1].text, 0,0)
      ctx.restore()
    }
    // w axis
    if (!data[2].disable) {
      const pos3 = getCanvas2DCoord(0, .5, 0.5)
      applyTranformation(pos3, edgeLength, [offsetX - margin, offsetY])
      ctx.save()
      ctx.translate(...pos3)
      ctx.beginPath()
      ctx.rotate(-Math.PI/3)
      ctx.textBaseline = 'middle'
      ctx.fillText(data[2].text, 0,0)
      ctx.restore()
    }
  }
  private drawPoints(content: GraphOptions['data'], triangleEdgeLength: number, offsetX: number, offsetY: number) {
    if (!content || content.length === 0) return
    let x = 0  //reduce gc
    let y = 0
    const ctx = this.context
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
  axisTitle?: AxisTitleOptions[],
  scale?: ScaleOptions,
  data: DataOptions[],
}
interface AxisTitleOptions {
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