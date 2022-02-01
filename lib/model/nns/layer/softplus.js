import Layer from './base.js'

export default class SoftplusLayer extends Layer {
	constructor({ beta = 1, ...rest }) {
		super(rest)
		this._beta = beta
	}

	calc(x) {
		this._i = x
		return x.copyMap(v => Math.log(1 + Math.exp(this._beta * v)) / this._beta)
	}

	grad(bo) {
		const bi = this._i.copyMap(v => 1 / (1 + Math.exp(this._beta * v)))
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