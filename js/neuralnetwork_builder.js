import * as opt from '../../lib/model/nns/optimizer.js'

const layerTypes = {
	abs: {},
	acos: {},
	acoh: {},
	asin: {},
	asinh: {},
	atan: {},
	atanh: {},
	bdaa: { alpha: { type: 'number', default: 1, multipleOf: 0.1 } },
	bent_identity: {},
	blu: { beta: { type: 'number', default: 0.1, multipleOf: 0.1 } },
	brelu: { a: { type: 'number', default: 1, multipleOf: 0.1 } },
	ceil: {},
	celu: { a: { type: 'number', default: 1, multipleOf: 0.1 } },
	clip: {
		min: { type: 'number', default: 0, multipleOf: 0.1 },
		max: { type: 'number', default: 1, multipleOf: 0.1 },
	},
	cloglog: {},
	cloglogm: {},
	conv: { kernel: { type: 'number', default: 5 }, channel: { type: 'number', default: 16 } },
	cos: {},
	cosh: {},
	crelu: {},
	dropout: {
		drop_rate: { type: 'number', label: 'Drop rate', default: 0.5, multipleOf: 0.1, minimum: 0, maximum: 1 },
	},
	eelu: {
		k: { type: 'number', default: 1, multipleOf: 0.1 },
		alpha: { type: 'number', default: 1, multipleOf: 0.1 },
		beta: { type: 'number', default: 1, multipleOf: 0.1 },
	},
	elish: {},
	elliott: {},
	elu: { a: { type: 'number', default: 1, multipleOf: 0.1 } },
	erelu: {},
	erf: {},
	eswish: { beta: { type: 'number', default: 1, multipleOf: 0.1 } },
	exp: {},
	felu: { alpha: { type: 'number', default: 1, multipleOf: 0.1 } },
	flatten: {},
	floor: {},
	frelu: { b: { type: 'number', default: 0, multipleOf: 0.1 } },
	full: {
		out_size: { type: 'number', label: 'Output size', default: 10, minimum: 1, maximum: 100 },
		activation: {
			type: 'string',
			label: 'Activation',
			default: 'sigmoid',
			enum: [
				'sigmoid',
				'tanh',
				'relu',
				'leaky_relu',
				'softsign',
				'softplus',
				'identity',
				'polynomial',
				'abs',
				'gaussian',
				'softmax',
			],
		},
	},
	function: { func: { type: 'string', default: '2*x' } },
	gaussian: {},
	gelu: {},
	leaky_relu: { a: { type: 'number', default: 0.1, multipleOf: 0.1, minimum: 0, maximum: 1 } },
	identity: {},
	log: {},
	mean: { axis: { type: 'number', default: 0, minimum: 0, maximum: 10 } },
	negative: {},
	relu: {},
	reshape: { size: { type: 'array', default: [1, 1] } },
	sigmoid: {},
	softmax: {},
	softplus: {},
	softsign: {},
	sparsity: { rho: { type: 'number', default: 0.02, multipleOf: 0.01 } },
	square: {},
	sqrt: {},
	sum: { axis: { type: 'number', default: 0, minimum: 0, maximum: 10 } },
	tanh: {},
	transpose: { axis: { type: 'array', default: [1, 0] } },
	variance: { axis: { type: 'number', default: 0, minimum: 0, maximum: 10 } },
}

const arrayAttrDefinition = {
	props: ['modelValue'],
	template: `
	<div style="display: inline-flex; align-items: flex-end;">
		<input v-if="modelValue?.length < 10" type="button" value="+" v-on:click="modelValue.push(0)">
		<div>
			<div v-for="v, i in modelValue" :key="i">
				<input v-model.number="modelValue[i]" type="number" step="0.1">
				<input type="button" value="x" v-on:click="modelValue.splice(i, 1)">
			</div>
		</div>
	</div>
	`,
}

const nnModelDefinition = {
	setup() {
		const layers = Vue.ref([
			{
				type: 'full',
				out_size: 10,
				activation: 'sigmoid',
			},
		])

		const changeType = function (idx) {
			const layer = { type: layers.value[idx].type }
			for (const [k, v] of Object.entries(layerTypes[layers.value[idx].type])) {
				layer[k] = v.default
			}
			layers.value.splice(idx, 1, layer)
		}
		const addLayer = function () {
			layers.value.push({
				type: 'full',
				out_size: 10,
				activation: 'sigmoid',
			})
		}

		return {
			layers,
			changeType,
			addLayer,
		}
	},
	data: function () {
		return {
			layerTypeNames: Object.keys(layerTypes),
			layerTypes: layerTypes,
		}
	},
	template: `
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
	`,
}

export default class NeuralNetworkBuilder {
	constructor() {
		this._app = Vue.createApp({})
		this._app.component('array_attr', arrayAttrDefinition)
		this._app.component('nn_model', nnModelDefinition)
		this._vue = null
		this._name = Math.random().toString(32).substring(2)
	}

	get layers() {
		const l = this._vue ? this._vue.$refs.layerselm.layers : [{ type: 'full', out_size: 10, a: 'sigmoid' }]
		return l.map(v => ({ ...v }))
	}

	get invlayers() {
		return this.layers.concat().reverse()
	}

	get optimizer() {
		return this._opt && this._opt.property('value')
	}

	makeHtml(controller, { optimizer = false } = {}) {
		const mdlElm = controller.span()
		mdlElm.element.id = `nn_model_${this._name}`
		const nnModelElm = document.createElement('nn_model')
		nnModelElm.setAttribute('ref', 'layerselm')
		mdlElm.element.append(nnModelElm)
		this._vue = this._app.mount(`#nn_model_${this._name}`)
		if (optimizer) {
			const optElm = controller.span()
			optElm.select({ label: ' Optimizer ', values: Object.keys(opt), value: 'adam' })
		}
	}
}
