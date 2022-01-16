Vue.component('array_attr', {
	props: ['value'],
	template: `
	<div style="display: inline-flex; align-items: flex-end;">
		<input v-if="value.length < 10" type="button" value="+" v-on:click="add">
		<div>
			<div v-for="v, i in value" :key="i">
				<input v-model.number="value[i]" type="number" step="0.1">
				<input type="button" value="x" v-on:click="value.splice(i, 1)">
			</div>
		</div>
	</div>
	`,
	created() {
	},
	methods: {
		add() {
			this.value.push(0)
		}
	}
});

Vue.component('mlp_model', {
	data: function() {
		return {
			layers: [],
			layerTypes: {
				'abs': {},
				'clip': {min: 0, max: 1},
				'conv': {kernel: 5, channel: 16},
				'dropout': {drop_rate: 0.5},
				'exp': {},
				'flatten': {},
				'full': {size: 10, a: 'sigmoid'},
				'gaussian': {},
				'leaky_relu': {a: 0.1},
				'linear': {},
				'log': {},
				'mean': {axis: 0},
				'negative': {},
				'power': {n: 2},
				'relu': {},
				'reshape': {size: [1, 1]},
				'sigmoid': {},
				'softmax': {},
				'softplus': {},
				'softsign': {},
				'sparsity': {rho: 0.02},
				'square': {},
				'sqrt': {},
				'sum': {axis: 0},
				'tanh': {},
				'transpose': {axis: [1, 0]},
				'variance': {axis: 0}
			},
			activations: ['sigmoid', 'tanh', 'relu', 'leaky_relu', 'softsign', 'softplus', 'linear', 'polynomial', 'abs', 'gaussian', 'softmax']
		}
	},
	template: `
	<div style="display: inline-flex; align-items: flex-end;">
		<input type="button" value="+" v-on:click="addLayer">
		<div>
			<div v-for="layer, i in layers" :key="i">
				#{{ i + 1 }}
				<select v-model="layer.type" v-on:change="changeType(i)">
					<option v-for="type in Object.keys(layerTypes)" :value="type">{{ type }}</option>
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
					Rho: <array_attr v-model="layer.rho" />
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
	created() {
		this.layers.length = 1
		this.layers[0] = {
			type: "full",
			size: 10,
			a: "sigmoid",
			poly_pow: 2
		}
	},
	methods: {
		addLayer() {
			this.layers.push({
				type: "full",
				size: 10,
				a: "sigmoid",
				poly_pow: 2
			});
		},
		changeType(idx) {
			const layer = {type: this.layers[idx].type, ...this.layerTypes[this.layers[idx].type]}
			this.layers.splice(idx, 1, layer)
		}
	}
});

export default class NeuralNetworkBuilder {
	constructor() {
		this._vue = null
		this._name = Math.random().toString(32).substring(2)
	}

	get layers() {
		const l = (this._vue) ? this._vue.$children[0].layers : [
			{ size: 10, a: "sigmoid"}
		]
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
		return this._opt && this._opt.property("value")
	}

	makeHtml(r, { optimizer = false } = {}) {
		r.append("span")
			.append("mlp_model")
			.attr("id", `mlp_model_${this._name}`)
		this._vue = new Vue({
			el: `#mlp_model_${this._name}`,
		})
		if (optimizer) {
			r.append("span")
				.text(" Optimizer ");
			this._opt = r.append("select")
				.attr("name", "optimizer")
			this._opt.selectAll("option")
				.data(["sgd", "adam", "momentum", "rmsprop"])
				.enter()
				.append("option")
				.property("value", d => d)
				.text(d => d);
		}
	}
}

