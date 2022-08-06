import { LossLayer } from './base.js'
import Matrix from '../../../util/matrix.js'

export default class HuberLayer extends LossLayer {
	bind({ supervisor }) {
		this._t = supervisor
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

	grad() {
		this._bi = this._cond.copy()
		this._bi.map((c, i) => (c ? this._i.at(i) - this._t.at(i) : Math.sign(this._i.at(i) - this._t.at(i))))
		return this._bi
	}
}

HuberLayer.registLayer()
