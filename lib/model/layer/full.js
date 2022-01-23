import Layer from './base.js'
import Matrix from '../../util/matrix.js'
import ActivationLayer from './activation.js'

export default class FullyConnected extends Layer {
	constructor({
		in_size = null,
		out_size,
		w = null,
		b = null,
		activation = null,
		l2_decay = 0,
		l1_decay = 0,
		activation_params = {},
		...rest
	}) {
		super(rest)
		this._in_size = in_size
		this._out_size = out_size
		this._w = w ? Matrix.fromArray(w) : null
		this._b = b ? Matrix.fromArray(b) : Matrix.randn(1, out_size)
		this._activation = activation
		if (activation) {
			this._activation_func = new ActivationLayer({ activation, ...activation_params })
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

	update(optimizer) {
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
		this._w.sub(optimizer.delta('w', dw))
		const db = this._bo.sum(0)
		db.div(this._i.rows)
		this._b.sub(optimizer.delta('b', db))
	}

	toObject() {
		return {
			type: 'full',
			in_size: this._in_size,
			out_size: this._out_size,
			w: this._w?.toArray(),
			b: this._b.toArray(),
			activation: this._activation,
			l2_decay: this._l2_decay,
			l1_decay: this._l1_decay,
			activation_params: this._activation_func?.toObject(),
		}
	}
}

FullyConnected.registLayer('full')
