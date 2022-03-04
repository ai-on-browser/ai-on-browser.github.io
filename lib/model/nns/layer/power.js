import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

export default class PowerLayer extends Layer {
	constructor({ n, ...rest }) {
		super(rest)
		this._n = n
	}

	calc(x) {
		this._i = x
		return Matrix.map(x, v => v ** this._n)
	}

	grad(bo) {
		const bi = Matrix.map(this._i, v => this._n * v ** (this._n - 1))
		bi.mult(bo)
		return bi
	}

	toObject() {
		return {
			type: 'power',
			n: this._n,
		}
	}
}

PowerLayer.registLayer()
