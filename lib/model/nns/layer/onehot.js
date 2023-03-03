import Layer, { NeuralnetworkLayerException } from './base.js'
import Matrix from '../../../util/matrix.js'

/**
 * One-hot layer
 */
export default class OnehotLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number} [config.class_size] Number of classes
	 * @param {number[]} [config.values] Values of classes
	 */
	constructor({ class_size = null, values = [], ...rest }) {
		super(rest)
		this._c = class_size
		this._values = values
	}

	calc(x) {
		if (x.cols !== 1) {
			throw new NeuralnetworkLayerException('Invalid input.', [this, x])
		}
		const values = [...new Set(x.value)]
		if (!this._c) {
			this._c = values.length
		}
		this._i = x
		for (let i = 0; i < values.length && this._values.length < this._c; i++) {
			if (!this._values.includes(values[i])) {
				this._values.push(values[i])
			}
		}
		const o = Matrix.zeros(x.rows, this._c)
		for (let i = 0; i < x.rows; i++) {
			o.set(i, this._values.indexOf(x.at(i, 0)), 1)
		}
		return o
	}

	grad() {
		const bi = this._i.copy()
		bi.fill(0)
		return bi
	}

	toObject() {
		return {
			type: 'onehot',
			class_size: this._c,
			values: this._values,
		}
	}
}

OnehotLayer.registLayer()
