var c=Object.defineProperty;var h=(i,t)=>c(i,"name",{value:t,configurable:!0});export default class _{static{h(this,"CartPoleRenderer")}constructor(t){this.renderer=t}init(t){this._envrenderer=new l(this.renderer.env,{width:500,height:500,g:t}),this._envrenderer.init()}render(){this._envrenderer.render()}}class l{static{h(this,"Renderer")}constructor(t,e={}){this.env=t,this._size=[e.width||200,e.height||200],this._cart_size=[50,30],this._move_scale=50,this._pendulum_scale=400,this.svg=document.createElementNS("http://www.w3.org/2000/svg","svg"),this.svg.setAttribute("width",this._size[0]),this.svg.setAttribute("height",this._size[1]),this.svg.setAttribute("viewbox","0 0 200 200"),e.g&&e.g.replaceChildren(this.svg)}init(){const t=this._size[1],e=document.createElementNS("http://www.w3.org/2000/svg","rect");e.classList.add("cart"),e.setAttribute("y",t-this._cart_size[1]),e.setAttribute("width",this._cart_size[0]),e.setAttribute("height",this._cart_size[1]),e.setAttribute("fill","gray"),this.svg.appendChild(e);const s=document.createElementNS("http://www.w3.org/2000/svg","line");s.classList.add("pendulum"),s.setAttribute("y1",t-this._cart_size[1]/2),s.setAttribute("stroke-width",5),s.setAttribute("stroke","black"),this.svg.appendChild(s)}render(){const t=this._size[0],e=this._size[1];this.svg.querySelector("rect.cart").setAttribute("x",t/2-this.env._position*this._move_scale);const n=t/2-this.env._position*this._move_scale+this._cart_size[0]/2,r=this.svg.querySelector("line.pendulum");r.setAttribute("x1",n),r.setAttribute("x2",n-this.env._pendulum_length*Math.sin(this.env._angle)*this._pendulum_scale),r.setAttribute("y2",e-(this._cart_size[1]/2+this.env._pendulum_length*Math.cos(this.env._angle)*this._pendulum_scale))}}
