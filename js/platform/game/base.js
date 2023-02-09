const Players=["manual","random","greedy","minmax","alphabeta"],loadedPlayer={};export default class GameManager{constructor(t){this._platform=t,this._game=null;const e=t.setting.task.configElement;this._r=document.createElement("div"),e.appendChild(this._r),this._r.appendChild(document.createTextNode("Play"));const s=[];for(let t=0;t<2;t++){const t=document.createElement("select");t.onchange=()=>{e.style.display=["minmax","alphabeta"].indexOf(t.value)>=0?null:"none"};for(const e of Players){const s=document.createElement("option");s.value=e,s.innerText=e,t.appendChild(s)}t.value="greedy",this._r.appendChild(t);const e=document.createElement("input");e.type="number",e.min=1,e.max=10,e.value=5,e.style.display="none",this._r.appendChild(e),s.push({get name(){return t.value},get params(){return[e.value]}})}const r=document.createElement("input");r.type="button",r.value="Play",r.onclick=()=>{this._loadPlayer(s,(t=>{this.start(t)}))},this._r.appendChild(r);const l=document.createElement("input");l.type="button",l.value="Reset",l.onclick=()=>{this.reset()},this._r.appendChild(l)}_loadPlayer(t,e){Promise.all(t.map((t=>"manual"===t.name?null:loadedPlayer[t.name]?new loadedPlayer[t.name](...t.params):new Promise((e=>{import(`./${t.name}.js`).then((s=>{loadedPlayer[t.name]=s.default,e(new loadedPlayer[t.name](...t.params))}))}))))).then(e)}terminate(){this._r&&this._r.remove(),this._game&&this._game.close()}start(t){this._r.querySelectorAll("input[type=button]").forEach((t=>t.disabled=!0)),this._game=this._platform._renderer[0]._subrender.game(...t),this._game.start().then((()=>{this._r.querySelectorAll("input[type=button]").forEach((t=>t.disabled=!1))}))}reset(){this._game&&(this._game.close(),this._game=null),this._platform.reset(),this._platform.render()}}export class Game{constructor(t){this._players=[],this._platform=t,this._board=null,this._turn=null,this._active=!1,this._resultElm=null}get board(){return this._board}get active(){return this._active}set players(t){this._players=t}close(){this._players.forEach((t=>t.close())),this._resultElm&&(this._resultElm.remove(),this._resultElm=null)}_showResult(t){}async start(){for(this._resultElm&&(this._resultElm.remove(),this._resultElm=null),this._platform.render(),this._active=!0,this._turn=this.turns[0];!this._board.finish;){if(this._board.choices(this._turn).length>0){for(;;){const t=this.turns.indexOf(this._turn),e=await this._players[t].action(this._board);if(this._board.set(e,this._turn))break}this._platform.render(),await new Promise((t=>setTimeout(t,0)))}this._turn=this._board.nextTurn(this._turn)}this._active=!1,this._resultElm=document.createElementNS("http://www.w3.org/2000/svg","g"),this._resultElm.onclick=()=>{this._resultElm.remove(),this._resultElm=null},this._platform.svg.appendChild(this._resultElm);const t=this._platform.svg.getBoundingClientRect().width,e=this._platform.svg.getBoundingClientRect().height,s=document.createElementNS("http://www.w3.org/2000/svg","rect");s.setAttribute("x",t/4),s.setAttribute("y",e/4),s.setAttribute("width",t/2),s.setAttribute("height",e/2),s.setAttribute("opacity",.8),s.setAttribute("fill","white"),this._resultElm.appendChild(s);const r=document.createElementNS("http://www.w3.org/2000/svg","text");r.setAttribute("transform",`translate(${t/3}, ${e/2})`),this._resultElm.appendChild(r),this._showResult(r)}}