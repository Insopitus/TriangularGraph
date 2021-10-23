
import Graph from "./src/TriangularGraph";
import jsonData from './assets/per-capita-energy-source-stacked.json'
console.log(jsonData);


const option = {
  width: window.innerWidth,
  height: window.innerHeight,
  title:{
    text:'Energy Mix of Top 10 Industrial Countries'
  },
  subtitle:{
    text:'Just A Humble Subtitle'
  },
  axis:{
    ticks:{
      innerLine:true,
      innerLineColor:'rgba(1,1,1,.2)'
    },
    titles: [
      {
        text: 'Fossile',
        fontSize: 20
      },
      {
        text: 'Renewable',
        fontSize: 20
      },
      {
        text: 'Nuclear',
        fontSize: 20
      },
    ]
  },
  data:generatePoints()
}
// let graph = new Graph('.graph', option)
window.onresize = () =>{
  // const width = window.innerWidth
  // const height = window.innerHeight
  // option.width = width
  // option.height = height
  // graph.destroy()
  // graph = new Graph('.graph',option)

}
// graph.destroy()
// console.log(graph);
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
      type: 'image',
      title:'France',
      imageURL:'./assets/197-france.png',
      dotColor: '#' + colorU + colorV + colorW,
      dotSize: 10,
      coordinate: [u, v, w]
    }
    // debugger
  }
  console.debug(`Generating ${POINT_COUNT} points took ${performance.now() - t0} ms.`)
  return data
}

  const res = getEnergySourceData()
  const data = res.map(item=>{
    const sum = item['Fossil fuels per capita (kWh)']+item['Nuclear per capita (kWh)']+item['Renewables per capita (kWh)']
    item.title = item.Entity
    item.dotSize = 8
    item.coordinate = [item['Fossil fuels per capita (kWh)']/sum,item['Nuclear per capita (kWh)']/sum,item['Renewables per capita (kWh)']/sum]
    item.type = 'image'
    item.imageURL = `./assets/${item.Entity.toLowerCase().split(' ').join('-')}.png`
    return item
  })
  const graph = new Graph('.graph',{
    width:window.innerWidth,
    height:window.innerHeight,
    data,
    title:{
      text:'Energy Mix of top 10 Industrial Countries in 2019'
    },
    axis:{
      titles:[
        {
          text:'Fossil fuels'
        },
        {
          text:'Nuclear'
        },
        {
          text:'Renewables'
        }
      ]
    }
  })
function getEnergySourceData() {
  const result = []
  const countries = ['China', 'France', 'Germany', 'India', 'Italy', 'Japan', 'United States', 'South Korea', 'Indonesia', 'United Kingdom']
  
    for (let item of jsonData) {
      if (item.Year !== 2019) continue
      if (countries.includes(item.Entity)) result.push(item)
    }
    return result
}



