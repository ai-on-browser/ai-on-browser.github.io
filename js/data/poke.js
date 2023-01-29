import BaseDB from"./db/base.js";import JSONData from"./json.js";const BASE_URL="https://pokeapi.co/api/v2",DB_NAME="poke_api";class PokeDB extends BaseDB{constructor(){super(DB_NAME,1)}onupgradeneeded(t){const e=t.target.result;e.createObjectStore("count",{keyPath:"endpoint"});e.createObjectStore("pokemon",{keyPath:"id"}).createIndex("name","name",{unique:!0})}}export default class PokeData extends JSONData{constructor(t){super(t),this._db=new PokeDB,this._object=[],this._target=-1,this._loading=!1;const e=this.setting.data.configElement,a=document.createElement("div");a.style.display="flex",a.style.justifyContent="space-between",e.appendChild(a);const n=document.createElement("div");a.appendChild(n),this._getDataButton=document.createElement("input"),this._getDataButton.type="button",this._getDataButton.value="Load data",this._getDataButton.style.display="none",this._getDataButton.onclick=()=>{this._loading?(this._loading=!1,this._getDataButton.disabled=!0):(this._loading=!0,this._getDataButton.value="Stop loading",this._getPokemons().catch((t=>{console.error(t)})).finally((()=>{this._getDataButton.value="Load data",this._getDataButton.disabled=!1,this._loading=!1,this.ready()})))},n.appendChild(this._getDataButton);const s=document.createElement("span");s.setAttribute("name","status"),s.style.margin="0 10px",n.appendChild(s);const i=document.createElement("a");a.appendChild(i),i.href="https://pokeapi.co/",i.setAttribute("ref","noreferrer noopener"),i.target="_blank",i.innerText="Pokémon API",this._progressBar=document.createElement("div"),this._progressBar.innerText="0 / 0",this._progressBar.style.width="100%",this._progressBar.style.fontSize="50%",this._progressBar.style.textAlign="center",this._progressBar.style.backgroundColor="white",this._progressBar.style.display="none",e.appendChild(this._progressBar);const o=document.createElement("span");o.innerText="Pokémon and Pokémon character names are trademarks of Nintendo.",o.style.fontSize="80%",e.appendChild(o),this._selector=document.createElement("div"),e.appendChild(this._selector),this.ready()}get availTask(){return["RG","AD"]}get columnNames(){return this._object.map((t=>this._feature_names[t]))}get x(){return this._x.map((t=>this._object.map((e=>t[e]))))}get originalX(){return this.x}get y(){return this._target>=0?this._x.map((t=>t[this._target])):Array(this._x.length).fill(0)}get originalY(){return this.y}get labels(){return this._names}async ready(){const t=this.setting.data.configElement,e=(await this._db.get("count","pokemon"))?.count??1/0,a=await this._db.list("pokemon");this._getDataButton.style.display=a.length<e?"inline":"none";const n=t.querySelector("[name=status]");0===a.length?n.innerText="No data":a.length<e?(n.innerText="Data loading is not completed",e!==1/0&&(n.innerText+=` (${a.length}/${e})`)):n.innerText="Data is ready!",0!==a.length&&(this._object=[0],this._target=1,this._names=a.map((t=>t.name)),this.setJSON(a.map((t=>({height:t.height,weight:t.weight}))),["height","weight"].map((t=>({name:t,nan:0})))),this._readySelector())}async _getPokemons(){const t=(await this._db.get("count","pokemon"))?.count??1/0,e=await this._db.list("pokemon");if(e.length>=t)return e;console.debug("request to /pokemon/{id or name}/");let a=`${BASE_URL}/pokemon?limit=100`;const n=e.concat();let s=0;this._progressBar.style.display="block";let i=[];const o=()=>{const t=100*n.length/s,e=Math.max(1,i.length-10),a=(i[i.length-1]-i[e-1])/(i.length-e),o=isNaN(a)?0:a/1e3*(s-n.length);this._progressBar.innerText=`${n.length} / ${s} (${Math.floor(o/60)}:${Math.floor(o)%60})`,this._progressBar.style.background=`linear-gradient(90deg, lightgray, ${t}%, gray, ${t}%, white)`};for(i.push((new Date).getTime());this._loading&&a;){const r=await fetch(a),h=await r.json();0===s&&(s=h.count,o(),t===1/0&&await this._db.save("count",[{endpoint:"pokemon",count:s,fetchDate:new Date}]));for(const t of h.results){if(e.some((e=>e.name===t.name)))continue;if(!this._loading)break;await new Promise((t=>setTimeout(t,100)));const a=await fetch(t.url),s=await a.json();n.push(s),await this._db.save("pokemon",[s]),i.push((new Date).getTime()),o()}a=h.next}return this._progressBar.innerText="0 / 0",this._progressBar.style.display="none",n}_readySelector(){if(this._selector.replaceChildren(),this._feature_names.length>1){const t=document.createElement("select");t.multiple=!0,t.onchange=()=>{this._object=[];let a="",n=!1;for(const s of t.options)s.selected?(this._object.push(this._feature_names.indexOf(s.value)),s.value===e.value&&(n=!0)):a||(a=s.value);n&&(this._target=this._feature_names.indexOf(a),e.value=a),this._domain=null,this._manager.onReady((()=>{this._manager.platform.init()}))},this._selector.append("Input",t);const e=document.createElement("select");e.onchange=()=>{let a=!1;for(const n of t.selectedOptions)if(n.value===e.value){n.selected=!1,this._object=this._object.filter((t=>this._feature_names[t]!==n.value)),a=!0;break}if(a||""===e.value&&this._target>=0)for(const e of t.options)e.value===this._feature_names[this._target]&&(e.selected=!0,this._object.push(this._target));this._target=this._feature_names.indexOf(e.value),this._domain=null,this._manager.onReady((()=>{this._manager.platform.init()}))},this._selector.append("Output",e),e.appendChild(document.createElement("option"));for(const a of this._feature_names){const n=document.createElement("option");n.value=n.innerText=a,t.appendChild(n),e.appendChild(n.cloneNode(!0))}t.size=Math.min(4,t.options.length);for(let e=0;e<this._feature_names.length-1;e++)t.options[e].selected=this._object.indexOf(e)>=0;e.value=this._feature_names[this._target]}}}