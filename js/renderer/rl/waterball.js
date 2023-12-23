var a=Object.defineProperty;var l=(n,e)=>a(n,"name",{value:e,configurable:!0});export default class h{static{l(this,"WaterballRenderer")}constructor(e){this.renderer=e,this._init_menu()}_init_menu(){const e=this.renderer.setting.rl.configElement;e.replaceChildren(),e.appendChild(document.createTextNode("Number of balls "));const t=document.createElement("input");t.type="number",t.min=1,t.max=100,t.value=this.renderer.env._max_size,t.onchange=()=>{this.renderer.env._max_size=+t.value},e.appendChild(t)}init(e){this._envrenderer=new _(this.renderer.env,{g:e}),this._envrenderer.init()}render(){this._envrenderer.render()}}class _{static{l(this,"Renderer")}constructor(e,t={}){this.env=e,this._ball_elms=[],this.svg=document.createElementNS("http://www.w3.org/2000/svg","svg"),this.svg.setAttribute("width",this.env._width),this.svg.setAttribute("height",this.env._height),t.g&&t.g.replaceChildren(this.svg)}init(){const e=document.createElementNS("http://www.w3.org/2000/svg","g");e.classList.add("agent"),e.setAttribute("transform",`translate(${this.env._agent_p.join(",")})`),this.svg.appendChild(e);let t=360/this.env._sensor_count;for(let i=0;i<this.env._sensor_count;i++){const r=document.createElementNS("http://www.w3.org/2000/svg","line");r.classList.add(`sensor_${i}`),r.setAttribute("x1",0),r.setAttribute("x2",this.env._sensor_length),r.setAttribute("y1",0),r.setAttribute("y2",0),r.setAttribute("stroke","black"),r.setAttribute("stroke-width",1),r.setAttribute("transform",`rotate(${t*i})`),e.appendChild(r)}const s=document.createElementNS("http://www.w3.org/2000/svg","circle");s.setAttribute("cx",0),s.setAttribute("cy",0),s.setAttribute("fill","gray"),s.setAttribute("stroke-width",0),s.setAttribute("r",this.env._agent_radius),e.appendChild(s)}render(){if(this.env._balls.forEach((t,s)=>{this._ball_elms[s]||(this._ball_elms[s]=document.createElementNS("http://www.w3.org/2000/svg","circle"),this._ball_elms[s].setAttribute("r",this.env._ball_radius),this._ball_elms[s].setAttribute("stroke","gray"),this._ball_elms[s].setAttribute("stroke-width",1),this.svg.appendChild(this._ball_elms[s])),this._ball_elms[s].setAttribute("cx",t.c[0]),this._ball_elms[s].setAttribute("cy",t.c[1]),this._ball_elms[s].setAttribute("fill",t.type==="apple"?"#ff6060":"#60ff60")}),this.env._balls.length<this._ball_elms.length){for(let t=this.env._balls.length;t<this._ball_elms.length;t++)this._ball_elms[t].remove();this._ball_elms.length=this.env._balls.length}this.svg.querySelector(".agent").setAttribute("transform",`translate(${this.env._agent_p.join(",")})`);const e=this.env.state();for(let t=0;t<this.env._sensor_count;t++){const s=e[2+t*4],i=e[2+t*4+1],r=this.svg.querySelector(`.sensor_${t}`);r.setAttribute("x2",s),r.setAttribute("stroke",i==="apple"?"#ffa0a0":i==="poison"?"#a0ffa0":"black")}}}
