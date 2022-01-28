import { NeuralnetworkException } from '../../neuralnetwork.js'
import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

export default class OnehotLayer extends Layer {
	constructor({ class_size = null, values = [], ...rest }) {
		super(rest)
		this._c = class_size
		this._values = values
	}

	calc(x) {
		if (x.cols !== 1) {
			throw new NeuralnetworkException('Invalid input.', [this, x])
		}
		const values = [...new Set(x.value)]
		if (!this._c) {
			this._c = values.length
		}
		for (let i = 0; i < values.length && this._values.length < this._c; i++) {
			if (this._values.indexOf(values[i]) < 0) {
				this._values.push(values[i])
			}
		}
		const o = Matrix.zeros(x.rows, this._c)
		for (let i = 0; i < x.rows; i++) {
			o.set(i, this._values.indexOf(x.at(i, 0)), 1)
		}
		return o
	}

	grad(bo) {}

	toObject() {
		return {
			type: 'onehot',
			class_size: this._c,
			values: this._values,
		}
	}
}

OnehotLayer.registLayer()
