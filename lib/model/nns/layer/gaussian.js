import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

export default class GaussianLayer extends Layer {
	calc(x) {
		this._i = x
		this._o = Matrix.map(x, v => Math.exp((-v * v) / 2))
		return this._o
	}

	grad(bo) {
		const bi = Matrix.mult(this._o, this._i)
		bi.mult(-1)
		bi.mult(bo)
		return bi
	}
}

GaussianLayer.registLayer()
