Vue.component('mlp_model', {
	data: function() {
		return {
			layers: []
		}
	},
	template: `
	<div style="display: inline-flex; align-items: flex-end;">
		<input v-if="layers.length < 10" type="button" value="+" v-on:click="addLayer">
		<div>
			<div v-for="layer, i in layers" :key="i">
				#{{ i + 1 }}
				Size: <input v-model="layer.size" type="number" min="1" max="100">
				Activation: <select v-model="layer.a">
					<option v-for="a in ['sigmoid', 'tanh', 'relu', 'leaky_relu', 'softsign', 'softplus', 'linear', 'polynomial', 'abs']" :value="a">{{ a }}</option>
				</select>
				<input v-if="layer.a === 'polynomial'" v-model="layer.poly_pow" type="number" min="1" max="10">
				<input v-if="layers.length > 0" type="button" value="x" v-on:click="layers.splice(i, 1)">
			</div>
		</div>
	</div>
	`,
	created() {
		this.layers.length = 1
		this.layers[0] = {
			size: 10,
			a: "sigmoid",
			poly_pow: 2
		}
	},
	methods: {
		addLayer() {
			this.layers.push({
				size: 10,
				a: "sigmoid",
				poly_pow: 2
			});
		}
	}
});

class NeuralNetworkBuilder {
	constructor() {
		this._vue = null
		this._name = Math.random().toString(32).substring(2)
	}

	get layers() {
		if (!this._vue) return null
		const l = this._vue.$children[0].layers
		const r = []
		for (let i = 0; i < l.length; i++) {
			r.push({ type: 'full', out_size: +l[i].size })
			r.push({ type: l[i].a, n: l[i].poly_pow })
		}
		return r
	}

	makeHtml(r) {
		r.append("span")
			.append("mlp_model")
			.attr("id", `mlp_model_${this._name}`)
		this._vue = new Vue({
			el: `#mlp_model_${this._name}`,
		})
	}
}

