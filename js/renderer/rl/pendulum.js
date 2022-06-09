export default class PendulumRenderer{constructor(t){this.renderer=t}init(t){this._envrenderer=new Renderer(this.renderer.env,{width:this.renderer.width,height:this.renderer.height,g:t.node()}),this._envrenderer.init()}render(){this._envrenderer.render()}}class Renderer{constructor(t,e={}){this.env=t,this._size=[e.width||200,e.height||200],this._scale=100,this.svg=document.createElementNS("http://www.w3.org/2000/svg","svg"),this.svg.setAttribute("width",this._size[0]),this.svg.setAttribute("height",this._size[1]),this.svg.setAttribute("viewbox","0 0 200 200"),e.g&&e.g.replaceChildren(this.svg)}init(){const t=[this._size[0]/2,this._size[1]/2],e=[t[0]+this._scale*Math.sin(this.env._theta),t[1]-this._scale*Math.cos(this.env._theta)],s=document.createElementNS("http://www.w3.org/2000/svg","circle");s.setAttribute("cx",t[0]),s.setAttribute("cy",t[1]),s.setAttribute("fill","gray"),s.setAttribute("fill-opacity",.8),s.setAttribute("stroke-width",0),s.setAttribute("r",10),this.svg.appendChild(s);const i=document.createElementNS("http://www.w3.org/2000/svg","line");i.setAttribute("name","link"),i.setAttribute("x1",t[0]),i.setAttribute("x2",e[0]),i.setAttribute("y1",t[1]),i.setAttribute("y2",e[1]),i.setAttribute("stroke","black"),i.setAttribute("stroke-width",5),this.svg.appendChild(i)}render(){const t=[this._size[0]/2,this._size[1]/2],e=[t[0]+this._scale*Math.sin(this.env._theta),t[1]-this._scale*Math.cos(this.env._theta)],s=this.svg.querySelector("line");s.setAttribute("x2",e[0]),s.setAttribute("y2",e[1])}}