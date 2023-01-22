import BaseRenderer from"./base.js";const LoadedRLRenderClass={};export default class RLRenderer extends BaseRenderer{constructor(e){super(e),this._size=[960,500];const t=this.setting.render.addItem("rl");this._svg=document.createElementNS("http://www.w3.org/2000/svg","svg"),this._svg.style.border="1px solid #000000",this._svg.setAttribute("width",`${this._size[0]}px`),this._svg.setAttribute("height",`${this._size[1]}px`),t.appendChild(this._svg),this._subrender=null}get svg(){return this._svg}get platform(){return this._manager.platform}get width(){return this._size[0]}set width(e){this._size[0]=e,this._svg.setAttribute("width",`${e}px`)}get height(){return this._size[1]}set height(e){this._size[1]=e,this._svg.setAttribute("height",`${e}px`)}get env(){return this._manager.platform.env}async init(){const e=this._manager.platform.type;if(this._svg.replaceChildren(),this._subrender?.close?.(),this._subrender=null,!0!==LoadedRLRenderClass[e])if(LoadedRLRenderClass[e])this._subrender=new LoadedRLRenderClass[e](this),this._subrender.init(this._svg);else if(""!==e)return LoadedRLRenderClass[e]=!0,import(`./rl/${e}.js`).then((t=>{LoadedRLRenderClass[e]=t.default,this._manager.platform.type===e&&(this._subrender=new t.default(this),this._subrender.init(this._svg))}))}render(...e){this._subrender?.render(this._svg,...e)}terminate(){this._subrender?.close?.(),this.setting.render.removeItem("rl"),super.terminate()}}