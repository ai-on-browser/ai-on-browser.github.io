import Layer from './base.js'

export default class SquareLayer extends Layer {
	calc(x) {
		this._i = x
		return x.copyMult(x)
	}

	grad(bo) {
		const bi = this._i.copyMult(2)
		bi.mult(bo)
		return bi
	}
}

SquareLayer.registLayer()
