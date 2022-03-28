const layerTypes={abs:{},clip:{min:0,max:1},conv:{kernel:5,channel:16},dropout:{drop_rate:.5},exp:{},flatten:{},full:{size:10,a:"sigmoid"},gaussian:{},leaky_relu:{a:.1},linear:{},log:{},mean:{axis:0},negative:{},power:{n:2},relu:{},reshape:{size:[1,1]},sigmoid:{},softmax:{},softplus:{},softsign:{},sparsity:{rho:.02},square:{},sqrt:{},sum:{axis:0},tanh:{},transpose:{axis:[1,0]},variance:{axis:0}},arrayAttrDefinition={props:["modelValue"],template:'\n\t<div style="display: inline-flex; align-items: flex-end;">\n\t\t<input v-if="modelValue?.length < 10" type="button" value="+" v-on:click="modelValue.push(0)">\n\t\t<div>\n\t\t\t<div v-for="v, i in modelValue" :key="i">\n\t\t\t\t<input v-model.number="modelValue[i]" type="number" step="0.1">\n\t\t\t\t<input type="button" value="x" v-on:click="modelValue.splice(i, 1)">\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\t'},nnModelDefinition={setup(){const t=Vue.ref([{type:"full",size:10,a:"sigmoid",poly_pow:2}]);return{layers:t,changeType:function(e){const n={type:t.value[e].type,...layerTypes[t.value[e].type]};t.value.splice(e,1,n)},addLayer:function(){t.value.push({type:"full",size:10,a:"sigmoid",poly_pow:2})}}},data:function(){return{layerTypeNames:Object.keys(layerTypes),activations:["sigmoid","tanh","relu","leaky_relu","softsign","softplus","linear","polynomial","abs","gaussian","softmax"]}},template:'\n\t<div style="display: inline-flex; align-items: flex-end;">\n\t\t<input type="button" value="+" v-on:click="addLayer">\n\t\t<div>\n\t\t\t<div v-for="layer, i in layers" :key="i">\n\t\t\t\t#{{ i + 1 }}\n\t\t\t\t<select v-model="layer.type" v-on:change="changeType(i)">\n\t\t\t\t\t<option v-for="type in layerTypeNames" :value="type">{{ type }}</option>\n\t\t\t\t</select>\n\t\t\t\t<template v-if="layer.type === \'clip\'">\n\t\t\t\t\tMin: <input v-model.number="layer.min" type="number" step="0.1">\n\t\t\t\t\tMax: <input v-model.number="layer.max" type="number" step="0.1">\n\t\t\t\t</template>\n\t\t\t\t<template v-if="layer.type === \'conv\'">\n\t\t\t\t\tKernel: <input v-model.number="layer.kernel" type="number">\n\t\t\t\t\tChannel: <input v-model.number="layer.channel" type="number">\n\t\t\t\t</template>\n\t\t\t\t<template v-if="layer.type === \'dropout\'">\n\t\t\t\t\tDrop Rate: <input v-model.number="layer.drop_rate" type="number" min="0" max="1" step="0.1">\n\t\t\t\t</template>\n\t\t\t\t<template v-if="layer.type === \'full\'">\n\t\t\t\t\tSize: <input v-model.number="layer.size" type="number" min="1" max="100">\n\t\t\t\t\tActivation: <select v-model="layer.a" v-on:change="$forceUpdate()">\n\t\t\t\t\t\t<option v-for="a in activations" :value="a">{{ a }}</option>\n\t\t\t\t\t</select>\n\t\t\t\t\t<input v-if="layer.a === \'polynomial\'" v-model.number="layer.poly_pow" type="number" min="1" max="10">\n\t\t\t\t</template>\n\t\t\t\t<template v-if="layer.type === \'leaky_relu\'">\n\t\t\t\t\tAlpha: <input v-model.number="layer.a" type="number" min="0" max="1" step="0.1">\n\t\t\t\t</template>\n\t\t\t\t<template v-if="layer.type === \'mean\'">\n\t\t\t\t\tAxis: <input v-model.number="layer.axis" type="number" min="0" max="10">\n\t\t\t\t</template>\n\t\t\t\t<template v-if="layer.type === \'polynomial\'">\n\t\t\t\t\tn: <input v-model.number="layer.n" type="number" min="0" max="10">\n\t\t\t\t</template>\n\t\t\t\t<template v-if="layer.type === \'power\'">\n\t\t\t\t\tn: <input v-model.number="layer.n" type="number" min="-10" max="10">\n\t\t\t\t</template>\n\t\t\t\t<template v-if="layer.type === \'reshape\'">\n\t\t\t\t\tSizes: <array_attr v-model="layer.size" />\n\t\t\t\t</template>\n\t\t\t\t<template v-if="layer.type === \'sparsity\'">\n\t\t\t\t\tRho: <input v-model.number="layer.rho" type="number" />\n\t\t\t\t</template>\n\t\t\t\t<template v-if="layer.type === \'sum\'">\n\t\t\t\t\tAxis: <input v-model.number="layer.axis" type="number" min="0" max="10">\n\t\t\t\t</template>\n\t\t\t\t<template v-if="layer.type === \'transpose\'">\n\t\t\t\t\tAxis: <array_attr v-model="layer.axis" />\n\t\t\t\t</template>\n\t\t\t\t<template v-if="layer.type === \'variance\'">\n\t\t\t\t\tAxis: <input v-model.number="layer.axis" type="number" min="0" max="10">\n\t\t\t\t</template>\n\t\t\t\t<input type="button" value="x" v-on:click="layers.splice(i, 1)">\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\t'};export default class NeuralNetworkBuilder{constructor(){this._app=Vue.createApp({}),this._app.component("array_attr",arrayAttrDefinition),this._app.component("mlp_model",nnModelDefinition),this._vue=null,this._name=Math.random().toString(32).substring(2)}get layers(){const t=this._vue?this._vue.$refs.layerselm.layers:[{type:"full",size:10,a:"sigmoid"}],e=[];for(let n=0;n<t.length;n++)"full"===t[n].type?(e.push({type:"full",out_size:t[n].size}),e.push({type:t[n].a,n:t[n].poly_pow})):e.push(t[n]);return e}get invlayers(){const t=this.layers,e=[];for(let n=t.length-1;n>=0;n-=2)e.push(t[n-1],t[n]);return e}get optimizer(){return this._opt&&this._opt.property("value")}makeHtml(t,{optimizer:e=!1}={}){t.append("span").attr("id",`mlp_model_${this._name}`).append("mlp_model").attr("ref","layerselm"),this._vue=this._app.mount(`#mlp_model_${this._name}`),e&&(t.append("span").text(" Optimizer "),this._opt=t.append("select").attr("name","optimizer"),this._opt.selectAll("option").data(["sgd","adam","momentum","rmsprop"]).enter().append("option").property("value",(t=>t)).text((t=>t)))}}