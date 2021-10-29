import Layer from './base.js'
import { Matrix, Tensor } from '../../util/math.js'
import ActivationLayer from './activation.js'

export default class RNNLayer extends Layer {
	constructor({
		size,
		out_size = null,
		activation = 'tanh',
		recurrent_activation = 'sigmoid',
		return_sequences = false,
		...rest
	}) {
		super(rest)
		this._size = size
		this._out_size = out_size || size
		this._w_xh = null
		this._w_hh = Matrix.randn(size, size)
		this._w_hy = Matrix.randn(size, this._out_size)
		this._b_xh = Matrix.zeros(1, size)
		this._b_hh = Matrix.zeros(1, size)
		this._b_hy = Matrix.zeros(1, this._out_size)
		this._z0 = Matrix.zeros(1, this._out_size)

		this._rest = rest
		if (activation) {
			this._activation = new ActivationLayer({ activation, ...rest })
		}
		if (recurrent_activation) {
			this._recurrent_activation = new ActivationLayer({ activation: recurrent_activation, ...rest })
		}

		this._return_sequences = return_sequences
	}

	calc(x) {
		x = x.transpose(1, 0, 2)
		this._i = []
		for (let k = 0; k < x.sizes[0]; k++) {
			this._i[k] = x.at(k).toMatrix()
		}
		if (!this._w_xh) {
			this._w_xh = Matrix.randn(this._i[0].cols, this._size)
		}
		this._o = []
		this._z = []
		this._u = []
		this._v = []
		for (let k = 0; k < this._i.length; k++) {
			this._z[k] = this._i[k].dot(this._w_xh)
			const pre_z = k === 0 ? this._z0 : this._z[k - 1]
			this._z[k].add(pre_z.dot(this._w_hh))
			this._z[k].add(this._b_xh)
			this._z[k].add(this._b_hh)
			if (this._recurrent_activation) {
				this._u[k] = this._z[k]
				this._z[k] = this._recurrent_activation.calc(this._z[k])
			}
			this._o[k] = this._z[k].dot(this._w_hy)
			this._o[k].add(this._b_hy)
			if (this._activation) {
				this._v[k] = this._o[k]
				this._o[k] = this._activation.calc(this._o[k])
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
		if (this._activation) {
			this._bo = this._bo.map((bo, i) => {
				if (bo) {
					this._activation.calc(this._v[i])
					return this._activation.grad(bo)
				}
				return bo
			})
		}
		this._bi = Array(s)
		this._bi[s - 1] = this._bo[s - 1].dot(this._w_hy.t)
		if (this._recurrent_activation) {
			this._recurrent_activation.calc(this._u[s - 1])
			this._bi[s - 1] = this._recurrent_activation.grad(this._bi[s - 1])
		}
		for (let i = s - 2; i >= 0; i--) {
			this._bi[i] = this._bi[i + 1].dot(this._w_hh.t)
			if (this._bo[i]) {
				this._bi[i].add(this._bo[i].dot(this._w_hy.t))
			}
			if (this._recurrent_activation) {
				this._recurrent_activation.calc(this._u[i])
				this._bi[i] = this._recurrent_activation.grad(this._bi[i])
			}
		}
		const t = Tensor.fromArray(this._bi.map(b => b.toArray()))
		return t.transpose(1, 0, 2)
	}

	update() {
		this._update_bptt()
	}

	_update_bptt() {
		const s = this._o.length
		const dw_xh = Matrix.zeros(...this._w_xh.sizes)
		const db_xh = Matrix.zeros(1, this._size)
		for (let i = 0; i < s; i++) {
			const dw = this._i[i].tDot(this._bi[i])
			dw.div(this._i[i].rows)
			dw_xh.add(dw)
			db_xh.add(this._bi[i].mean(0))
		}
		dw_xh.div(s)
		db_xh.div(s)
		this._w_xh.sub(this._opt.delta('w_xh', dw_xh))
		this._b_xh.sub(this._opt.delta('b_xh', db_xh))

		const dw_hh = Matrix.zeros(this._size, this._size)
		const db_hh = Matrix.zeros(1, this._size)
		for (let i = 0; i < s - 1; i++) {
			const dw = this._z[i].tDot(this._bi[i + 1])
			dw.div(this._z[i].rows)
			dw_hh.add(dw)
			db_hh.add(this._bi[i + 1].mean(0))
		}
		dw_hh.div(s - 1)
		db_hh.div(s - 1)
		this._w_hh.sub(this._opt.delta('w_hh', dw_hh))
		this._b_hh.sub(this._opt.delta('b_hh', db_hh))

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
		this._w_hy.sub(this._opt.delta('w_hy', dw_hy))
		this._b_hy.sub(this._opt.delta('b_hy', db_hy))
	}
}

RNNLayer.registLayer('rnn')
