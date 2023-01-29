export default class BlackjackRenderer{constructor(t){this.renderer=t,this._game=new BlackjackGame(this.renderer.platform)}init(t){this._envrenderer=new Renderer(this.renderer.env,{width:this.renderer.width,height:this.renderer.height,g:t}),this._envrenderer.init(),this._manualButton=this._game._makeButton(10,3*this.renderer.height/4+50,80,40,"Start",(async()=>{this._manualButton.setAttribute("opacity",0),await this._game.start(),this._manualButton.setAttribute("opacity",null)})),t.appendChild(this._manualButton)}render(){this._manualButton.style.display=this.renderer.platform._manager._modelname?"none":"block",this._envrenderer.render()}}class Renderer{constructor(t,e={}){this.env=t,this._size=[e.width||200,e.height||200];const s=[63,89];this._card_size=[this._size[1]/3*(s[0]/s[1]),this._size[1]/3],this._cart_size=[50,30],this._move_scale=50,this._pendulum_scale=400,this.svg=document.createElementNS("http://www.w3.org/2000/svg","svg"),this.svg.setAttribute("width",this._size[0]),this.svg.setAttribute("height",this._size[1]),this.svg.setAttribute("viewbox","0 0 200 200"),e.g&&e.g.replaceChildren(this.svg),this._cards_render=[]}init(){const t=document.createElementNS("http://www.w3.org/2000/svg","text");t.setAttribute("x",10),t.setAttribute("y",this._size[1]/4),t.setAttribute("dominant-baseline","middle"),t.innerHTML="Dealer",this.svg.appendChild(t),this._dealerSum=document.createElementNS("http://www.w3.org/2000/svg","text"),this._dealerSum.setAttribute("x",10),this._dealerSum.setAttribute("y",this._size[1]/4+20),this._dealerSum.setAttribute("dominant-baseline","middle"),this._dealerSum.innerHTML="",this.svg.appendChild(this._dealerSum);const e=document.createElementNS("http://www.w3.org/2000/svg","text");e.setAttribute("x",10),e.setAttribute("y",3*this._size[1]/4),e.setAttribute("dominant-baseline","middle"),e.innerHTML="Player",this.svg.appendChild(e),this._playerSum=document.createElementNS("http://www.w3.org/2000/svg","text"),this._playerSum.setAttribute("x",10),this._playerSum.setAttribute("y",3*this._size[1]/4+20),this._playerSum.setAttribute("dominant-baseline","middle"),this._playerSum.innerHTML="",this.svg.appendChild(this._playerSum),this._cards_render.forEach((t=>t.remove())),this._cards_render=[]}render(){this._cards_render.forEach((t=>t.remove())),this._cards_render=[];const t=this._size[0],e=this._size[1];this._playerSum.innerHTML=this.env._sumhands(this.env._player_hands)[0],this.env._done?this._dealerSum.innerHTML=this.env._sumhands(this.env._dealer_hands)[0]:this._dealerSum.innerHTML="";for(let t=0;t<this.env._dealer_hands.length;t++){const s=this._renderCard(100+t*(this._card_size[0]+10),(e/2-this._card_size[1])/2,this.env._dealer_hands[t],0===t||this.env._done);this.svg.appendChild(s),this._cards_render.push(s)}let s=10;100+(this.env._player_hands.length+1)*(this._card_size[0]+s)>t&&(s=-this._card_size[0]/3);for(let t=0;t<this.env._player_hands.length;t++){const i=this._renderCard(100+t*(this._card_size[0]+s),(3*e/2-this._card_size[1])/2,this.env._player_hands[t]);this.svg.appendChild(i),this._cards_render.push(i)}}_renderCard(t,e,s,i=!0){const r=document.createElementNS("http://www.w3.org/2000/svg","g"),n=document.createElementNS("http://www.w3.org/2000/svg","rect");if(n.setAttribute("x",t),n.setAttribute("y",e),n.setAttribute("width",this._card_size[0]),n.setAttribute("height",this._card_size[1]),n.setAttribute("fill","white"),n.setAttribute("stroke","black"),n.setAttribute("rx",15),n.setAttribute("ry",15),r.appendChild(n),!i)return n.setAttribute("fill","gray"),r;const h=document.createElementNS("http://www.w3.org/2000/svg","text");h.setAttribute("x",t+this._card_size[0]/2),h.setAttribute("y",e+this._card_size[1]/4),h.setAttribute("text-anchor","middle"),h.setAttribute("dominant-baseline","middle"),h.style.fontSize=this._card_size[1]/2-20,h.style.userSelect="none",1===s.value?h.innerHTML="A":11===s.value?h.innerHTML="J":12===s.value?h.innerHTML="Q":13===s.value?h.innerHTML="K":h.innerHTML=s.value,r.appendChild(h);const a=document.createElementNS("http://www.w3.org/2000/svg","text");switch(a.setAttribute("x",t+this._card_size[0]/2),a.setAttribute("y",e+3*this._card_size[1]/4),a.setAttribute("text-anchor","middle"),a.setAttribute("dominant-baseline","middle"),a.style.fontSize=this._card_size[1]/2-20,a.style.userSelect="none",s.suit){case 0:a.innerHTML="&spades;";break;case 1:a.innerHTML="&diams;",h.setAttribute("fill","red"),a.setAttribute("fill","red");break;case 2:a.innerHTML="&hearts;",h.setAttribute("fill","red"),a.setAttribute("fill","red");break;case 3:a.innerHTML="&clubs;"}return r.appendChild(a),r}}class BlackjackGame{constructor(t){this._platform=t,this._env=t.env,this._resultElm=null}async start(){for(this._env.reset(),this._platform.render(),this._resultElm?.remove();;){const t=await this.waitAction(),{done:e}=this._env.step([t]);if(this._platform.render(),e){const t=this._platform.svg;this._resultElm=document.createElementNS("http://www.w3.org/2000/svg","g"),t.appendChild(this._resultElm);const e=document.createElementNS("http://www.w3.org/2000/svg","text");e.setAttribute("x",150),e.setAttribute("y",this._platform._renderer[0].height/2),e.setAttribute("width",100),e.setAttribute("height",40),e.setAttribute("text-anchor","middle"),e.setAttribute("dominant-baseline","middle"),e.style.fontSize="30";const s=this._env._sumhands(this._env._player_hands)[0],i=this._env._sumhands(this._env._dealer_hands)[0];e.innerHTML=s>21?"You bust!":s===i?"Draw":i>21||s>i?"You win!":"You lose!",this._resultElm.appendChild(e);break}await new Promise((t=>setTimeout(t,10)))}}async waitAction(){const t=this._platform.svg,e=document.createElementNS("http://www.w3.org/2000/svg","g");t.appendChild(e);return new Promise((t=>{e.appendChild(this._makeButton(10,3*this._platform._renderer[0].height/4+50,40,40,"Hit",(()=>{e.remove(),t(1)}))),e.appendChild(this._makeButton(50,3*this._platform._renderer[0].height/4+50,40,40,"Stick",(()=>{e.remove(),t(0)})))}))}_makeButton(t,e,s,i,r,n){const h=document.createElementNS("http://www.w3.org/2000/svg","g"),a=document.createElementNS("http://www.w3.org/2000/svg","text");a.setAttribute("x",t+s/2),a.setAttribute("y",e+i/2),a.setAttribute("width",s),a.setAttribute("height",i),a.setAttribute("text-anchor","middle"),a.setAttribute("dominant-baseline","middle"),a.innerHTML=r,a.style.userSelect="none",h.appendChild(a);const d=document.createElementNS("http://www.w3.org/2000/svg","rect");return d.setAttribute("x",t),d.setAttribute("y",e),d.setAttribute("width",s),d.setAttribute("height",i),d.setAttribute("fill-opacity",0),d.setAttribute("stroke","black"),d.onclick=n,h.appendChild(d),h}terminate(){this._resultElm?.remove()}}