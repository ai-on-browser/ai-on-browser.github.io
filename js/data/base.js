export class BaseData{constructor(t){this._x=[],this._y=[],this._index=null,this._manager=t}get setting(){return this._manager.setting}get svg(){return this._manager.setting.svg}get availTask(){return[]}get dimension(){return this.domain.length}get domain(){if(0===this.length)return[];const t=[];for(let e=0;e<this.x[0].length;e++)t.push([1/0,-1/0]);for(const e of this.x)if(!Array.isArray(e[0]))for(let i=0;i<e.length;i++)t[i][0]=Math.min(t[i][0],e[i]),t[i][1]=Math.max(t[i][1],e[i]);return t}get range(){const t=[1/0,-1/0];for(const e of this.y)t[0]=Math.min(t[0],e),t[1]=Math.max(t[1],e);return t}get indexRange(){const t=this.index,e=[1/0,-1/0];if(!t)return e;for(const i of t)e[0]=Math.min(e[0],i),e[1]=Math.max(e[1],i);return e}get length(){return this.x.length||this.y.length||this.index?.length||0}get columnNames(){const t=[];for(let e=0;e<this.dimension;e++)t[e]=`${e}`;return t}get x(){return this._x}get originalX(){return this.x}get y(){return this._y}get originalY(){return this.y}get index(){return this._index}get points(){return this._manager.platform._renderer.points}get params(){return{}}set params(t){}*[Symbol.iterator](){const t=this.length;for(let e=0;e<t;e++)yield this.at(e)}at(t){return Object.defineProperties({},{x:{get:()=>this._x[t]},y:{get:()=>this._y[t]},point:{get:()=>this.points[t]}})}terminate(){this.setting.data.configElement.replaceChildren()}}export class MultiDimensionalData extends BaseData{constructor(t){super(t),this._categorical_output=!1,this._input_category_names=[],this._output_category_names=null}get columnNames(){return this._feature_names||[]}get inputCategoryNames(){return this._input_category_names}get originalX(){if(0===this._input_category_names.length)return this._x;const t=[];for(let e=0;e<this._x.length;e++){t[e]=[];for(let i=0;i<this._x[e].length;i++)t[e][i]=this._input_category_names[i]?this._input_category_names[i][this._x[e][i]]:this._x[e][i]}return t}get outputCategoryNames(){return this._output_category_names}get originalY(){return this._categorical_output?this._originalY:this._y}setArray(t,e){this._categorical_output=!1,this._input_category_names=[],this._output_category_names=null,this._originalY=void 0,this._x=[];for(let e=0;e<t.length;e++)this._x[e]=[];this._y=[];for(let i=0,s=0;i<e.length;i++)if(!e[i].ignore)if(e[i].type||(e[i].type=t.every((t=>!isNaN(t[i])))?"numeric":"category"),e[i].out)this._categorical_output="category"===e[i].type,this._y=t.map((t=>isNaN(t[i])?t[i]:+t[i])),this._categorical_output&&(this._output_category_names=[...new Set(this._y)],this._originalY=this._y,this._y=this._y.map((t=>this._output_category_names.indexOf(t)+1)),e[i].labels&&(this._output_category_names[s]=this._output_category_names[s].map((t=>e[i].labels.hasOwnProperty(t)?e[i].labels[t]:t))));else{if("category"===e[i].type){this._input_category_names[s]=[...new Set(t.map((t=>t[i])))];for(let e=0;e<t.length;e++)this._x[e].push(this._input_category_names[s].indexOf(t[e][i]));e[i].labels&&(this._input_category_names[s]=this._input_category_names[s].map((t=>e[i].labels.hasOwnProperty(t)?e[i].labels[t]:t)))}else for(let e=0;e<t.length;e++)this._x[e].push(isNaN(t[e][i])?t[e][i]:+t[e][i]);s++}this._feature_names=e.filter((t=>!t.out&&!t.ignore)).map((t=>t.name)),this._domain=null,this._manager.onReady((()=>{this._manager.platform.init()}))}}export class FixData extends MultiDimensionalData{constructor(t){super(t),this._domain=null}get domain(){return this._domain?this._domain:this._domain=super.domain}at(t){return Object.defineProperties({},{x:{get:()=>this._x[t]},y:{get:()=>this._y[t]},point:{get:()=>this.points[t]}})}}