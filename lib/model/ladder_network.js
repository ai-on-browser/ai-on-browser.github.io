import NeuralNetwork from './neuralnetwork.js'

/**
 * Ladder network
 */
export default class LadderNetwork {
	// https://www.kabuku.co.jp/developers/semi-supervised_learning_with_ladder_networks
	/**
	 * @param {number[]} hidden_sizes Sizes of hidden layers
	 * @param {number[]} lambdas Regularization parameters
	 * @param {string} activation Activation name
	 * @param {string} optimizer Optimizer of the network
	 */
	constructor(hidden_sizes, lambdas, activation, optimizer) {
		this._hidden_sizes = hidden_sizes
		this._lambdas = lambdas
		this._activation = activation
		this._optimizer = optimizer
		this._noise_std = Array(this._hidden_sizes.length + 2).fill(0.001)

		this._model = null
		this._classes = null
		this._optimizer = optimizer
		this._epoch = 0
	}

	/**
	 * Epoch
	 *
	 * @type {number}
	 */
	get epoch() {
		return this._epoch
	}

	_build() {
		const hidden_sizes = [...this._hidden_sizes, this._classes.length]
		this._layers = [
			{ type: 'input', name: 'x' },
			{ type: 'linear', name: 'z_0' },
			{ type: 'random', size: 'x', variance: this._noise_std[0] ** 2, name: 'noize' },
			{ type: 'add', input: ['x', 'noize'], name: 'zt_0' },

			{ type: 'mean', input: 'x', name: 'mean_0' },
			{ type: 'std', input: 'x', name: 'std_0' },

			{ type: 'concat', input: ['z_0', 'zt_0'], axis: 0 },
		]
		for (let i = 0; i < hidden_sizes.length; i++) {
			const k = i + 1
			this._layers.push(
				{ type: 'full', out_size: hidden_sizes[i] },
				{ type: 'split', size: 2, axis: 0, name: `zpre_${k}` },

				{ type: 'batch_normalization', input: `zpre_${k}[1]`, name: `ztbn_${k}` },
				{ type: 'random', size: `ztbn_${k}`, variance: this._noise_std[k] ** 2, name: `noize_${k}` },
				{ type: 'add', input: [`ztbn_${k}`, `noize_${k}`], name: `zt_${k}` },

				{ type: 'mean', input: `zpre_${k}[0]`, name: `mean_${k}` },
				{ type: 'std', input: `zpre_${k}[0]`, name: `std_${k}` },
				{ type: 'batch_normalization', input: `zpre_${k}[0]`, name: `z_${k}` },

				{ type: 'concat', input: [`z_${k}`, `zt_${k}`], axis: 0, name: `zcon_${k}` },

				{ type: 'variable', size: [1, hidden_sizes[i]], name: `b_${k}` },
				{ type: 'add', input: [`zcon_${k}`, `b_${k}`], name: `hadd_${k}` },
				{ type: 'variable', size: [1, hidden_sizes[i]], name: `g_${k}` },
				{ type: 'mult', input: [`hadd_${k}`, `g_${k}`] },
				{ type: this._activation }
			)
		}
		this._layers.push(
			{ type: 'split', size: 2, axis: 0, name: 'reduced' },
			{ type: 'softmax', input: 'reduced[0]', name: 'predict' },
			{ type: 'linear', input: 'reduced[1]' }
		)

		for (let k = hidden_sizes.length; k >= 0; k--) {
			const size = k === 0 ? 'x' : hidden_sizes[k - 1]
			if (k === hidden_sizes.length) {
				this._layers.push({ type: 'batch_normalization', name: `u_${k}` })
			} else {
				this._layers.push(
					{ type: 'full', out_size: size, input: `zh_${k + 1}` },
					{ type: 'batch_normalization', name: `u_${k}` }
				)
			}
			this._layers.push(
				{ type: 'variable', size: `mean_${k}`, name: `a1_${k}` },
				{ type: 'variable', size: `mean_${k}`, name: `a2_${k}` },
				{ type: 'variable', size: `mean_${k}`, name: `a3_${k}` },
				{ type: 'variable', size: `mean_${k}`, name: `a4_${k}` },
				{ type: 'variable', size: `mean_${k}`, name: `a5_${k}` },
				{ type: 'variable', size: `mean_${k}`, name: `a6_${k}` },
				{ type: 'variable', size: `mean_${k}`, name: `a7_${k}` },
				{ type: 'variable', size: `mean_${k}`, name: `a8_${k}` },
				{ type: 'variable', size: `mean_${k}`, name: `a9_${k}` },
				{ type: 'variable', size: `mean_${k}`, name: `a0_${k}` },

				{ type: 'mult', input: [`a2_${k}`, `u_${k}`], name: `m1_${k}` },
				{ type: 'add', input: [`a3_${k}`, `m1_${k}`] },
				{ type: 'sigmoid', name: `m2_${k}` },
				{ type: 'mult', input: [`a1_${k}`, `m2_${k}`], name: `m3_${k}` },
				{ type: 'mult', input: [`a4_${k}`, `u_${k}`], name: `m4_${k}` },
				{ type: 'add', input: [`a5_${k}`, `m3_${k}`, `m4_${k}`], name: `m_${k}` },

				{ type: 'mult', input: [`a7_${k}`, `u_${k}`], name: `v1_${k}` },
				{ type: 'add', input: [`a8_${k}`, `v1_${k}`] },
				{ type: 'sigmoid', name: `v2_${k}` },
				{ type: 'mult', input: [`a6_${k}`, `v2_${k}`], name: `v3_${k}` },
				{ type: 'mult', input: [`a9_${k}`, `u_${k}`], name: `v4_${k}` },
				{ type: 'add', input: [`a0_${k}`, `v3_${k}`, `v4_${k}`], name: `v_${k}` },

				{ type: 'sub', input: [`zt_${k}`, `m_${k}`], name: `zh1_${k}` },
				{ type: 'mult', input: [`zh1_${k}`, `v_${k}`], name: `zh2_${k}` },
				{ type: 'add', input: [`zh2_${k}`, `m_${k}`], name: `zh_${k}` },

				{ type: 'sub', input: [`zh_${k}`, `mean_${k}`], name: `zhbn1_${k}` },
				{ type: 'div', input: [`zhbn1_${k}`, `std_${k}`], name: `zhbn_${k}` }
			)
		}
		this._layers.push(
			{ type: 'output', name: 'reconstruct' },

			{ type: 'supervisor', name: 't' },
			{ type: 'sub', input: ['t', 'predict'] },
			{ type: 'square' },
			{ type: 'sum', axis: 1 },
			{ type: 'mean', name: 'cc0' },
			{ type: 'input', name: 'is_labeled' },
			{ type: 'mult', input: ['cc0', 'is_labeled'], name: 'cc' }
		)
		const costs = ['cc']
		for (let i = 0; i <= hidden_sizes.length; i++) {
			this._layers.push(
				{ type: 'sub', input: [`z_${i}`, `zhbn_${i}`] },
				{ type: 'square' },
				{ type: 'sum', axis: 1 },
				{ type: 'mean', name: `cl_${i}` },
				{ type: 'mult', input: [this._lambdas[i], `cl_${i}`], name: `wcl_${i}` }
			)
			costs.push(`wcl_${i}`)
		}
		this._layers.push({ type: 'add', input: costs })

		return NeuralNetwork.fromObject(this._layers, null, 'adam')
	}

	/**
	 * Fit model.
	 *
	 * @param {Array<Array<number>>} train_x Training data
	 * @param {(* | null)[]} train_y Target values
	 * @param {number} iteration Iteration count
	 * @param {number} rate Learning rate
	 * @param {number} batch Batch size
	 * @returns {{labeledLoss: number, unlabeledLoss: number}} Loss value
	 */
	fit(train_x, train_y, iteration, rate, batch) {
		if (!this._classes) {
			const classes = new Set()
			for (let i = 0; i < train_y.length; i++) {
				if (train_y[i] != null) {
					classes.add(train_y[i])
				}
			}
			this._classes = [...classes]
		}
		if (!this._model) {
			this._model = this._build()
		}
		let lLoss = null
		let uLoss = null
		const labeled_x = train_x.filter((v, i) => train_y[i] != null)
		if (labeled_x.length > 0) {
			const labeled_y = train_y.filter(v => v != null)
			const y = labeled_y.map(v => {
				const yi = Array(this._classes.length).fill(0)
				yi[this._classes.indexOf(v)] = 1
				return yi
			})
			lLoss = this._model.fit({ x: labeled_x, is_labeled: [[1]] }, y, iteration, rate, batch)
		}

		const unlabeled_x = train_x.filter((v, i) => train_y[i] == null)
		if (unlabeled_x.length > 0) {
			uLoss = this._model.fit({ x: unlabeled_x, is_labeled: [[0]] }, [[0]], iteration, rate, batch)
		}
		this._epoch += iteration
		return { labeledLoss: lLoss?.[0], unlabeledLoss: uLoss?.[0] }
	}

	/**
	 * Returns predicted values.
	 *
	 * @param {Array<Array<number>>} x Sample data
	 * @returns {*[]} Predicted values
	 */
	predict(x) {
		return this._model
			.calc({ x, is_labeled: null }, null, ['predict'])
			.predict.argmax(1)
			.value.map(v => this._classes[v])
	}
}
