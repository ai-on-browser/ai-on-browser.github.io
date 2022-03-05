import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

export default class SoftplusLayer extends Layer {
	constructor({ beta = 1, ...rest }) {
		super(rest)
		this._beta = beta
	}

	calc(x) {
		this._i = x
		return Matrix.map(x, v => Math.log(1 + Math.exp(this._beta * v)) / this._beta)
	}

	grad(bo) {
		const bi = Matrix.map(this._i, v => 1 / (1 + Math.exp(this._beta * v)))
		bi.mult(bo)
		return bi
	}

	toObject() {
		return {
			type: 'softplus',
			beta: this._beta,
		}
	}
}

SoftplusLayer.registLayer()
