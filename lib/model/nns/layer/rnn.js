import Layer from './base.js'
import Tensor from '../../../util/tensor.js'
import Matrix from '../../../util/matrix.js'
import ActivationLayer from './activation.js'

export default class RNNLayer extends Layer {
	constructor({
		size,
		out_size = null,
		activation = 'tanh',
		recurrent_activation = 'sigmoid',
		return_sequences = false,
		w_xh = null,
		w_hh = null,
		w_hy = null,
		b_xh = null,
		b_hh = null,
		b_hy = null,
		activation_params = {},
		recurrent_activation_params = {},
		...rest
	}) {
		super(rest)
		this._size = size
		this._out_size = out_size || size
		this._w_hy = w_hy ? Matrix.fromArray(w_hy) : Matrix.randn(size, this._out_size)
		this._b_hy = b_hy ? Matrix.fromArray(b_hy) : Matrix.zeros(1, this._out_size)

		this._unit = new RNNUnitLayer({
			size,
			recurrent_activation,
			w_xh,
			w_hh,
			b_xh,
			b_hh,
			recurrent_activation_params,
		})

		this._activation = activation
		if (activation) {
			this._activation_func = new ActivationLayer({ activation, ...activation_params })
		}

		this._return_sequences = return_sequences
	}

	calc(x) {
		x = x.transpose(1, 0, 2)
		this._i = []
		for (let k = 0; k < x.sizes[0]; k++) {
			this._i[k] = x.at(k).toMatrix()
		}
		this._o = []
		this._z = []
		this._v = []
		for (let k = 0; k < this._i.length; k++) {
			this._z[k] = this._unit.calc(this._i[k], k)
			this._o[k] = this._z[k].dot(this._w_hy)
			this._o[k].add(this._b_hy)
			if (this._activation_func) {
				this._v[k] = this._o[k]
				this._o[k] = this._activation_func.calc(this._o[k])
			}
		}
		if (this._return_sequences) {
			const t = Tensor.fromArray(this._o.map(v => v.toArray()))
			return t.transpose(1, 0, 2)
		}
		return this._o[this._o.length - 1]
	}

	grad(bo) {
		return this._grad_bptt(bo)
	}

	_grad_bptt(bo) {
		const s = this._o.length
		this._bo = Array(s)
		if (this._return_sequences) {
			bo = bo.transpose(1, 0, 2)
			for (let i = 0; i < s; i++) {
				this._bo[i] = bo.at(i).toMatrix()
			}
		} else {
			this._bo[s - 1] = bo
		}
		if (this._activation_func) {
			this._bo = this._bo.map((bo, i) => {
				if (bo) {
					this._activation_func.calc(this._v[i])
					return this._activation_func.grad(bo)
				}
				return bo
			})
		}
		const bi = []
		for (let i = s - 1; i >= 0; i--) {
			bi[i] = this._unit.grad(this._bo[i]?.dot(this._w_hy.t), i)
		}
		const t = Tensor.fromArray(bi.map(b => b.toArray()))
		return t.transpose(1, 0, 2)
	}

	update(optimizer) {
		this._update_bptt(optimizer)
	}

	_update_bptt(optimizer) {
		const s = this._o.length

		const dw_hy = Matrix.zeros(this._size, this._out_size)
		const db_hy = Matrix.zeros(1, this._out_size)
		for (let i = 0; i < s; i++) {
			if (this._bo[i]) {
				const dw = this._z[i].tDot(this._bo[i])
				dw.div(this._z[i].rows)
				dw_hy.add(dw)
				db_hy.add(this._bo[i].mean(0))
			}
		}
		dw_hy.div(s)
		db_hy.div(s)
		this._w_hy.sub(optimizer.delta('w_hy', dw_hy))
		this._b_hy.sub(optimizer.delta('b_hy', db_hy))

		this._unit.update(optimizer)
	}

	toObject() {
		return {
			type: 'rnn',
			out_size: this._size,
			return_sequences: this._return_sequences,
			w_hy: this._w_hy.toArray(),
			b_hy: this._b_hy.toArray(),
			activation: this._activation,
			activation_params: this._activation_func?.toObject(),
			...this._unit.toObject(),
		}
	}
}

class RNNUnitLayer extends Layer {
	constructor({
		size,
		recurrent_activation = 'sigmoid',
		w_xh = null,
		w_hh = null,
		b_xh = null,
		b_hh = null,
		recurrent_activation_params = {},
		...rest
	}) {
		super(rest)
		this._size = size
		this._w_xh = w_xh ? Matrix.fromArray(w_xh) : null
		this._w_hh = w_hh ? Matrix.fromArray(w_hh) : Matrix.randn(size, size)
		this._b_xh = b_xh ? Matrix.fromArray(b_xh) : Matrix.zeros(1, size)
		this._b_hh = b_hh ? Matrix.fromArray(b_hh) : Matrix.zeros(1, size)
		this._z0 = Matrix.zeros(1, size)
		this._i = []
		this._z = []
		this._u = []

		this._bo = []
		this._bh = []

		this._recurrent_activation = recurrent_activation
		if (recurrent_activation) {
			this._recurrent_activation_func = new ActivationLayer({
				activation: recurrent_activation,
				...recurrent_activation_params,
			})
		}
	}

	calc(x, k) {
		if (!this._w_xh) {
			this._w_xh = Matrix.randn(x.cols, this._size)
		}
		if (k === 0) {
			this._z = []
		}

		this._i[k] = x
		this._z[k] = x.dot(this._w_xh)
		const pre_z = k === 0 ? this._z0 : this._z[k - 1]
		this._z[k].add(pre_z.dot(this._w_hh))
		this._z[k].add(this._b_xh)
		this._z[k].add(this._b_hh)
		if (this._recurrent_activation_func) {
			this._u[k] = this._z[k]
			this._z[k] = this._recurrent_activation_func.calc(this._z[k])
		}
		return this._z[k]
	}

	grad(bo, k) {
		return this._grad_bptt(bo, k)
	}

	_grad_bptt(bo, k) {
		const s = this._z.length
		this._bo[k] = bo
		this._bh[k] = this._bo[k] || Matrix.zeros(1, 1)
		if (k < s - 1) {
			this._bh[k].add(this._bh[k + 1].dot(this._w_hh.t))
		}
		if (this._recurrent_activation_func) {
			this._recurrent_activation_func.calc(this._u[k])
			this._bh[k] = this._recurrent_activation_func.grad(this._bh[k])
		}
		return this._bh[k].dot(this._w_xh.t)
	}

	update(optimizer) {
		this._update_bptt(optimizer)
	}

	_update_bptt(optimizer) {
		const s = this._z.length
		const dw_xh = Matrix.zeros(...this._w_xh.sizes)
		const db_xh = Matrix.zeros(1, this._size)
		for (let i = 0; i < s; i++) {
			const dw = this._i[i].tDot(this._bh[i])
			dw.div(this._i[i].rows)
			dw_xh.add(dw)
			db_xh.add(this._bh[i].mean(0))
		}
		dw_xh.div(s)
		db_xh.div(s)
		this._w_xh.sub(optimizer.delta('w_xh', dw_xh))
		this._b_xh.sub(optimizer.delta('b_xh', db_xh))

		const dw_hh = Matrix.zeros(this._size, this._size)
		const db_hh = Matrix.zeros(1, this._size)
		for (let i = 0; i < s - 1; i++) {
			const dw = this._z[i].tDot(this._bh[i + 1])
			dw.div(this._z[i].rows)
			dw_hh.add(dw)
			db_hh.add(this._bh[i + 1].mean(0))
		}
		dw_hh.div(s - 1)
		db_hh.div(s - 1)
		this._w_hh.sub(optimizer.delta('w_hh', dw_hh))
		this._b_hh.sub(optimizer.delta('b_hh', db_hh))
	}

	toObject() {
		return {
			w_xh: this._w_xh?.toArray(),
			w_hh: this._w_hh.toArray(),
			b_xh: this._b_xh.toArray(),
			b_hh: this._b_hh.toArray(),
			recurrent_activation: this._recurrent_activation,
			recurrent_activation_params: this._recurrent_activation_func?.toObject(),
		}
	}
}

RNNLayer.registLayer('rnn')
