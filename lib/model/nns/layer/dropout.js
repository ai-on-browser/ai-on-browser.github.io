import Layer from './base.js'

/**
 * Dropout layer
 */
export default class DropoutLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} [config.drop_rate] Dropout rate
	 */
	constructor({ drop_rate = 0.5, ...rest }) {
		super(rest)
		this._drop_rate = drop_rate
	}

	bind({ drop_rate }) {
		this._drop_rate = drop_rate || this._drop_rate
	}

	_shuffle(n) {
		const arr = Array.from({ length: n }, (_, i) => i)
		for (let i = n - 1; i > 0; i--) {
			const r = Math.floor(Math.random() * (i + 1))
			;[arr[i], arr[r]] = [arr[r], arr[i]]
		}
		return arr.slice(0, Math.max(1, Math.floor(n * this._drop_rate)))
	}

	calc(x) {
		const step = x.length / x.sizes[0]
		this._drop_index = this._shuffle(step)
		const o = x.copy()
		for (let i = 0; i < x.sizes[0]; i++) {
			for (const j of this._drop_index) {
				o.value[i * step + j] = 0
			}
		}
		o.map(v => v * (step / (step - this._drop_index.length)))
		return o
	}

	grad(bo) {
		const bi = bo.copy()
		const step = bi.length / bi.sizes[0]
		for (let i = 0; i < bo.sizes[0]; i++) {
			for (const j of this._drop_index) {
				bi.value[i * step + j] = 0
			}
		}
		bi.map(v => v * (step / (step - this._drop_index.length)))
		return bi
	}

	toObject() {
		return {
			type: 'dropout',
			drop_rate: this._drop_rate,
		}
	}
}

DropoutLayer.registLayer()
