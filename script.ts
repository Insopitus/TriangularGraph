
import Graph from "./src/Graph";


const option = {
  width: 1200,
  height: 800,
  axisTitle: [
    {
      text: 'U Axis',
      fontSize: 20
    },
    {
      text: 'V Axis',
      fontSize: 20
    },
    {
      text: 'W Axis',
      fontSize: 20
    },
  ],
  scale:{
    innerLine:true,
    innerLineColor:'rgba(1,1,1,.2)'
  },
  data:generatePoints()
}
const graph = new Graph('.graph', option)
console.log(graph);
// animate()
function animate(){
  const option = {
    width: 1200,
    height: 800,
    axisTitle: [
      {
        text: 'U Axis',
        fontSize: 20
      },
      {
        text: 'V Axis',
        fontSize: 20
      },
      {
        text: 'W Axis',
        fontSize: 20
      },
    ],
    data:generatePoints()
  }
  
  graph.render(option.data)
  
  
  requestAnimationFrame(animate)
}
function generatePoints() {
  const t0 = performance.now()
  const POINT_COUNT = 1e1

  const data = new Array(POINT_COUNT)
  for (let i = 0; i < POINT_COUNT; i++) {
    let u = Math.random()
    let v = Math.random()
    let w = Math.random()
    const sum = u + v + w
    u = u / sum
    v = v / sum
    w = w / sum
    const colorU = Math.trunc(u * 0xff).toString(16).padStart(2, '0')
    const colorV = Math.trunc(v * 0xff).toString(16).padStart(2, '0')
    const colorW = Math.trunc(w * 0xff).toString(16).padStart(2, '0')
    data[i] = {
      type: 'dot',
      title:'Entity '+ i,
      dotColor: '#' + colorU + colorV + colorW,
      dotSize: 10,
      coordinate: [u, v, w]
    }
    // debugger
  }
  console.log(`Generating ${POINT_COUNT} points took ${performance.now() - t0} ms.`)
  return data
}



