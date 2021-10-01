const SIN60 = Math.sin(Math.PI / 3)
const COS60 = Math.cos(Math.PI / 3)
const TAN60 = SIN60 / COS60
export default class Graph {
  #domElement: HTMLDivElement
  #context: CanvasRenderingContext2D
  #options: GraphOptions
  data: Partial<DataForSearch>[]
  #enableTooltip = false
  #imageCache: Map<string, HTMLImageElement> // if the data uses image instead of dots // TODO use cache instead
  // define the default/calculated sizes and positions of all the entities
  #layout = {
    width: 600,
    height: 400,
    offsets: {
      title: [300, 0],
      subtitle: [300, 0],
      triangle: [150, 100],
    },
    fontSizes: {
      title: 24,
      subtitle: 20,
      axisTitle: 24,
      tickText: 12,
      tooltipTitle: 13,
      tooltipDetail: 11,
    },
    sizes: {
      triangle: 300, //side length
      dotSize: 28, // size of data dots and images
      tickLength: 10,
    }
  }
  get domElement() {
    return this.#domElement
  }
  // #container:Element
  constructor(query: string, options: GraphOptions) {
    if (!options) throw 'options are needed.'
    this.#options = options // don't modify the options object, and don't stringify+parse to deep clone it (performance and callback funtion options)
    const layout = this.#layout
    const opt = this.#options
    layout.width = opt.width || layout.width  // TODO maybe move this to calcLayout method
    layout.height = opt.height || layout.height
    const container = document.querySelector(query)
    if (!container) throw `The elment ${query} cannot be found.`
    // this.#container = container
    this.#domElement = document.createElement('div')
    this.#domElement.className = 'graph-container'
    Object.assign(this.#domElement.style, {
      height: layout.height + 'px',
      width: layout.width + 'px',
      position: 'relative'
    })
    const canvas = document.createElement('canvas')
    canvas.width = layout.width
    canvas.height = layout.height
    canvas.style.position = 'absolute'
    container.appendChild(this.#domElement)
    this.#domElement.appendChild(canvas)
    const context = canvas.getContext('2d', { alpha: false })
    // background color
    context.fillStyle = 'white'
    context.fillRect(0, 0, layout.width, layout.height)

    this.#context = context
    this.#enableTooltip = !opt.tooltip?.disable
    this.render(opt.data)

  }
  render(data?: GraphOptions['data']) {
    data ||= this.#options.data
    // const ctx = this.#context
    // const offsets = this.#layout.offsets
    const t1 = performance.now()
    this.calcLayout()
    this.drawTitles(this.#options.title, this.#options.subtitle)
    this.drawTriangleBody()
    this.drawAxes(this.#options.axis)
    this.drawDataSet(data)
    this.drawTooltipLayer(this.#options.tooltip)
    console.debug(`Rendering ${data.length} points took ${performance.now() - t1} ms.`)
  }
  // TODO all the default values should be given here to calculate the layout
  private calcLayout() {
    const { title, subtitle, axis } = this.#options
    const layout = this.#layout
    const width = layout.width
    const height = layout.height
    const fullSize = Math.min(width, height)
    const titleSize = Math.round(fullSize * .04)
    const subtitleSize = Math.round(titleSize * .75)
    layout.fontSizes.title = title?.fontSize || titleSize
    layout.fontSizes.subtitle = subtitle?.fontSize || subtitleSize
    layout.fontSizes.axisTitle = axis?.titles?.[0]?.fontSize || titleSize
    layout.fontSizes.tickText = Math.round(titleSize/2)

    const offsets = layout.offsets
    const margin = Math.round(height / 50)
    let verticalOffset = margin * 4 // extra margin on top
    if (title && !title.disable) {
      offsets.title[0] = Math.round(width / 2)
      offsets.title[1] = verticalOffset
      verticalOffset += layout.fontSizes.title
      verticalOffset += margin
    }
    if (subtitle && !subtitle.disable) {
      offsets.subtitle[0] = Math.round(width / 2)
      offsets.subtitle[1] = verticalOffset
      verticalOffset += layout.fontSizes.subtitle
    }
    verticalOffset += margin * 3 // extra margin between title and graph
    const axisTitleSize = layout.fontSizes.axisTitle
    const triangleSideLength = Math.min(height - verticalOffset - 2 * margin - axisTitleSize, width - 2 * axisTitleSize - 4 * margin)
    layout.sizes.triangle = triangleSideLength

    offsets.triangle[0] = Math.round(width / 2 - triangleSideLength / 2)
    offsets.triangle[1] = verticalOffset

    console.log(this.#layout);
  }
  private drawTitles(titleOptions: TextOptions, subtitleOptions: TextOptions) {
    if (!titleOptions || titleOptions.disable) return
    const ctx = this.#context
    const { offsets, fontSizes } = this.#layout

    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    // ctx.save()
    if (titleOptions && !titleOptions.disable) {
      ctx.translate(offsets.title[0], offsets.title[1])
      ctx.fillStyle = titleOptions.color || '#000000'
      const fontSize = fontSizes.title
      const fontName = titleOptions.font || 'Arial'
      ctx.font = `bold ${fontSize}px ${fontName}`
      ctx.fillText(titleOptions.text, 0, 0)
      ctx.resetTransform()
    }
    if (subtitleOptions && !subtitleOptions.disable) {
      ctx.translate(offsets.subtitle[0], offsets.subtitle[1])
      ctx.fillStyle = subtitleOptions.color || '#000'
      const fontSize2 = fontSizes.subtitle
      const fontName2 = subtitleOptions.font || 'Times New Roman'
      ctx.font = `${fontSize2}px ${fontName2}`
      ctx.fillText(subtitleOptions.text, 0, 0)
    }
    ctx.resetTransform()
  }
  private drawTriangleBody() {
    const sideLength = this.#layout.sizes.triangle
    const ctx = this.#context
    ctx.fillStyle = '#fdfdfdff'
    const triangleHeight = sideLength * SIN60
    ctx.translate(this.#layout.offsets.triangle[0], this.#layout.offsets.triangle[1])
    ctx.beginPath()
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 1
    ctx.moveTo(0, triangleHeight)
    ctx.lineTo(Math.round(.5 * sideLength), 0)
    ctx.lineTo(sideLength, triangleHeight)
    ctx.lineTo(0, triangleHeight)
    ctx.stroke()
    ctx.fill()
    ctx.resetTransform()
  }
  private drawAxes(options: GraphOptions['axis']) {
    options ||= {}
    const ctx = this.#context
    ctx.translate(this.#layout.offsets.triangle[0], this.#layout.offsets.triangle[1])
    this.drawTicks(options.ticks)
    this.drawAxisTitle(options.titles)
    ctx.resetTransform()
  }
  private drawTicks(option: TickOptions) {
    option ||= {}
    const layout = this.#layout
    const scaleSize = layout.sizes.tickLength // length of scale line
    const textMargin = 24 // distance between triangle edge and scale text
    if (option.disable) return
    const triangleSideLength = this.#layout.sizes.triangle
    const ctx = this.#context
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#000'
    ctx.font = `${layout.fontSizes.tickText}px Arial`
    const defaultInnerLineColor = '#0f0f0f1f'
    // u axis
    for (let i = 1; i <= 5; i++) {
      ctx.strokeStyle = 'black'
      const pos = getCanvas2DCoord(.2 * i, 0, 1 - .2 * 1)
      applyTranformation(pos, triangleSideLength)
      ctx.beginPath()
      ctx.moveTo(pos[0], pos[1])
      ctx.lineTo(pos[0] - scaleSize * COS60, pos[1] + scaleSize * SIN60)
      ctx.stroke()
      ctx.fillText(`${.2 * 100 * i}%`, pos[0] - textMargin * COS60, pos[1] + textMargin * SIN60)
      if (!option.disableInnerLine) {
        ctx.beginPath()
        ctx.moveTo(...pos)
        const pos2 = getCanvas2DCoord(.2 * i, 1 - .2 * i, 0)
        applyTranformation(pos2, triangleSideLength)
        ctx.strokeStyle = option.innerLineColor || defaultInnerLineColor
        ctx.lineTo(...pos2)
        ctx.stroke()
      }
    }
    // v axis
    for (let i = 1; i <= 5; i++) {
      ctx.strokeStyle = 'black'
      const pos = getCanvas2DCoord(1 - .2 * i, 0.2 * i, 0)
      applyTranformation(pos, triangleSideLength)
      ctx.beginPath()
      ctx.moveTo(pos[0], pos[1])
      ctx.lineTo(pos[0] + scaleSize, pos[1])
      ctx.stroke()
      ctx.fillText(`${.2 * 100 * i}%`, pos[0] + textMargin, pos[1])
      if (!option.disableInnerLine) {
        ctx.beginPath()
        ctx.moveTo(...pos)
        const pos2 = getCanvas2DCoord(0, 0.2 * i, 1 - .2 * i)
        applyTranformation(pos2, triangleSideLength)
        ctx.strokeStyle = option.innerLineColor || defaultInnerLineColor
        ctx.lineTo(...pos2)
        ctx.stroke()
      }
    }
    // w axis
    for (let i = 1; i <= 5; i++) {
      ctx.strokeStyle = 'black'
      const pos = getCanvas2DCoord(0, 1 - .2 * i, .2 * i)
      applyTranformation(pos, triangleSideLength)
      ctx.beginPath()
      ctx.moveTo(pos[0], pos[1])
      ctx.lineTo(pos[0] - scaleSize * COS60, pos[1] - scaleSize * SIN60)
      ctx.stroke()
      ctx.fillText(`${.2 * 100 * i}%`, pos[0] - textMargin * COS60, pos[1] - textMargin * SIN60)
      if (!option.disableInnerLine) {
        ctx.beginPath()
        ctx.moveTo(...pos)
        const pos2 = getCanvas2DCoord(1 - 0.2 * i, 0, .2 * i)
        applyTranformation(pos2, triangleSideLength)
        ctx.strokeStyle = option.innerLineColor || defaultInnerLineColor
        ctx.lineTo(...pos2)
        ctx.stroke()
      }
    }

  }
  private drawAxisTitle(data: TextOptions[]) {
    if (!data) return
    const sideLength = this.#layout.sizes.triangle
    const margin = 60 // TODO uniform margins
    const ctx = this.#context
    const layout = this.#layout
    const defaultFontSize = layout.fontSizes.axisTitle
    ctx.font = `${defaultFontSize}px Arial`
    ctx.fillStyle = 'black'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // u axis
    if (!data[0].disable) {
      if (data[0].fontSize || data[0].font) {
        ctx.font = `${data[0].fontSize || defaultFontSize}px ${data[0].font || 'Arial'}`
      }
      const pos1 = getCanvas2DCoord(.5, 0, .5)
      applyTranformation(pos1, sideLength, [0, margin])
      ctx.beginPath()
      ctx.fillText(data[0].text, ...pos1)
    }
    // v axis
    if (!data[1].disable) {
      if (data[1].fontSize || data[1].font) {
        ctx.font = `${data[1].fontSize || defaultFontSize}px ${data[1].font || 'Arial'}`
      }
      const pos2 = getCanvas2DCoord(.5, .5, 0)
      applyTranformation(pos2, sideLength, [margin, 0])
      ctx.save()
      ctx.translate(...pos2)
      ctx.rotate(Math.PI / 3)
      ctx.beginPath()
      ctx.fillText(data[1].text, 0, 0)
      ctx.restore()
    }
    // w axis
    if (!data[2].disable) {
      if (data[2].fontSize || data[2].font) {
        ctx.font = `${data[2].fontSize || defaultFontSize}px ${data[2].font || 'Arial'}`
      }
      const pos3 = getCanvas2DCoord(0, .5, 0.5)
      applyTranformation(pos3, sideLength, [- margin, 0])
      ctx.save()
      ctx.translate(...pos3)
      ctx.beginPath()
      ctx.rotate(-Math.PI / 3)
      ctx.textBaseline = 'middle'
      ctx.fillText(data[2].text, 0, 0)
      ctx.restore()
    }
  }
  private drawDataSet(content: GraphOptions['data']) {
    if (!content || content.length === 0) return
    this.data = content
    const layout = this.#layout
    const triangleSideLength = this.#layout.sizes.triangle
    let point: DataOptions //reduce gc
    let data: Partial<DataForSearch>
    // let dotSize = 5
    const ctx = this.#context
    ctx.translate(this.#layout.offsets.triangle[0], this.#layout.offsets.triangle[1])
    const PIx2 = Math.PI * 2
    ctx.strokeStyle = 'dodgerblue'
    const enableTooltip = this.#enableTooltip
    for (let i = 0, l = content.length; i < l; i++) {
      point = content[i]
      data = this.data[i]
      let dotSize = point.dotSize || 5
      // [x, y] = getCanvas2DCoord(...point.coordinate)
      // boost performance
      let u = point.coordinate[0]
      let v = point.coordinate[1]
      let w = point.coordinate[2]
      let x = v * COS60 + u
      let y = (1 - v) * SIN60
      x = Math.round(triangleSideLength * x)
      y = Math.round(triangleSideLength * y)
      const imageSize = point.imageSize || layout.sizes.dotSize
      if (point.type === 'image' && point.imageURL) {
        const image = new Image()
        image.src = point.imageURL
        image.onload = () => {
          createImageBitmap(image, 0, 0, image.width, image.height).then(img => {
            this.data[i].image = img

            ctx.drawImage(img, x - imageSize / 2, y - imageSize / 2, imageSize, imageSize)
          })
        }
      } else {
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

        data.uAxisCoord = [Math.round(u * triangleSideLength), Math.round(SIN60 * triangleSideLength)]
        data.vAxisCoord = [Math.round((v * COS60 + 1 - v) * triangleSideLength), Math.round((1 - v) * SIN60 * triangleSideLength)]
        data.wAxisCoord = [Math.round((1 - w) * COS60 * triangleSideLength), Math.round(w * SIN60 * triangleSideLength)]
      }



    }
    // ctx.resetTransform() //TODO: the async draws make resetTransform imposible, i need a better implementation
  }
  private drawTooltipLayer(option: GraphOptions['tooltip']) {
    if (!this.data) return
    const canvas = document.createElement('canvas') as HTMLCanvasElement
    // this.#tooltipCanvas = canvas
    this.#domElement.appendChild(canvas)
    const layout = this.#layout
    Object.assign(canvas.style, {
      position: 'absolute',
      top: '0',
      left: '0'
    })
    canvas.height = layout.height
    canvas.width = layout.width
    const tooltipLineSize = 20
    let nameFontSize = layout.fontSizes.tooltipTitle
    let detailFontSize = layout.fontSizes.tooltipDetail
    let gap = 4
    let verticalPadding = 8 //padding top and bottom of the rectangle
    let horizontalPadding = 12 //padding left and right of the rectangle
    let rectHeight = verticalPadding * 2 + nameFontSize + detailFontSize * 3 + gap * 3  // 
    let rectWidth = 100  // will recalculated later
    let picked: Partial<DataForSearch> = null

    const offset = this.#layout.offsets.triangle
    const renderHoverEffect = (e: MouseEvent) => {
      requestAnimationFrame(() => {

        const x = e.offsetX - offset[0]
        const y = e.offsetY - offset[1]
        const item = pick(x, y, this.data)
        //TODO no repainting if cursor is still inside the same dot 
        // if (item === picked) return  //(looks like its bugged)
        ctx.clearRect(-offset[0], -offset[1], canvas.width, canvas.height)
        if (!item) return
        const imageSize = item.imageSize || layout.sizes.dotSize
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
        const axisTitles = this.#options?.axis?.titles
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
        // debugger
        if (item.type === 'image' && item.image) {
          ctx.drawImage(item.image, item.xyCoord[0] - imageSize / 2, item.xyCoord[1] - imageSize / 2, imageSize, imageSize)
          // a cicle to highlight the dot
          ctx.beginPath()
          ctx.arc(...item.xyCoord, imageSize / 2, 0, Math.PI * 2)
          ctx.stroke()

        } else {
          // repaint the dot to cover the dashed lines
          ctx.beginPath()
          ctx.fillStyle = item.dotColor || mainColor
          ctx.arc(...item.xyCoord, item.dotSize, 0, Math.PI * 2)
          ctx.fill()
          // a cicle to highlight the dot
          ctx.beginPath()
          ctx.arc(...item.xyCoord, item.dotSize, 0, Math.PI * 2)
          ctx.stroke()
        }


      })
    }
    canvas.addEventListener('mousemove', renderHoverEffect)
    const ctx = canvas.getContext('2d')
    ctx.translate(offset[0], offset[1])

    // ctx.fillStyle = '#f00f'
    const mainColor = '#000e'
    ctx.strokeStyle = mainColor
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'



  }
  destroy() {
    this.#domElement.remove()
    // brower will handle the event listeners itself
  }
}
function pick(x: number, y: number, data: Partial<DataForSearch>[]) {
  // maybe add a spatial search tree for better performance --- unnessassary, it's much much faster than drawing those amount of points
  // TODO: no early returns, since there would be mutlple points picked at the same place
  // maybe find a list and return the closest
  let point: Partial<DataForSearch>
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
  title?: TextOptions
  subtitle?: TextOptions
  axis?: AxisOptions,
  data: DataOptions[],
  tooltip?: {
    disable?: boolean
  }
}
// all kinds of text
interface TextOptions {
  disable?: boolean
  text?: string
  font?: string
  fontSize?: number
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
  type?: 'dot' | 'image', //image type not implemented
  title?: string,
  dotSize?: number
  dotColor?: string
  imageURL?: string
  imageSize?: number
  coordinate?: [number, number, number]
}

interface DataForSearch extends DataOptions {
  xyCoord: [number, number],
  squareRadius: number
  uAxisCoord: [number, number],
  vAxisCoord: [number, number],
  wAxisCoord: [number, number],
  image: ImageBitmap
}









// actually, w is ignored. u + v + w should always equal 1
export function getCanvas2DCoord(u: number, v: number, w: number): [number, number] {
  const x = v * COS60 + u
  const y = (1 - v) * SIN60  //canvas2d coordinate (before mutiply with triangle side length)
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