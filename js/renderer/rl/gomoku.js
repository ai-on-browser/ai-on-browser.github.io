import GomokuRLEnvironment from"../../../lib/rl/gomoku.js";import{Game}from"../../platform/game/base.js";export default class GomokuRenderer{constructor(t){this.renderer=t,this._game=new Gomoku(t.platform),this._org_width=t.width,this._org_height=t.height}init(t){this.renderer.width=500,this.renderer.height=500,this._envrenderer=new Renderer(this.renderer.env,{width:this.renderer.width,height:this.renderer.height,g:t}),this._envrenderer.init()}render(){this._envrenderer.render()}game(...t){return t[0]||(t[0]=new ManualPlayer(this._envrenderer)),t[1]||(t[1]=new ManualPlayer(this._envrenderer)),t[0].turn=GomokuRLEnvironment.BLACK,t[1].turn=GomokuRLEnvironment.WHITE,this._game.players=t,this._game}close(){this.renderer.width=this._org_width,this.renderer.height=this._org_height}}class Renderer{constructor(t,e={}){this.env=t,this._size=[e.width||200,e.height||200],this.svg=document.createElementNS("http://www.w3.org/2000/svg","svg"),this.svg.setAttribute("width",this._size[0]),this.svg.setAttribute("height",this._size[1]),this.svg.setAttribute("viewbox","0 0 200 200"),e.g&&e.g.replaceChildren(this.svg)}init(){const t=this._size[0],e=this._size[1],r=t/this.env._size[1],i=e/this.env._size[0];this._cells=[];for(let t=0;t<this.env._size[0];t++){this._cells[t]=[];for(let e=0;e<this.env._size[1];e++){this._cells[t][e]=document.createElementNS("http://www.w3.org/2000/svg","g"),this.svg.appendChild(this._cells[t][e]);const s=document.createElementNS("http://www.w3.org/2000/svg","rect");s.setAttribute("x",e*r),s.setAttribute("y",t*i),s.setAttribute("width",r),s.setAttribute("height",i),s.setAttribute("fill","#eeddcc"),s.setAttribute("stroke","#333333"),s.setAttribute("stroke-width","1"),this._cells[t][e].appendChild(s)}}}render(){const t=this._size[0],e=this._size[1],r=t/this.env._size[1],i=e/this.env._size[0];for(let t=0;t<this._cells.length;t++)for(let e=0;e<this._cells[t].length;e++){if(this._cells[t][e].querySelector("circle")?.remove(),this.env._board.at([t,e])===GomokuRLEnvironment.EMPTY)continue;const s=document.createElementNS("http://www.w3.org/2000/svg","circle");s.setAttribute("cx",r*(e+.5)),s.setAttribute("cy",i*(t+.5)),s.setAttribute("r",.4*Math.min(r,i)),s.setAttribute("stroke","black"),s.setAttribute("stroke-width","1"),this.env._board.at([t,e])===GomokuRLEnvironment.WHITE?s.setAttribute("fill","white"):this.env._board.at([t,e])===GomokuRLEnvironment.BLACK&&s.setAttribute("fill","black"),this._cells[t][e].appendChild(s)}}}class Gomoku extends Game{constructor(t){super(t),this._board=t.env._board,this.turns=[GomokuRLEnvironment.BLACK,GomokuRLEnvironment.WHITE]}_showResult(t){const e=this._board.winner;t.innerHTML=e===GomokuRLEnvironment.BLACK?"BLACK WIN":e===GomokuRLEnvironment.WHITE?"WHITE WIN":"DRAW"}}class ManualPlayer{constructor(t){this._turn=null,this._renderer=t,this._obj=null}set turn(t){this._turn=t}action(t){const e=this._renderer._size[0],r=this._renderer._size[1];this._obj=document.createElementNS("http://www.w3.org/2000/svg","g"),this._renderer.svg.appendChild(this._obj);const i=document.createElementNS("http://www.w3.org/2000/svg","rect");return i.setAttribute("x",0),i.setAttribute("y",0),i.setAttribute("width",e),i.setAttribute("height",r),i.setAttribute("opacity",0),this._obj.appendChild(i),new Promise((s=>{i.onclick=i=>{const n=d3.pointer(i),h=[Math.floor(n[1]/e*t.size[0]),Math.floor(n[0]/r*t.size[1])];this._obj.remove(),this._obj=null,s(h)}}))}close(){this._obj?.remove()}}