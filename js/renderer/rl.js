var n=Object.defineProperty;var i=(s,e)=>n(s,"name",{value:e,configurable:!0});import o from"./base.js";const t={};export default class d extends o{static{i(this,"RLRenderer")}constructor(e){super(e);const r=this.setting.render.addItem("rl");this._root=document.createElement("div"),this._root.style.border="1px solid #000000",this._root.style.position="relative",this._root.style.display="inline-block",r.appendChild(this._root),this._subrender=null}get svg(){return this._root}get platform(){return this._manager.platform}get env(){return this._manager.platform.env}async init(){const e=this._manager.platform.type;if(this._root.replaceChildren(),this._subrender?.close?.(),this._subrender=null,t[e]!==!0){if(t[e])this._subrender=new t[e](this),this._subrender.init(this._root);else if(e!=="")return t[e]=!0,import(`./rl/${e}.js`).then(r=>{t[e]=r.default,this._manager.platform.type===e&&(this._subrender=new r.default(this),this._subrender.init(this._root))})}}render(...e){this._subrender?.render(this._root,...e)}terminate(){this._subrender?.close?.(),this.setting.render.removeItem("rl"),super.terminate()}}
