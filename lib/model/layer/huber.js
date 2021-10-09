import { LossLayer } from './base.js'
import { Matrix } from '../../util/math.js'

export default class HuberLayer extends LossLayer {
	bind({ supervisor }) {
		this._t = supervisor
	}

	calc(x) {
		this._i = x
		const err = this._t.copySub(x)
		err.map(Math.abs)
		this._cond = new Matrix(
			err.rows,
			err.cols,
			err.value.map(v => v < 1.0)
		)
		err.map((v, i) => (this._cond.value[i] ? 0.5 * v * v : v - 0.5))
		return new Matrix(1, 1, err.sum())
	}

	grad() {
		this._bi = this._cond.copy()
		this._bi.map((c, i) =>
			c ? this._i.value[i] - this._t.value[i] : Math.sign(this._i.value[i] - this._t.value[i])
		)
		return this._bi
	}
}
