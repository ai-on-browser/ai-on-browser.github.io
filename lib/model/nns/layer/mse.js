import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'
import Layer from './base.js'

/**
 * MSE loss layer
 */
export default class MSELayer extends Layer {
	bind({ supervisor }) {
		if (Array.isArray(supervisor)) {
			this._t = Tensor.fromArray(supervisor)
			if (this._t.dimension === 2) {
				this._t = this._t.toMatrix()
			}
		} else if (supervisor instanceof Matrix || supervisor instanceof Tensor) {
			this._t = supervisor
		}
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.broadcastOperate(this._t, (a, b) => (a - b) ** 2)
		return new Matrix(1, 1, o.reduce((s, v) => s + v, 0) / o.length)
	}

	grad(bo) {
		bo = bo.toScaler()
		const bi = this._i.copy()
		bi.broadcastOperate(this._t, (a, b) => (bo * (a - b)) / 2)
		return bi
	}
}

MSELayer.registLayer('mse')
