const SIN60 = Math.sin(Math.PI / 3)
const COS60 = Math.cos(Math.PI / 3)
export default class Graph {
  domElement: HTMLDivElement
  context: CanvasRenderingContext2D
  options: GraphOptions
  offset: [number, number]
  data: Partial<DataForSearch>[]
  enableTooltip = false
  constructor(query: string, options: GraphOptions) {
    if (!options) throw 'options are needed.'
    this.options = options
    const width = options.width || 600
    const height = options.height || 400
    const container = document.querySelector(query)
    if (!container) throw `The elment ${query} cannot be found.`
    this.domElement = document.createElement('div')
    this.domElement.className = 'graph-container'
    Object.assign(this.domElement.style, {
      height: height + 'px',
      width: width + 'px',
      position: 'relative'
    })
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.style.position = 'absolute'
    container.appendChild(this.domElement)
    this.domElement.appendChild(canvas)
    const context = canvas.getContext('2d', { alpha: false })
    // background color
    context.fillStyle = 'gray'
    context.fillRect(0, 0, width, height)
    const offsetX = 200
    const offsetY = 100
    this.offset = [offsetX, offsetY]
    context.translate(offsetX, offsetY) // use global tranlate instead of offset in every single path
    this.context = context
    this.enableTooltip = !options.tooltip?.disable
    this.render(options.data)

  }
  render(data?: GraphOptions['data']) {
    data ||= this.options.data

    const edgeLength = 600
    const t1 = performance.now()
    this.drawTriangle(edgeLength)
    this.drawScale(this.options.scale, edgeLength)
    this.drawPoints(data, edgeLength)
    this.drawAxisTitle(this.options.axisTitle, edgeLength)
    this.drawHoverLayer(this.options.tooltip)
    console.log(`Rendering ${data.length} points took ${performance.now() - t1} ms.`)
  }
  private drawTriangle(edgeLength: number) {
    const ctx = this.context
    ctx.fillStyle = 'white'
    const triangleHeight = edgeLength * SIN60
    ctx.beginPath()
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1
    ctx.moveTo(0, triangleHeight)
    ctx.lineTo(.5 * edgeLength, 0)
    ctx.lineTo(edgeLength, triangleHeight)
    ctx.lineTo(0, triangleHeight)
    ctx.stroke()
    ctx.fill()
  }
  private drawScale(option: GraphOptions['scale'], triangleEdgeLength: number) {
    option ||= {}
    const scaleSize = 10 // length of scale line
    const textMargin = 24 // distance between triangle edge and scale text
    if (option.disable) return
    const ctx = this.context
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#000'
    // u axis
    for (let i = 1; i <= 5; i++) {
      ctx.strokeStyle = 'black'
      const pos = getCanvas2DCoord(.2 * i, 0, 1 - .2 * 1)
      applyTranformation(pos, triangleEdgeLength)
      ctx.beginPath()
      ctx.moveTo(pos[0], pos[1])
      ctx.lineTo(pos[0] - scaleSize * COS60, pos[1] + scaleSize * SIN60)
      ctx.stroke()
      ctx.fillText(`${.2 * 100 * i}%`, pos[0] - textMargin * COS60, pos[1] + textMargin * SIN60)
      if (option.innerLine) {
        ctx.beginPath()
        ctx.moveTo(...pos)
        const pos2 = getCanvas2DCoord(.2 * i, 1 - .2 * i, 0)
        applyTranformation(pos2, triangleEdgeLength)
        ctx.strokeStyle = option.innerLineColor || '#ffffff0f'
        ctx.lineTo(...pos2)
        ctx.stroke()
      }
    }
    // v axis
    for (let i = 1; i <= 5; i++) {
      ctx.strokeStyle = 'black'
      const pos = getCanvas2DCoord(1 - .2 * i, 0.2 * i, 0)
      applyTranformation(pos, triangleEdgeLength)
      ctx.beginPath()
      ctx.moveTo(pos[0], pos[1])
      ctx.lineTo(pos[0] + scaleSize, pos[1])
      ctx.stroke()
      ctx.fillText(`${.2 * 100 * i}%`, pos[0] + textMargin, pos[1])
      if (option.innerLine) {
        ctx.beginPath()
        ctx.moveTo(...pos)
        const pos2 = getCanvas2DCoord(0, 0.2 * i, 1 - .2 * i)
        applyTranformation(pos2, triangleEdgeLength)
        ctx.strokeStyle = option.innerLineColor || '#ffffff0f'
        ctx.lineTo(...pos2)
        ctx.stroke()
      }
    }
    // w axis
    for (let i = 1; i <= 5; i++) {
      ctx.strokeStyle = 'black'
      const pos = getCanvas2DCoord(0, 1 - .2 * i, .2 * i)
      applyTranformation(pos, triangleEdgeLength)
      ctx.beginPath()
      ctx.moveTo(pos[0], pos[1])
      ctx.lineTo(pos[0] - scaleSize * COS60, pos[1] - scaleSize * SIN60)
      ctx.stroke()
      ctx.fillText(`${.2 * 100 * i}%`, pos[0] - textMargin * COS60, pos[1] - textMargin * SIN60)
      if (option.innerLine) {
        ctx.beginPath()
        ctx.moveTo(...pos)
        const pos2 = getCanvas2DCoord(1 - 0.2 * i, 0, .2 * i)
        applyTranformation(pos2, triangleEdgeLength)
        ctx.strokeStyle = option.innerLineColor || '#ffffff0f'
        ctx.lineTo(...pos2)
        ctx.stroke()
      }
    }

  }
  private drawAxisTitle(data: GraphOptions['axisTitle'], edgeLength: number) {
    if (!data) return
    const margin = 60
    const ctx = this.context
    ctx.font = '30px Arial'
    ctx.fillStyle = 'black'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // u axis
    if (!data[0].disable) {
      const pos1 = getCanvas2DCoord(.5, 0, .5)
      applyTranformation(pos1, edgeLength, [0, margin])
      ctx.beginPath()
      ctx.fillText(data[0].text, ...pos1)
    }
    // v axis
    if (!data[1].disable) {
      const pos2 = getCanvas2DCoord(.5, .5, 0)
      applyTranformation(pos2, edgeLength, [margin, 0])
      ctx.save()
      ctx.translate(...pos2)
      ctx.rotate(Math.PI / 3)
      ctx.beginPath()
      ctx.fillText(data[1].text, 0, 0)
      ctx.restore()
    }
    // w axis
    if (!data[2].disable) {
      const pos3 = getCanvas2DCoord(0, .5, 0.5)
      applyTranformation(pos3, edgeLength, [- margin, 0])
      ctx.save()
      ctx.translate(...pos3)
      ctx.beginPath()
      ctx.rotate(-Math.PI / 3)
      ctx.textBaseline = 'middle'
      ctx.fillText(data[2].text, 0, 0)
      ctx.restore()
    }
  }
  private drawPoints(content: GraphOptions['data'], triangleEdgeLength: number) {
    if (!content || content.length === 0) return
    this.data = content
    let x = 0  //reduce gc
    let y = 0
    let u = 0
    let v = 0
    let w = 0
    const ctx = this.context
    const PIx2 = Math.PI * 2
    ctx.strokeStyle = 'dodgerblue'
    for (var i = 0, l = content.length; i < l; i++) {
      const point = content[i]
      const data = this.data[i]
      let dotSize = point.dotSize || 5
      // [x, y] = getCanvas2DCoord(...point.coordinate)
      // boost performance
      u = point.coordinate[0]
      v = point.coordinate[1]
      w = point.coordinate[2]
      x = v * COS60 + u
      y = (1 - v) * SIN60
      x = Math.trunc(triangleEdgeLength * x)
      y = Math.trunc(triangleEdgeLength * y)

      if (point.type === 'dot') {
        if (point.dotColor) ctx.fillStyle = point.dotColor // this one takes really long
        if (point.dotSize) dotSize = point.dotSize
        ctx.beginPath()
        ctx.arc(x, y, dotSize, 0, PIx2)
        ctx.fill()
      }
      // tooltip
      if (this.enableTooltip) {
        data.xyCoord = [x, y]
        data.squareRadius = dotSize ** 2

        data.uAxisCoord = [Math.trunc(u*triangleEdgeLength), Math.trunc(SIN60*triangleEdgeLength)]
        data.vAxisCoord = [Math.trunc((v*COS60+1-v)*triangleEdgeLength), Math.trunc((1-v)*SIN60*triangleEdgeLength)]
        data.wAxisCoord = [Math.trunc((1-w)*COS60*triangleEdgeLength), Math.trunc(w*SIN60*triangleEdgeLength)]
      }



    }
  }
  private drawHoverLayer(option: GraphOptions['tooltip']) {
    if (!this.data) return
    const canvas = document.createElement('canvas') as HTMLCanvasElement
    this.domElement.appendChild(canvas)
    Object.assign(canvas.style, {
      position: 'absolute',
      top: '0',
      left: '0'
    })
    canvas.height = this.domElement.clientHeight
    canvas.width = this.domElement.clientWidth
    canvas.addEventListener('mousemove', hoverItem)
    const ctx = canvas.getContext('2d')
    ctx.translate(...this.offset)
    ctx.strokeStyle = '#f44e'
    ctx.setLineDash([2, 2])
    ctx.fillStyle = '#f00f'
    const that = this
    function hoverItem(e: MouseEvent) {
      requestAnimationFrame(() => {
        ctx.clearRect(0,0,canvas.height,canvas.width)
        const x = e.offsetX - that.offset[0]
        const y = e.offsetY - that.offset[1]
        
        const item = pick(x, y)
        if (!item) return
        // draw dash lines to axes
        ctx.beginPath()
        ctx.moveTo(...item.xyCoord)
        ctx.lineTo(...item.uAxisCoord)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(...item.xyCoord)
        ctx.lineTo(...item.vAxisCoord)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(...item.xyCoord)
        ctx.lineTo(...item.wAxisCoord)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(...item.xyCoord,item.dotSize,0,Math.PI*2)
        ctx.fill()
      })
    }
    function pick(x: number, y: number) {
      // maybe add a spatial search tree for better performance
      // TODO: no early returns, since there would be mutlple points at the same place
      for (let i = 0, l = that.data.length; i < l; i++) {
        const point = that.data[i]
        const squareDistance = (x - point.xyCoord[0]) ** 2 + (y - point.xyCoord[1]) ** 2
        if (squareDistance < point.squareRadius) {
          return point
        }
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
  tooltip?: {
    disable?: boolean
  }
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
  uAxisCoord: [number, number],
  vAxisCoord: [number, number],
  wAxisCoord: [number, number]
}

interface DataForSearch extends DataOptions {
  xyCoord: [number, number],
  squareRadius: number
}









// actually, w is ignored. u + v + w should always equal 1
export function getCanvas2DCoord(u: number, v: number, w: number): [number, number] {
  const x = v * COS60 + u
  const y = (1 - v) * SIN60  //canvas2d coordinate
  return [x, y]
}

function applyTranformation(position: [number, number], scale: number, translate?: [number, number]) {
  position[0] *= scale
  position[1] *= scale
  if (!translate) return position
  position[0] += translate[0]
  position[1] += translate[1]
  return position
}