const SIN60 = Math.sin(Math.PI / 3)
const COS60 = Math.cos(Math.PI / 3)
const TAN60 = SIN60 / COS60
export default class Graph {
  #domElement: HTMLDivElement
  #context: CanvasRenderingContext2D
  #options: GraphOptions
  #offset: [number, number]
  #data: Partial<DataForSearch>[]
  #enableTooltip = false
  #imageCache: Map<string, HTMLImageElement> // if the data uses image instead of dots
  #edgeLength:number
  constructor(query: string, options: GraphOptions) {
    if (!options) throw 'options are needed.'
    this.#options = options
    const width = options.width || 600
    const height = options.height || 400
    const container = document.querySelector(query)
    if (!container) throw `The elment ${query} cannot be found.`
    this.#domElement = document.createElement('div')
    this.#domElement.className = 'graph-container'
    Object.assign(this.#domElement.style, {
      height: height + 'px',
      width: width + 'px',
      position: 'relative'
    })
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.style.position = 'absolute'
    container.appendChild(this.#domElement)
    this.#domElement.appendChild(canvas)
    const context = canvas.getContext('2d', { alpha: false })
    // background color
    context.fillStyle = 'gray'
    context.fillRect(0, 0, width, height)
    const offsetX = 200
    const offsetY = 100
    this.#offset = [offsetX, offsetY]
    this.#edgeLength = 600
    context.translate(offsetX, offsetY) // use global tranlate instead of offset in every single path
    this.#context = context
    this.#enableTooltip = !options.tooltip?.disable  
    this.render(options.data)

  }
  render(data?: GraphOptions['data']) {
    data ||= this.#options.data

    const t1 = performance.now()
    this.drawTriangleBody()
    this.drawAxes(this.#options.axis)
    this.drawPoints(data)
    this.drawTooltipLayer(this.#options.tooltip)
    console.debug(`Rendering ${data.length} points took ${performance.now() - t1} ms.`)
  }
  private drawTriangleBody() {
    const edgeLength = this.#edgeLength
    const ctx = this.#context
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
  private drawAxes(options:GraphOptions['axis']){
    options||={}
    this.drawTicks(options.ticks)
    this.drawAxisTitle(options.titles)
  }
  private drawTicks(option: TickOptions) {
    option ||= {}
    const scaleSize = 10 // length of scale line
    const textMargin = 24 // distance between triangle edge and scale text
    if (option.disable) return
    const triangleEdgeLength = this.#edgeLength
    const ctx = this.#context
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
  private drawAxisTitle(data: AxisTitleOptions[]) {
    if (!data) return
    const edgeLength = this.#edgeLength
    const margin = 60
    const ctx = this.#context
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
  private drawPoints(content: GraphOptions['data']) {
    if (!content || content.length === 0) return
    this.#data = content    
    const triangleEdgeLength = this.#edgeLength
    let point:DataOptions //reduce gc
    let data:Partial<DataForSearch>
    // let dotSize = 5
    const ctx = this.#context
    const PIx2 = Math.PI * 2
    ctx.strokeStyle = 'dodgerblue'
    const enableTooltip = this.#enableTooltip
    for (var i = 0, l = content.length; i < l; i++) {
      point = content[i]
      data = this.#data[i]
      let dotSize = point.dotSize || 5
      // [x, y] = getCanvas2DCoord(...point.coordinate)
      // boost performance
      let u = point.coordinate[0]
      let v = point.coordinate[1]
      let w = point.coordinate[2]
      let x = v * COS60 + u
      let y = (1 - v) * SIN60
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
      if (enableTooltip) {
        data.xyCoord = [x, y]
        data.squareRadius = dotSize ** 2

        data.uAxisCoord = [Math.trunc(u * triangleEdgeLength), Math.trunc(SIN60 * triangleEdgeLength)]
        data.vAxisCoord = [Math.trunc((v * COS60 + 1 - v) * triangleEdgeLength), Math.trunc((1 - v) * SIN60 * triangleEdgeLength)]
        data.wAxisCoord = [Math.trunc((1 - w) * COS60 * triangleEdgeLength), Math.trunc(w * SIN60 * triangleEdgeLength)]
      }



    }
  }
  private drawTooltipLayer(option: GraphOptions['tooltip']) {
    if (!this.#data) return
    const edgeLength = this.#edgeLength
    const canvas = document.createElement('canvas') as HTMLCanvasElement
    this.#domElement.appendChild(canvas)
    Object.assign(canvas.style, {
      position: 'absolute',
      top: '0',
      left: '0'
    })
    canvas.height = this.#domElement.clientHeight
    canvas.width = this.#domElement.clientWidth
    canvas.addEventListener('mousemove', renderHoverEffect)
    const ctx = canvas.getContext('2d')
    ctx.translate(...this.#offset)

    // ctx.fillStyle = '#f00f'
    const mainColor = '#000e'
    ctx.strokeStyle = mainColor
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    const tooltipLineSize = 20
    let nameFontSize = 13
    let detailFontSize = 11
    let gap = 4
    let verticalPadding = 8 //padding top and bottom of the rectangle
    let horizontalPadding = 12 //padding left and right of the rectangle
    let rectHeight = verticalPadding * 2 + nameFontSize + detailFontSize * 3 + gap * 3  // 
    let rectWidth = 100  // will recalculated later
    const that = this
    let picked: Partial<DataForSearch> = null
    function renderHoverEffect(e: MouseEvent) {
      requestAnimationFrame(() => {

        const x = e.offsetX - that.#offset[0]
        const y = e.offsetY - that.#offset[1]
        const item = pick(x, y, that.#data)
        //TODO no repainting if cursor is still inside the same dot 
        // if (item === picked) return  //(looks like its bugged)
        ctx.clearRect(-that.#offset[0], -that.#offset[1], canvas.height+that.#offset[0], canvas.width+that.#offset[0])
        if (!item) return
        picked = item
        // draw dash lines to axes        
        ctx.setLineDash([8, 4])
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
        // a bubble to show the picked item's infomation
        let rectStartX = item.xyCoord[0] + tooltipLineSize * 2
        let rectStartY = item.xyCoord[1] - tooltipLineSize * TAN60 - rectHeight / 2
        ctx.beginPath()
        ctx.setLineDash([])
        ctx.moveTo(...item.xyCoord)
        ctx.lineTo(item.xyCoord[0] + tooltipLineSize, item.xyCoord[1] - tooltipLineSize * TAN60)
        ctx.lineTo(item.xyCoord[0] + tooltipLineSize * 2, item.xyCoord[1] - tooltipLineSize * TAN60)
        ctx.fillStyle = '#fff'
        ctx.fillRect(rectStartX, rectStartY, rectWidth, rectHeight)
        ctx.rect(rectStartX, rectStartY, rectWidth, rectHeight)
        ctx.stroke()
        ctx.fillStyle = '#000'
        ctx.font = `${nameFontSize}px Arial`
        ctx.fillText(item.title || '', rectStartX + horizontalPadding, rectStartY + verticalPadding)
        const width0 = ctx.measureText(item.title || '').width
        const axisTitles = that.#options?.axis?.titles
        ctx.font = `${detailFontSize}px Arial`
        const text1 = `${axisTitles?.[0]?.text || 'U'}: ${(item.coordinate[0] * 100).toFixed(2)}%`
        ctx.fillText(text1, rectStartX + horizontalPadding, rectStartY + verticalPadding + nameFontSize + gap)
        const width1 = ctx.measureText(text1).width
        const text2 = `${axisTitles?.[1]?.text || 'V'}: ${(item.coordinate[1] * 100).toFixed(2)}%`
        ctx.fillText(text2, rectStartX + horizontalPadding, rectStartY + verticalPadding + nameFontSize + gap * 2 + detailFontSize)
        const width2 = ctx.measureText(text2).width
        const text3 = `${axisTitles?.[2]?.text || 'W'}: ${(item.coordinate[2] * 100).toFixed(2)}%`
        ctx.fillText(text3, rectStartX + horizontalPadding, rectStartY + verticalPadding + nameFontSize + gap * 3 + detailFontSize * 2)
        const width3 = ctx.measureText(text3).width
        // TODO add user defined text rows
        rectWidth = Math.max(width0, width1, width2, width3) + horizontalPadding * 2
        // repaint the dot to cover the dashed lines
        ctx.beginPath()
        ctx.fillStyle = item.dotColor || mainColor
        ctx.arc(...item.xyCoord, item.dotSize, 0, Math.PI * 2)
        ctx.fill()
        // a cicle to highlight the dot
        ctx.beginPath()
        ctx.arc(...item.xyCoord, item.dotSize, 0, Math.PI * 2)
        ctx.stroke()

      })
    }

  }
}
function pick(x: number, y: number, data: Partial<DataForSearch>[]) {
  // maybe add a spatial search tree for better performance --- unnessassary, it's much much faster than drawing those amount of points
  // TODO: no early returns, since there would be mutlple points picked at the same place
  // maybe find a list and return the closest
  let point:Partial<DataForSearch>
  for (let i = 0, l = data.length; i < l; i++) {
    point = data[i]
    const squareDistance = (x - point.xyCoord[0]) ** 2 + (y - point.xyCoord[1]) ** 2
    if (squareDistance < point.squareRadius) {
      return point
    }
  }

}

interface GraphOptions {
  width?: number, //if not given, the graph will use the width of the container div.
  height?: number,
  // clockwise?: boolean, // unimplemented.
  axis?:AxisOptions,
  data: DataOptions[],
  tooltip?: {
    disable?: boolean
  }
}
interface AxisOptions {
  titles?:AxisTitleOptions[]
  ticks?:TickOptions,
}
interface AxisTitleOptions {
  disable?: boolean
  text?: string
  fontSize?: number
}
interface TickOptions {
  disable?: boolean,
  innerLine?: boolean,
  innerLineColor?: string,
}
interface DataOptions {
  type?: 'dot' | 'image', //image type not implemented
  title?: string,
  dotSize?: number
  dotColor?: string
  imageURL?: string
  coordinate?: [number, number, number]  
}

interface DataForSearch extends DataOptions {
  xyCoord: [number, number],
  squareRadius: number
  uAxisCoord: [number, number],
  vAxisCoord: [number, number],
  wAxisCoord: [number, number]
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