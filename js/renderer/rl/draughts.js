import DraughtsRLEnvironment from"../../../lib/rl/draughts.js";import{Game}from"../../platform/game/base.js";export default class DraughtsRenderer{constructor(t){this.renderer=t,this._game=new Draughts(t.platform),this._org_width=t.width,this._org_height=t.height}init(t){this.renderer.width=500,this.renderer.height=500,this._envrenderer=new Renderer(this.renderer.env,{width:this.renderer.width,height:this.renderer.height,g:t}),this._envrenderer.init()}render(){this._envrenderer.render()}game(...t){return t[0]||(t[0]=new ManualPlayer(this._envrenderer)),t[1]||(t[1]=new ManualPlayer(this._envrenderer)),t[0].turn=DraughtsRLEnvironment.RED,t[1].turn=DraughtsRLEnvironment.WHITE,this._game.players=t,this._game}close(){this.renderer.width=this._org_width,this.renderer.height=this._org_height}}class Renderer{constructor(t,e={}){this.env=t,this._size=[e.width||200,e.height||200],this.svg=document.createElementNS("http://www.w3.org/2000/svg","svg"),this.svg.setAttribute("width",this._size[0]),this.svg.setAttribute("height",this._size[1]),this.svg.setAttribute("viewbox","0 0 200 200"),e.g&&e.g.replaceChildren(this.svg)}init(){const t=this._size[0],e=this._size[1],s=t/this.env._size[1],r=e/this.env._size[0];this._cells=[];for(let t=0;t<this.env._size[0];t++){this._cells[t]=[];for(let e=0;e<this.env._size[1];e++){this._cells[t][e]=document.createElementNS("http://www.w3.org/2000/svg","g"),this.svg.appendChild(this._cells[t][e]);const i=document.createElementNS("http://www.w3.org/2000/svg","rect");i.setAttribute("x",e*s),i.setAttribute("y",t*r),i.setAttribute("width",s),i.setAttribute("height",r),i.setAttribute("fill",(t+e)%2==0?"#aa9977":"#eeddcc"),i.setAttribute("stroke","#333333"),i.setAttribute("stroke-width","1"),this._cells[t][e].appendChild(i)}}}render(){const t=this._size[0],e=this._size[1],s=t/this.env._size[1],r=e/this.env._size[0];for(let t=0;t<this._cells.length;t++)for(let e=0;e<this._cells[t].length;e++){if(this._cells[t][e].querySelector("circle")?.remove(),this._cells[t][e].querySelector("text")?.remove(),this.env._board.at([t,e])===DraughtsRLEnvironment.EMPTY)continue;const i=document.createElementNS("http://www.w3.org/2000/svg","circle");if(i.setAttribute("cx",s*(e+.5)),i.setAttribute("cy",r*(t+.5)),i.setAttribute("r",.4*Math.min(s,r)),i.setAttribute("stroke","black"),i.setAttribute("stroke-width","1"),this.env._board.at([t,e])&DraughtsRLEnvironment.WHITE?i.setAttribute("fill","white"):this.env._board.at([t,e])&DraughtsRLEnvironment.RED&&i.setAttribute("fill","red"),this._cells[t][e].appendChild(i),this.env._board.at([t,e])&DraughtsRLEnvironment.KING){const i=document.createElementNS("http://www.w3.org/2000/svg","text");i.setAttribute("x",s*(e+.5)),i.setAttribute("y",r*(t+.5)),i.style.transform="translate(-0.4em, 0.3em)",i.append("K"),this._cells[t][e].appendChild(i)}}}}class Draughts extends Game{constructor(t){super(t),this._board=t.env._board,this.turns=[DraughtsRLEnvironment.RED,DraughtsRLEnvironment.WHITE]}_showResult(t){const e=document.createElementNS("http://www.w3.org/2000/svg","tspan");e.setAttribute("x","0em"),e.setAttribute("y","0em"),e.innerHTML=this._board.winner===DraughtsRLEnvironment.RED?"RED WIN":"WHITE WIN",t.appendChild(e)}}class ManualPlayer{constructor(t){this._turn=null,this._renderer=t,this._obj=null}set turn(t){this._turn=t}action(t){const e=this._renderer._size[0],s=this._renderer._size[1],r=e/t.size[1],i=s/t.size[0],h=t.choices(this._turn);this._obj=document.createElementNS("http://www.w3.org/2000/svg","g"),this._renderer.svg.appendChild(this._obj),this._check=[];for(let e=0;e<t.size[0];e++){this._check[e]=[];for(let s=0;s<t.size[1];s++)(e+s)%2>0||(this._check[e][s]=document.createElementNS("http://www.w3.org/2000/svg","rect"),this._check[e][s].setAttribute("x",r*s),this._check[e][s].setAttribute("y",i*e),this._check[e][s].setAttribute("width",r),this._check[e][s].setAttribute("height",i),this._check[e][s].setAttribute("fill","rgba(255, 255, 0, 0.5)"),this._check[e][s].setAttribute("opacity",0),this._obj.appendChild(this._check[e][s]))}return new Promise((e=>{this._obj.oncontextmenu=s=>{s.preventDefault(),this.nextPath(t,h).then(e)},this.nextPath(t,h).then(e)}))}async nextPath(t,e,s=0){for(let t=0;t<this._check.length;t++)for(let e=0;e<this._check[t].length;e++)this._check[t][e]&&(this._check[t][e].setAttribute("opacity",0),this._check[t][e].onclick=null);const r=[];for(let i=0;i<e.length;i++){const[h,n]=0===s?e[i].from:e[i].path[s-1];this._check[h][n].setAttribute("opacity",1),r.push(new Promise((r=>{this._check[h][n].onclick=(i=>()=>{e[i].path.length===s?(this._obj.remove(),this._obj=null,r(e[i])):this.nextPath(t,e.filter((t=>0===s?t.from[0]===h&&t.from[1]===n:t.path[s-1][0]===h&&t.path[s-1][1]===n)),s+1).then(r)})(i)})))}return Promise.race(r)}close(){this._obj?.remove()}}