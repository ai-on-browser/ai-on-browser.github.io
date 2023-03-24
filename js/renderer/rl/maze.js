export default class SmoothMazeRenderer{constructor(t){this.renderer=t,this._width=t.width,this._height=t.height,this._render_blocks=[];for(let t=0;t<this.renderer.env._map_resolution[0];t++)this._render_blocks[t]=Array(this.renderer.env._map_resolution[1])}init(t){const e=document.createElement("div");e.style.width=`${this._width}px`,e.style.height=`${this._height}px`,e.onclick=t=>{const e=d3.pointer(t),s=this._width/this.renderer.env._map_resolution[0],i=this._height/this.renderer.env._map_resolution[1],r=Math.floor(e[0]/s),h=Math.floor(e[1]/i);this.renderer.env._points.push([r,h]),t.stopPropagation(),setTimeout((()=>{this.renderer.platform.render()}),0)},t.appendChild(e),this._envrenderer=new Renderer(this.renderer.env,{g:e}),this._envrenderer.init()}render(){this._envrenderer.render()}}class Renderer{constructor(t,e={}){this.env=t,this._render_blocks=[];for(let t=0;t<this.env._map_resolution[0];t++)this._render_blocks[t]=Array(this.env._map_resolution[1]);this.svg=document.createElementNS("http://www.w3.org/2000/svg","svg"),this.svg.setAttribute("width",this.env._width),this.svg.setAttribute("height",this.env._height),e.g&&e.g.replaceChildren(this.svg)}init(){const t=this.env._width/this.env._map_resolution[0],e=this.env._height/this.env._map_resolution[1],s=document.createElementNS("http://www.w3.org/2000/svg","rect");s.setAttribute("x",this.env._width-this.env._goal_size[0]),s.setAttribute("y",this.env._height-this.env._goal_size[1]),s.setAttribute("width",this.env._goal_size[0]),s.setAttribute("height",this.env._goal_size[1]),s.setAttribute("stroke-width",1),s.setAttribute("stroke","black"),s.setAttribute("fill","yellow"),this.svg.appendChild(s);const i=document.createElementNS("http://www.w3.org/2000/svg","circle");i.classList.add("agent"),i.setAttribute("cx",this.env._position[0]),i.setAttribute("cy",this.env._position[1]),i.setAttribute("fill","gray"),i.setAttribute("fill-opacity",.8),i.setAttribute("stroke-width",1),i.setAttribute("stroke","black"),i.setAttribute("r",2*Math.min(t,e)/3),this.svg.appendChild(i),this._blocks=document.createElementNS("http://www.w3.org/2000/svg","g"),this.svg.appendChild(this._blocks)}render(){const t=this.env._width/this.env._map_resolution[0],e=this.env._height/this.env._map_resolution[1],s=this.env.map;for(let i=0;i<s.length;i++)for(let r=0;r<s[i].length;r++)s[i][r]&&!this._render_blocks[i][r]?(this._render_blocks[i][r]=document.createElementNS("http://www.w3.org/2000/svg","rect"),this._render_blocks[i][r].classList.add("grid"),this._render_blocks[i][r].setAttribute("x",t*i),this._render_blocks[i][r].setAttribute("y",e*r),this._render_blocks[i][r].setAttribute("width",t),this._render_blocks[i][r].setAttribute("height",e),this._render_blocks[i][r].setAttribute("fill","black"),this._blocks.appendChild(this._render_blocks[i][r])):!s[i][r]&&this._render_blocks[i][r]&&(this._render_blocks[i][r].remove(),this._render_blocks[i][r]=null);const i=this.svg.querySelector("circle.agent");i.setAttribute("cx",this.env._position[0]),i.setAttribute("cy",this.env._position[1])}}