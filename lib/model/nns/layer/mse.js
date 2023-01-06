import { LossLayer } from './base.js'
import Matrix from '../../../util/matrix.js'

/**
 * MSE loss layer
 */
export default class MSELayer extends LossLayer {
	bind({ supervisor }) {
		this._t = supervisor
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.broadcastOperate(this._t, (a, b) => (a - b) ** 2)
		return new Matrix(1, 1, o.reduce((s, v) => s + v, 0) / o.length)
	}

	grad() {
		const bi = this._i.copy()
		bi.broadcastOperate(this._t, (a, b) => (a - b) / 2)
		return bi
	}
}

MSELayer.registLayer('mse')
