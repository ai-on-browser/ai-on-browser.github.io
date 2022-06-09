export default class GridMazeRenderer{constructor(e){this.renderer=e,this._init_menu()}_init_menu(){const e=this.renderer.setting.rl.configElement;e.replaceChildren(),e.appendChild(document.createTextNode("Columns "));const t=document.createElement("input");t.type="number",t.min=1,t.max=50,t.value=this.renderer.env._size[0],t.onchange=()=>{this.renderer.env._size[0]=+t.value,this.__map=null,this.renderer.platform.init(),this.renderer.setting.ml.refresh()},e.appendChild(t),e.appendChild(document.createTextNode(" Rows "));const i=document.createElement("input");i.type="number",i.min=1,i.max=50,i.value=this.renderer.env._size[1],i.onchange=()=>{this.renderer.env._size[1]=+i.value,this.__map=null,this.renderer.platform.init(),this.renderer.setting.ml.refresh()},e.appendChild(i)}init(e){const t=this.renderer.width,i=this.renderer.height,s=e.append("g").on("click",(e=>{const s=d3.pointer(e),r=this.renderer.env._size[0]/t,n=this.renderer.env._size[1]/i,h=Math.floor(s[0]*r),o=Math.floor(s[1]*n);this.renderer.env._points.push([h,o]),e.stopPropagation(),setTimeout((()=>{this.renderer.render()}),0)}));this._envrenderer=new Renderer(this.renderer.env,{width:t,height:i,g:s.node()}),this._envrenderer.init()}render(e,t){this._envrenderer.render(t)}}const argmax=function(e,t){return 0===e.length?-1:(e=t?e.map(t):e).indexOf(Math.max(...e))};class Renderer{constructor(e,t={}){this.env=e,this._size=[t.width||200,t.height||200],this._points=[],this._q=null,this._show_max=!1,this._render_blocks=[],this.svg=document.createElementNS("http://www.w3.org/2000/svg","svg"),this.svg.setAttribute("width",this._size[0]),this.svg.setAttribute("height",this._size[1]),this.svg.setAttribute("viewbox","0 0 200 200"),t.g&&t.g.replaceChildren(this.svg)}get _action_str(){return 1===this._dim?["→","←"]:["→","↓","←","↑"]}init(){const e=this._size[0],t=this._size[1],i=e/this.env._size[0],s=t/this.env._size[1];this._render_blocks=[];for(let e=0;e<this.env._size[0];e++){this._render_blocks[e]=[];for(let t=0;t<this.env._size[1];t++){const r=this._render_blocks[e][t]=document.createElementNS("http://www.w3.org/2000/svg","g");if(r.classList.add("grid"),r.setAttribute("stroke-width",1),r.setAttribute("stroke","black"),r.setAttribute("stroke-opacity",.2),this.svg.appendChild(r),this._show_max){const n=document.createElementNS("http://www.w3.org/2000/svg","rect");n.setAttribute("x",i*e),n.setAttribute("y",i*t),n.setAttribute("width",i),n.setAttribute("height",s),n.setAttribute("fill","white"),r.appendChild(n);const h=document.createElementNS("http://www.w3.org/2000/svg","text");h.classList.add("value"),h.setAttribute("x",i*e),h.setAttribute("y",s*(t+.8)),h.setAttribute("font-size",14),h.setAttribute("user-select","none"),r.appendChild(h)}else{const n=[i*(e+.5),s*(t+.5)],h=[[i*(e+1),s*t],[i*(e+1),s*(t+1)],[i*e,s*(t+1)],[i*e,s*t]];h[4]=h[0];for(let e=0;e<4;e++){const t=document.createElementNS("http://www.w3.org/2000/svg","polygon");t.setAttribute("points",`${h[e][0]},${h[e][1]} ${h[e+1][0]},${h[e+1][1]} ${n[0]},${n[1]}`),t.setAttribute("fill","white"),r.appendChild(t);const i=document.createElementNS("http://www.w3.org/2000/svg","title");t.appendChild(i)}}const n=document.createElementNS("http://www.w3.org/2000/svg","text");n.classList.add("action"),n.setAttribute("x",i*(e+.5)),n.setAttribute("y",s*(t+.5)),n.style.userSelect="none",n.style.transformBox="fill-box",n.style.transform="translate(-50%, 25%)",r.appendChild(n)}}const r=document.createElementNS("http://www.w3.org/2000/svg","circle");r.classList.add("agent"),r.setAttribute("cx",.5*i),r.setAttribute("cy",.5*s),r.setAttribute("fill","gray"),r.setAttribute("fill-opacity",.8),r.setAttribute("stroke-width",1),r.setAttribute("stroke","black"),r.setAttribute("r",Math.min(i,s)/3),this.svg.appendChild(r)}_min(e){return Array.isArray(e[0])?Math.min(...e.map(this._min.bind(this))):Math.min(...e)}_max(e){return Array.isArray(e[0])?Math.max(...e.map(this._max.bind(this))):Math.max(...e)}render(e){const t=this._size[0],i=this._size[1],s=t/this.env._size[0],r=i/this.env._size[1],n=this.env.map;if(e&&(this._q=e()),this._q){const e=this._q,t=this._max(e),i=this._min(e),s=Math.max(Math.abs(t),Math.abs(i));for(let t=0;t<this.env._size[0];t++){if(!this._q[t])continue;const i=2===this.env._dim?e[t]:[e[t]];for(let e=0;e<this.env._size[1];e++){if(!i[e])continue;if(n[t][e]||t===this.env._size[0]-1&&e===this.env._size[1]-1)continue;const r=(h=i[e],o=void 0,0===h.length?-1:(h=o?h.map(o):h).indexOf(Math.max(...h))),l=e=>{const t=255*(1-Math.abs(e)/s);return e>0?`rgb(${t}, 255, ${t})`:e<0?`rgb(255, ${t}, ${t})`:"white"};if(this._render_blocks[t][e].querySelector("text.action").replaceChildren(this._action_str[r]),this._show_max){const s=Math.max(...i[e]);this._render_blocks[t][e].querySelector("rect").setAttribute("fill",l(s)),this._render_blocks[t][e].querySelector("text.value").replaceChildren(`${s}`.slice(0,6))}else{const s=this._render_blocks[t][e].querySelectorAll("polygon");for(let t=0;t<s.length;t++)s[t].setAttribute("fill",l(i[e][t])),s[t].querySelector("title").replaceChildren(i[e][t])}}}}else for(const e of this.svg.querySelectorAll("g.grid rect, g.grid polygon"))e.setAttribute("fill","white");var h,o;for(let e=0;e<this.env._size[0];e++)for(let t=0;t<this.env._size[1];t++)if(n[e][t])for(const i of this._render_blocks[e][t].querySelectorAll("rect, polygon"))i.setAttribute("fill","black");for(const e of this._render_blocks[this.env._size[0]-1][this.env._size[1]-1].querySelectorAll("rect, polygon"))e.setAttribute("fill","yellow");const l=this.svg.querySelector("circle.agent");l.setAttribute("cx",(this.env._position[0]+.5)*s),l.setAttribute("cy",((this.env._position[1]||0)+.5)*r)}}