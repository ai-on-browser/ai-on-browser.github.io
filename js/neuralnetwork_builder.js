var r=Object.defineProperty;var i=(e,t)=>r(e,"name",{value:t,configurable:!0});import*as o from"../../lib/model/nns/optimizer.js";const n={abs:{},acos:{},acoh:{},asin:{},asinh:{},atan:{},atanh:{},bdaa:{alpha:{type:"number",default:1,multipleOf:.1}},bent_identity:{},blu:{beta:{type:"number",default:.1,multipleOf:.1}},brelu:{a:{type:"number",default:1,multipleOf:.1}},ceil:{},celu:{a:{type:"number",default:1,multipleOf:.1}},clip:{min:{type:"number",default:0,multipleOf:.1},max:{type:"number",default:1,multipleOf:.1}},cloglog:{},cloglogm:{},conv:{kernel:{type:"number",default:5},channel:{type:"number",default:16}},cos:{},cosh:{},crelu:{},dropout:{drop_rate:{type:"number",label:"Drop rate",default:.5,multipleOf:.1,minimum:0,maximum:1}},eelu:{k:{type:"number",default:1,multipleOf:.1},alpha:{type:"number",default:1,multipleOf:.1},beta:{type:"number",default:1,multipleOf:.1}},elish:{},elliott:{},elu:{a:{type:"number",default:1,multipleOf:.1}},erelu:{},erf:{},eswish:{beta:{type:"number",default:1,multipleOf:.1}},exp:{},felu:{alpha:{type:"number",default:1,multipleOf:.1}},flatten:{},floor:{},frelu:{b:{type:"number",default:0,multipleOf:.1}},full:{out_size:{type:"number",label:"Output size",default:10,minimum:1,maximum:100},activation:{type:"string",label:"Activation",default:"sigmoid",enum:["sigmoid","tanh","relu","leaky_relu","softsign","softplus","identity","polynomial","abs","gaussian","softmax"]}},function:{func:{type:"string",default:"2*x"}},gaussian:{},gelu:{},leaky_relu:{a:{type:"number",default:.1,multipleOf:.1,minimum:0,maximum:1}},identity:{},log:{},mean:{axis:{type:"number",default:0,minimum:0,maximum:10}},negative:{},relu:{},reshape:{size:{type:"array",default:[1,1]}},sigmoid:{},softmax:{},softplus:{},softsign:{},sparsity:{rho:{type:"number",default:.02,multipleOf:.01}},square:{},sqrt:{},sum:{axis:{type:"number",default:0,minimum:0,maximum:10}},tanh:{},transpose:{axis:{type:"array",default:[1,0]}},variance:{axis:{type:"number",default:0,minimum:0,maximum:10}}},s={props:["modelValue"],template:`
	<div style="display: inline-flex; align-items: flex-end;">
		<input v-if="modelValue?.length < 10" type="button" value="+" v-on:click="modelValue.push(0)">
		<div>
			<div v-for="v, i in modelValue" :key="i">
				<input v-model.number="modelValue[i]" type="number" step="0.1">
				<input type="button" value="x" v-on:click="modelValue.splice(i, 1)">
			</div>
		</div>
	</div>
	`},y={setup(){const e=Vue.ref([{type:"full",out_size:10,activation:"sigmoid"}]);return{layers:e,changeType:i(a=>{const l={type:e.value[a].type};for(const[m,p]of Object.entries(n[e.value[a].type]))l[m]=p.default;e.value.splice(a,1,l)},"changeType"),addLayer:i(()=>{e.value.push({type:"full",out_size:10,activation:"sigmoid"})},"addLayer")}},data:i(()=>({layerTypeNames:Object.keys(n),layerTypes:n}),"data"),template:`
	<div style="display: inline-flex; align-items: flex-end;">
		<input type="button" value="+" v-on:click="addLayer">
		<div>
			<div v-for="layer, i in layers" :key="i">
				#{{ i + 1 }}
				<select v-model="layer.type" v-on:change="changeType(i)">
					<option v-for="type in layerTypeNames" :value="type">{{ type }}</option>
				</select>
				<template v-for="(aobj, attr) in layerTypes[layer.type]" :key="attr">
					{{ aobj.label ?? attr }}
					<template v-if="aobj.type === 'number'">
						<input v-model.number="layer[attr]" type="number" :step="aobj.multipleOf" :min="aobj.minimum" :max="aobj.maximum">
					</template>
					<template v-if="aobj.type === 'string'">
						<template v-if="aobj.enum">
							<select v-model="layer[attr]">
								<option v-for="a in aobj.enum" :value="a">{{ a }}</option>
							</select>
						</template>
						<template v-if="!aobj.enum">
							<input :value="layer[attr]" type="text">
						</template>
					</template>
					<template v-if="aobj.type === 'array'">
						<array_attr v-model="layer[attr]" />
					</template>
				</template>
				<input type="button" value="x" v-on:click="layers.splice(i, 1)">
			</div>
		</div>
	</div>
	`};export default class f{static{i(this,"NeuralNetworkBuilder")}constructor(){this._app=Vue.createApp({}),this._app.component("array_attr",s),this._app.component("nn_model",y),this._vue=null,this._name=Math.random().toString(32).substring(2)}get layers(){return(this._vue?this._vue.$refs.layerselm.layers:[{type:"full",out_size:10,a:"sigmoid"}]).map(u=>({...u}))}get invlayers(){return this.layers.concat().reverse()}get optimizer(){return this._opt&&this._opt.property("value")}makeHtml(t,{optimizer:u=!1}={}){const a=t.span();a.element.id=`nn_model_${this._name}`;const l=document.createElement("nn_model");l.setAttribute("ref","layerselm"),a.element.append(l),this._vue=this._app.mount(`#nn_model_${this._name}`),u&&t.span().select({label:" Optimizer ",values:Object.keys(o),value:"adam"})}}
