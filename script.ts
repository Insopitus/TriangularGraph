import TriangularGraph from './build/TriangularGraph.js'
import { GUI } from './lib/dat.gui.module.js'

const gui = new GUI()
const guiOptions = {
  width: document.body.clientWidth,
  height: document.body.clientHeight,
  tooltip: true,
  ticks: true,
  'point count': 10,
  're-render': rerender
}
gui.add(guiOptions, 'width', 100, 4000, 1)
gui.add(guiOptions, 'height', 100, 4000, 1)
gui.add(guiOptions, 'tooltip')
gui.add(guiOptions, 'ticks')
gui.add(guiOptions, 'point count', 0, 1e4, 1)
gui.add(guiOptions, 're-render')
let graph: TriangularGraph
function rerender() {
  // console.log('rerender');
  graph.destroy()
  graph = new TriangularGraph('.graph', {
    data:generateRandomData(guiOptions['point count']),
    width: guiOptions.width,
    height: guiOptions.height,
    tooltip: {
      disable: !guiOptions.tooltip,
    },
    axis: {
      titles:[
        {
          text:"Axis U"
        },
        {
          text:"Axis V"
        },
        {
          text:"Axis W"
        }
      ],
      ticks:{
        disable:!guiOptions.ticks
      }
    },
    title:{
      text:"Randomly Generated Data"
    },
    subtitle:{
      text:`Press "re-render" to recreate the graph based on the new settings`
    },
    

  })
}



graph = new TriangularGraph('.graph', {
  width: guiOptions.width,
  height: guiOptions.height,
  data:generateRandomData(10),
  title:{
    text:"Randomly Generated Data"
  },
  subtitle:{
    text:`Press "re-render" to recreate the graph based on the new settings`
  },
  axis: {
    titles: [
      {
        text: 'Fossil fuels'
      },
      {
        text: 'Nuclear'
      },
      {
        text: 'Renewables'
      }
    ]
  }
})


function generateRandomData(count:number){
  let result = []
  for(let i=0;i<count;i++){
    let u = Math.random()
    let v = (1 - u)*Math.random()
    let w = 1- u -v
    const data = {
      coordinate:[u,v,w],
      title:`Entity ${i}`,
      dotColor:`rgb(${255*u},${255*v},${255*w})`
    }
    result.push(data)
  }
  return result
}
