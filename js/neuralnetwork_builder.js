var r=Object.defineProperty;var n=(l,t)=>r(l,"name",{value:t,configurable:!0});import*as m from"../../lib/model/nns/optimizer.js";const p={abs:{},clip:{min:0,max:1},conv:{kernel:5,channel:16},dropout:{drop_rate:.5},exp:{},flatten:{},full:{size:10,a:"sigmoid"},gaussian:{},leaky_relu:{a:.1},identity:{},log:{},mean:{axis:0},negative:{},relu:{},reshape:{size:[1,1]},sigmoid:{},softmax:{},softplus:{},softsign:{},sparsity:{rho:.02},square:{},sqrt:{},sum:{axis:0},tanh:{},transpose:{axis:[1,0]},variance:{axis:0}},s={props:["modelValue"],template:`
	<div style="display: inline-flex; align-items: flex-end;">
		<input v-if="modelValue?.length < 10" type="button" value="+" v-on:click="modelValue.push(0)">
		<div>
			<div v-for="v, i in modelValue" :key="i">
				<input v-model.number="modelValue[i]" type="number" step="0.1">
				<input type="button" value="x" v-on:click="modelValue.splice(i, 1)">
			</div>
		</div>
	</div>
	`},o={setup(){const l=Vue.ref([{type:"full",size:10,a:"sigmoid",poly_pow:2}]);return{layers:l,changeType:n(function(e){const i={type:l.value[e].type,...p[l.value[e].type]};l.value.splice(e,1,i)},"changeType"),addLayer:n(function(){l.value.push({type:"full",size:10,a:"sigmoid",poly_pow:2})},"addLayer")}},data:n(function(){return{layerTypeNames:Object.keys(p),activations:["sigmoid","tanh","relu","leaky_relu","softsign","softplus","identity","polynomial","abs","gaussian","softmax"]}},"data"),template:`
	<div style="display: inline-flex; align-items: flex-end;">
		<input type="button" value="+" v-on:click="addLayer">
		<div>
			<div v-for="layer, i in layers" :key="i">
				#{{ i + 1 }}
				<select v-model="layer.type" v-on:change="changeType(i)">
					<option v-for="type in layerTypeNames" :value="type">{{ type }}</option>
				</select>
				<template v-if="layer.type === 'clip'">
					Min: <input v-model.number="layer.min" type="number" step="0.1">
					Max: <input v-model.number="layer.max" type="number" step="0.1">
				</template>
				<template v-if="layer.type === 'conv'">
					Kernel: <input v-model.number="layer.kernel" type="number">
					Channel: <input v-model.number="layer.channel" type="number">
				</template>
				<template v-if="layer.type === 'dropout'">
					Drop Rate: <input v-model.number="layer.drop_rate" type="number" min="0" max="1" step="0.1">
				</template>
				<template v-if="layer.type === 'full'">
					Size: <input v-model.number="layer.size" type="number" min="1" max="100">
					Activation: <select v-model="layer.a" v-on:change="$forceUpdate()">
						<option v-for="a in activations" :value="a">{{ a }}</option>
					</select>
					<input v-if="layer.a === 'polynomial'" v-model.number="layer.poly_pow" type="number" min="1" max="10">
				</template>
				<template v-if="layer.type === 'leaky_relu'">
					Alpha: <input v-model.number="layer.a" type="number" min="0" max="1" step="0.1">
				</template>
				<template v-if="layer.type === 'mean'">
					Axis: <input v-model.number="layer.axis" type="number" min="0" max="10">
				</template>
				<template v-if="layer.type === 'polynomial'">
					n: <input v-model.number="layer.n" type="number" min="0" max="10">
				</template>
				<template v-if="layer.type === 'reshape'">
					Sizes: <array_attr v-model="layer.size" />
				</template>
				<template v-if="layer.type === 'sparsity'">
					Rho: <input v-model.number="layer.rho" type="number" />
				</template>
				<template v-if="layer.type === 'sum'">
					Axis: <input v-model.number="layer.axis" type="number" min="0" max="10">
				</template>
				<template v-if="layer.type === 'transpose'">
					Axis: <array_attr v-model="layer.axis" />
				</template>
				<template v-if="layer.type === 'variance'">
					Axis: <input v-model.number="layer.axis" type="number" min="0" max="10">
				</template>
				<input type="button" value="x" v-on:click="layers.splice(i, 1)">
			</div>
		</div>
	</div>
	`};export default class y{static{n(this,"NeuralNetworkBuilder")}constructor(){this._app=Vue.createApp({}),this._app.component("array_attr",s),this._app.component("nn_model",o),this._vue=null,this._name=Math.random().toString(32).substring(2)}get layers(){const t=this._vue?this._vue.$refs.layerselm.layers:[{type:"full",size:10,a:"sigmoid"}],a=[];for(let e=0;e<t.length;e++)t[e].type==="full"?(a.push({type:"full",out_size:t[e].size}),a.push({type:t[e].a,n:t[e].poly_pow})):a.push(t[e]);return a}get invlayers(){const t=this.layers,a=[];for(let e=t.length-1;e>=0;e-=2)a.push(t[e-1],t[e]);return a}get optimizer(){return this._opt&&this._opt.property("value")}makeHtml(t,{optimizer:a=!1}={}){const e=t.span();e.element.id=`nn_model_${this._name}`;const i=document.createElement("nn_model");i.setAttribute("ref","layerselm"),e.element.append(i),this._vue=this._app.mount(`#nn_model_${this._name}`),a&&t.span().select({label:" Optimizer ",values:Object.keys(m),value:"adam"})}}
