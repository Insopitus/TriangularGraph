
import Graph from "./src/Graph";
const POINT_COUNT = 1e5
const data = new Array(POINT_COUNT)
for(let i=0;i<POINT_COUNT;i++){
  const u = Math.random()
  const v = Math.min(Math.random(),1-u)
  const w=0
  data[i]={
    type:'dot',
    dotColor:'red',
    dotSize:2,
    coordinate:[u,v,w]
  }
}
const graph = new Graph('.graph',{
  width:1200,
  height:800,
  title:[
    {
      text:'U Axis',
      fontSize:20
    },
    {
      text:'V Axis',
      fontSize:20
    },
    {
      text:'W Axis',
      fontSize:20
    },
  ],
  data
})



