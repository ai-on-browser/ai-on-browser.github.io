var o=Object.defineProperty;var l=(a,s)=>o(a,"name",{value:s,configurable:!0});export default class u{static{l(this,"AcrobotRenderer")}constructor(s){this.renderer=s}init(s){this._envrenderer=new b(this.renderer.env,{width:500,height:500,g:s}),this._envrenderer.init()}render(){this._envrenderer.render()}}class b{static{l(this,"Renderer")}constructor(s,h={}){this.env=s,this._size=[h.width||200,h.height||200],this._scale=100,this.svg=document.createElementNS("http://www.w3.org/2000/svg","svg"),this.svg.setAttribute("width",this._size[0]),this.svg.setAttribute("height",this._size[1]),this.svg.setAttribute("viewbox","0 0 200 200"),h.g&&h.g.replaceChildren(this.svg)}init(){const s=this._size[0],h=this._size[1],r=[s/2,h/2],t=[r[0]+this._scale*Math.sin(this.env._theta1),r[1]+this._scale*Math.cos(this.env._theta1)],c=[t[0]+this._scale*Math.sin(this.env._theta2),t[1]+this._scale*Math.cos(this.env._theta2)],i=document.createElementNS("http://www.w3.org/2000/svg","circle");i.setAttribute("cx",r[0]),i.setAttribute("cy",r[1]),i.setAttribute("fill","gray"),i.setAttribute("fill-opacity",.8),i.setAttribute("stroke-width",0),i.setAttribute("r",10),this.svg.appendChild(i);const e=document.createElementNS("http://www.w3.org/2000/svg","line");e.setAttribute("name","link1"),e.setAttribute("x1",r[0]),e.setAttribute("x2",t[0]),e.setAttribute("y1",r[1]),e.setAttribute("y2",t[1]),e.setAttribute("stroke","black"),e.setAttribute("stroke-width",5),this.svg.appendChild(e);const n=document.createElementNS("http://www.w3.org/2000/svg","line");n.setAttribute("name","link2"),n.setAttribute("x1",t[0]),n.setAttribute("x2",c[0]),n.setAttribute("y1",t[1]),n.setAttribute("y2",c[1]),n.setAttribute("stroke","black"),n.setAttribute("stroke-width",5),this.svg.appendChild(n)}render(){const s=this._size[0],h=this._size[1],r=[s/2,h/2],t=[r[0]+this._scale*Math.sin(this.env._theta1),r[1]+this._scale*Math.cos(this.env._theta1)],c=[t[0]+this._scale*Math.sin(this.env._theta2),t[1]+this._scale*Math.cos(this.env._theta2)],i=this.svg.querySelector("line[name=link1]");i.setAttribute("x2",t[0]),i.setAttribute("y2",t[1]);const e=this.svg.querySelector("line[name=link2]");e.setAttribute("x1",t[0]),e.setAttribute("x2",c[0]),e.setAttribute("y1",t[1]),e.setAttribute("y2",c[1])}}
