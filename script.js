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