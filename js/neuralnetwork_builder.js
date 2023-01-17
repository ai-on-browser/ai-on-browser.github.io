const layerTypes = {
	abs: {},
	clip: { min: 0, max: 1 },
	conv: { kernel: 5, channel: 16 },
	dropout: { drop_rate: 0.5 },
	exp: {},
	flatten: {},
	full: { size: 10, a: 'sigmoid' },
	gaussian: {},
	leaky_relu: { a: 0.1 },
	identity: {},
	log: {},
	mean: { axis: 0 },
	negative: {},
	power: { n: 2 },
	relu: {},
	reshape: { size: [1, 1] },
	sigmoid: {},
	softmax: {},
	softplus: {},
	softsign: {},
	sparsity: { rho: 0.02 },
	square: {},
	sqrt: {},
	sum: { axis: 0 },
	tanh: {},
	transpose: { axis: [1, 0] },
	variance: { axis: 0 },
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
				size: 10,
				a: 'sigmoid',
				poly_pow: 2,
			},
		])

		const changeType = function (idx) {
			const layer = { type: layers.value[idx].type, ...layerTypes[layers.value[idx].type] }
			layers.value.splice(idx, 1, layer)
		}
		const addLayer = function () {
			layers.value.push({
				type: 'full',
				size: 10,
				a: 'sigmoid',
				poly_pow: 2,
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
			activations: [
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
				<template v-if="layer.type === 'power'">
					n: <input v-model.number="layer.n" type="number" min="-10" max="10">
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
	`,
}

export default class NeuralNetworkBuilder {
	constructor() {
		this._app = Vue.createApp({})
		this._app.component('array_attr', arrayAttrDefinition)
		this._app.component('mlp_model', nnModelDefinition)
		this._vue = null
		this._name = Math.random().toString(32).substring(2)
	}

	get layers() {
		const l = this._vue ? this._vue.$refs.layerselm.layers : [{ type: 'full', size: 10, a: 'sigmoid' }]
		const r = []
		for (let i = 0; i < l.length; i++) {
			if (l[i].type === 'full') {
				r.push({ type: 'full', out_size: l[i].size })
				r.push({ type: l[i].a, n: l[i].poly_pow })
			} else {
				r.push(l[i])
			}
		}
		return r
	}

	get invlayers() {
		const l = this.layers
		const r = []
		for (let i = l.length - 1; i >= 0; i -= 2) {
			r.push(l[i - 1], l[i])
		}
		return r
	}

	get optimizer() {
		return this._opt && this._opt.property('value')
	}

	makeHtml(r, { optimizer = false } = {}) {
		r.append('span').attr('id', `mlp_model_${this._name}`).append('mlp_model').attr('ref', 'layerselm')
		this._vue = this._app.mount(`#mlp_model_${this._name}`)
		if (optimizer) {
			r.append('span').text(' Optimizer ')
			this._opt = r.append('select').attr('name', 'optimizer')
			this._opt
				.selectAll('option')
				.data(['sgd', 'adam', 'momentum', 'rmsprop'])
				.enter()
				.append('option')
				.property('value', d => d)
				.text(d => d)
		}
	}
}
