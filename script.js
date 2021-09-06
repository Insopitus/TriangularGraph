import TGraph from './build/Graph.js'
import { GUI } from './lib/dat.gui.module.js'
const gui = new GUI()
const guiOptions = {
  tooltip:true,
  ticks:true,
  'point count':10,
  're-render':rerender
}
gui.add(guiOptions,'tooltip')
gui.add(guiOptions,'ticks')
gui.add(guiOptions,'point count',0,1e4,1)
gui.add(guiOptions,'re-render')

function rerender(){
  console.log('rerender');
}


// energy mix data source: https://ourworldindata.org/energy-mix
// <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>