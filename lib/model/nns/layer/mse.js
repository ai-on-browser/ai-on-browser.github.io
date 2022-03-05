import { LossLayer } from './base.js'
import Matrix from '../../../util/matrix.js'

export default class MSELayer extends LossLayer {
	bind({ supervisor }) {
		this._t = supervisor
	}

	calc(x) {
		this._i = x
		const o = Matrix.sub(x, this._t)
		o.mult(o)
		return new Matrix(1, 1, o.mean())
	}

	grad() {
		const bi = Matrix.sub(this._i, this._t)
		bi.div(2)
		return bi
	}
}

MSELayer.registLayer('mse')
