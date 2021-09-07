import TGraph from './build/Graph.js'
import { GUI } from './lib/dat.gui.module.js'

const gui = new GUI()
const guiOptions = {
  tooltip: true,
  ticks: true,
  'point count': 10,
  're-render': rerender
}
gui.add(guiOptions, 'tooltip')
gui.add(guiOptions, 'ticks')
gui.add(guiOptions, 'point count', 0, 1e4, 1)
gui.add(guiOptions, 're-render')

function rerender() {
  console.log('rerender');
}


getEnergySourceData().then(res=>{
  const data = res.map(item=>{
    const sum = item['Fossil fuels per capita (kWh)']+item['Nuclear per capita (kWh)']+item['Renewables per capita (kWh)']
    item.title = item.Entity
    item.dotSize = 8
    item.coordinate = [item['Fossil fuels per capita (kWh)']/sum,item['Nuclear per capita (kWh)']/sum,item['Renewables per capita (kWh)']/sum]
    item.type = 'dot'

    return item
  })
  const graph = new TGraph('.graph',{
    width:980,
    height:720,
    data,
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
})
function getEnergySourceData() {
  const result = []
  const countries = ['Austrilia', 'Brazil', 'Canada', 'China', 'France', 'Germany', 'India', 'Italy', 'Japan', 'Russia', 'United States', 'World']
  return fetch('./data/per-capita-energy-source-stacked.json').then(res => res.json()).then(data => {
    for (let item of data) {
      if (item.Year !== 2019) continue
      if (countries.includes(item.Entity)) result.push(item)
    }
    return result
  })
}


// energy mix data source: https://ourworldindata.org/energy-mix
// <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>