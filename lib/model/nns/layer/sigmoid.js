import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

export default class SigmoidLayer extends Layer {
	constructor({ a = 1, ...rest }) {
		super(rest)
		this._a = a
	}

	calc(x) {
		this._o = Matrix.map(x, v => 1 / (1 + Math.exp(-this._a * v)))
		return this._o
	}

	grad(bo) {
		const bi = Matrix.map(this._o, v => v * (1 - v))
		bi.mult(bo)
		return bi
	}

	toObject() {
		return {
			type: 'sigmoid',
			a: this._a,
		}
	}
}

SigmoidLayer.registLayer()
