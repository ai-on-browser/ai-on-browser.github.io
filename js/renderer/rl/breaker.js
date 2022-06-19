export default class BreakerRenderer{constructor(e){this.renderer=e,this._org_width=this._width=e.width,this._org_height=this._height=e.height,this._render_blocks=[]}init(e){const t=this.renderer.width=this.renderer.env._size[0],s=this.renderer.height=this.renderer.env._size[1];this._envrenderer=new Renderer(this.renderer.env,{g:e.node()}),this._envrenderer.init();this._manualButton=e.append("g").style("transform",`translate(${t/2-50}px, ${s-100}px)`).style("cursor","pointer").on("click",(async()=>{this._game=new BreakerGame(this.renderer.platform),await this._game.start(),this._game=null,this._manualButton.attr("opacity",1)})),this._manualButton.append("rect").attr("x",0).attr("y",0).attr("width",100).attr("height",20).attr("fill-opacity",0).attr("stroke","gray"),this._manualButton.append("text").attr("x",50).attr("text-anchor","middle").attr("dominant-baseline","hanging").style("pointer-events","none").style("user-select","none").text("Start")}render(){this._manualButton.attr("opacity",this._game||this.renderer.platform._manager._modelname?0:1),this._envrenderer.render()}close(){this.renderer.width=this._org_width,this.renderer.height=this._org_height}}class Renderer{constructor(e,t={}){this.env=e,this._render_blocks=[],this.svg=document.createElementNS("http://www.w3.org/2000/svg","svg"),this.svg.setAttribute("width",this.env._size[0]),this.svg.setAttribute("height",this.env._size[1]),t.g&&t.g.replaceChildren(this.svg)}init(){const e=this.env._size[1];this._render_blocks=[];for(let t=0;t<this.env._block_positions.length;t++)this._render_blocks[t]=document.createElementNS("http://www.w3.org/2000/svg","rect"),this._render_blocks[t].setAttribute("x",this.env._block_positions[t][0]-this.env._block_size[0]/2),this._render_blocks[t].setAttribute("y",e-this.env._block_positions[t][1]-this.env._block_size[1]/2),this._render_blocks[t].setAttribute("width",this.env._block_size[0]),this._render_blocks[t].setAttribute("height",this.env._block_size[1]),this._render_blocks[t].setAttribute("fill",`rgb(${Math.floor(128*Math.random())}, ${Math.floor(128*Math.random())}, ${Math.floor(128*Math.random())})`),this.svg.appendChild(this._render_blocks[t]);this._render_ball=document.createElementNS("http://www.w3.org/2000/svg","circle"),this._render_ball.setAttribute("cx",this.env._ball_position[0]),this._render_ball.setAttribute("cy",e-this.env._ball_position[1]),this._render_ball.setAttribute("r",this.env._ball_radius),this._render_ball.setAttribute("fill","black"),this.svg.appendChild(this._render_ball),this._render_paddle=document.createElementNS("http://www.w3.org/2000/svg","rect"),this._render_paddle.setAttribute("x",this.env._paddle_position-this.env._paddle_size[0]/2),this._render_paddle.setAttribute("y",e-this.env._paddle_baseline-this.env._paddle_size[1]/2),this._render_paddle.setAttribute("width",this.env._paddle_size[0]),this._render_paddle.setAttribute("height",this.env._paddle_size[1]),this._render_paddle.setAttribute("fill","black"),this.svg.appendChild(this._render_paddle)}render(){const e=this.env._size[1];for(let e=0;e<this.env._block_positions.length;e++)this.env._block_existances[e]?this._render_blocks[e].style.display=null:this._render_blocks[e].style.display="none";this._render_ball.setAttribute("cx",this.env._ball_position[0]),this._render_ball.setAttribute("cy",e-this.env._ball_position[1]),this._render_paddle.setAttribute("x",this.env._paddle_position-this.env._paddle_size[0]/2)}}class BreakerGame{constructor(e){this._platform=e,this._env=e.env,this._act=0,this._keyDown=this.keyDown.bind(this),this._keyUp=this.keyUp.bind(this)}async start(){for(this._env.reset(),document.addEventListener("keydown",this._keyDown),document.addEventListener("keyup",this._keyUp);;){const{done:e}=this._env.step([this._act]);if(this._platform.render(),e)break;await new Promise((e=>setTimeout(e,10)))}document.removeEventListener("keydown",this._keyDown),document.removeEventListener("keyup",this._keyUp)}keyDown(e){"ArrowLeft"===e.code?this._act=-1:"ArrowRight"===e.code&&(this._act=1)}keyUp(e){("ArrowLeft"===e.code||"ArrowRight"===e.code)&&(this._act=0)}}