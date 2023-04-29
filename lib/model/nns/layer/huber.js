import Layer from './base.js'
import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'

/**
 * Huber loss layer
 */
export default class HuberLayer extends Layer {
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
		const err = this._t.copy()
		err.broadcastOperate(x, (a, b) => Math.abs(a - b))
		this._cond = err.copy()
		this._cond.map(v => v < 1.0)
		err.map((v, i) => (this._cond.at(i) ? 0.5 * v * v : v - 0.5))
		return new Matrix(
			1,
			1,
			err.reduce((s, v) => s + v)
		)
	}

	grad(bo) {
		bo = bo.toScaler()
		this._bi = this._cond.copy()
		this._bi.map((c, i) => bo * (c ? this._i.at(i) - this._t.at(i) : Math.sign(this._i.at(i) - this._t.at(i))))
		return this._bi
	}
}

HuberLayer.registLayer()
