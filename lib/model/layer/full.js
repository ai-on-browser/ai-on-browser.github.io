import Layer from './base.js'
import { Matrix } from '../../util/math.js'

export default class FullyConnected extends Layer {
	constructor({ in_size = null, out_size, activation = null, l2_decay = 0, l1_decay = 0, ...rest }) {
		super(rest)
		this._in_size = in_size
		this._out_size = out_size
		this._w = null
		this._b = Matrix.randn(1, out_size)
		if (activation) {
			this._activation_func = this.network.getLayerFromName(activation, rest)
		}
		this._l2_decay = l2_decay
		this._l1_decay = l1_decay
	}

	calc(x) {
		if (!this._w) {
			this._w = Matrix.randn(x.cols, this._out_size)
		}
		this._i = x
		this._o = x.dot(this._w)
		this._o.add(this._b)
		if (this._activation_func) {
			return this._activation_func.calc(this._o)
		}
		return this._o
	}

	grad(bo) {
		this._bo = bo
		if (this._activation_func) {
			this._bo = this._activation_func.grad(bo)
		}
		this._bi = this._bo.dot(this._w.t)
		return this._bi
	}

	update() {
		const dw = this._i.tDot(this._bo)
		dw.div(this._i.rows)
		if (this._l2_decay > 0 || this._l1_decay > 0) {
			for (let i = 0; i < dw.rows; i++) {
				for (let j = 0; j < dw.cols; j++) {
					const v = this._w.at(i, j)
					dw.addAt(i, j, v * this._l2_decay + Math.sign(v) * this._l1_decay)
				}
			}
		}
		this._w.sub(this._opt.delta('w', dw))
		const db = this._bo.sum(0)
		db.div(this._i.rows)
		this._b.sub(this._opt.delta('b', db))
	}

	get_params() {
		return {
			w: this._w,
			b: this._b,
		}
	}

	set_params(param) {
		this._w = param.w.copy()
		this._b = param.b.copy()
	}
}
