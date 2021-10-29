import Layer from './base.js'
import { Matrix, Tensor } from '../../util/math.js'

export default class LSTMLayer extends Layer {
	constructor({ size, return_sequences = false, ...rest }) {
		super(rest)
		this._size = size

		this._w_z = null
		this._w_in = null
		this._w_for = null
		this._w_out = null

		this._r_z = Matrix.randn(this._size, this._size)
		this._r_in = Matrix.randn(this._size, this._size)
		this._r_for = Matrix.randn(this._size, this._size)
		this._r_out = Matrix.randn(this._size, this._size)

		this._p_in = Matrix.zeros(1, this._size)
		this._p_for = Matrix.zeros(1, this._size)
		this._p_out = Matrix.zeros(1, this._size)

		this._b_z = Matrix.zeros(1, this._size)
		this._b_in = Matrix.zeros(1, this._size)
		this._b_for = Matrix.zeros(1, this._size)
		this._b_out = Matrix.zeros(1, this._size)

		this._c0 = Matrix.zeros(1, this._size)
		this._y0 = Matrix.zeros(1, this._size)

		this._return_sequences = return_sequences
	}

	_sigmoid(x) {
		return x.copyMap(v => 1 / (1 + Math.exp(-v)))
	}

	_grad_sigmoid(x, y) {
		return y.copyMap(v => v * (1 - v))
	}

	_tanh(x) {
		return x.copyMap(Math.tanh)
	}

	_grad_tanh(x) {
		return x.copyMap(v => 1 / Math.cosh(v) ** 2)
	}

	calc(x) {
		x = x.transpose(1, 0, 2)
		this._x = []
		for (let k = 0; k < x.sizes[0]; k++) {
			this._x[k] = x.at(k).toMatrix()
		}
		if (!this._w_z) {
			this._w_z = Matrix.randn(this._x[0].cols, this._size)
			this._w_in = Matrix.randn(this._x[0].cols, this._size)
			this._w_for = Matrix.randn(this._x[0].cols, this._size)
			this._w_out = Matrix.randn(this._x[0].cols, this._size)
		}
		this._c = []
		this._y = []

		this._ob = []
		this._o = []
		this._fb = []
		this._f = []
		this._ib = []
		this._i = []
		this._zb = []
		this._z = []
		for (let k = 0; k < this._x.length; k++) {
			const pre_y = k === 0 ? this._y0 : this._y[k - 1]
			const pre_c = k === 0 ? this._c0 : this._c[k - 1]

			const zb = this._x[k].dot(this._w_z)
			zb.add(pre_y.dot(this._r_z))
			zb.add(this._b_z)
			this._zb[k] = zb
			const z = this._tanh(zb)
			this._z[k] = z

			const ib = this._x[k].dot(this._w_in)
			ib.add(pre_y.dot(this._r_in))
			ib.add(this._p_in.copyMult(pre_c))
			ib.add(this._b_in)
			this._ib[k] = ib
			const i = this._sigmoid(ib)
			this._i[k] = i

			const fb = this._x[k].dot(this._w_for)
			fb.add(pre_y.dot(this._r_for))
			fb.add(this._p_for.copyMult(pre_c))
			fb.add(this._b_for)
			this._fb[k] = fb
			const f = this._sigmoid(fb)
			this._f[k] = f

			this._c[k] = i.copyMult(z)
			this._c[k].add(f.copyMult(pre_c))

			const ob = this._x[k].dot(this._w_out)
			ob.add(pre_y.dot(this._r_out))
			ob.add(this._p_out.copyMult(this._c[k]))
			ob.add(this._b_out)
			this._ob[k] = ob
			const o = this._sigmoid(ob)
			this._o[k] = o

			this._y[k] = this._tanh(this._c[k])
			this._y[k].mult(o)
		}
		if (this._return_sequences) {
			const t = Tensor.fromArray(this._y.map(v => v.toArray()))
			return t.transpose(1, 0, 2)
		}
		return this._y[this._y.length - 1]
	}

	grad(bo) {
		return this._grad_bptt(bo)
	}

	_grad_bptt(bo) {
		const s = this._y.length
		this._bo = Array(s)
		if (this._return_sequences) {
			bo = bo.transpose(1, 0, 2)
			for (let i = 0; i < s; i++) {
				this._bo[i] = bo.at(i).toMatrix()
			}
		} else {
			this._bo[s - 1] = bo
		}

		this._dy = []
		this._do = []
		this._dc = []
		this._df = []
		this._di = []
		this._dz = []

		const bi = []
		for (let t = s - 1; t >= 0; t--) {
			this._dy[t] = this._bo[t] || Matrix.zeros(1, 1)
			if (t < s - 1) {
				this._dy[t].add(this._dz[t + 1].dot(this._r_z.t))
				this._dy[t].add(this._di[t + 1].dot(this._r_in.t))
				this._dy[t].add(this._df[t + 1].dot(this._r_for.t))
				this._dy[t].add(this._do[t + 1].dot(this._r_out.t))
			}

			this._do[t] = this._dy[t].copy()
			this._do[t].mult(this._tanh(this._c[t]))
			this._do[t].mult(this._grad_sigmoid(this._ob[t], this._o[t]))

			this._dc[t] = this._dy[t].copy()
			this._dc[t].mult(this._o[t])
			this._dc[t].mult(this._grad_tanh(this._c[t]))
			this._dc[t].add(this._p_out.copyMult(this._do[t]))
			if (t < s - 1) {
				this._dc[t].add(this._p_in.copyMult(this._di[t + 1]))
				this._dc[t].add(this._p_for.copyMult(this._df[t + 1]))
				this._dc[t].add(this._dc[t + 1].copyMult(this._f[t + 1]))
			}

			this._df[t] = this._dc[t].copy()
			this._df[t].mult(t === 0 ? this._c0 : this._c[t - 1])
			this._df[t].mult(this._grad_sigmoid(this._fb[t], this._f[t]))

			this._di[t] = this._dc[t].copy()
			this._di[t].mult(this._z[t])
			this._di[t].mult(this._grad_sigmoid(this._ib[t], this._i[t]))

			this._dz[t] = this._dc[t].copy()
			this._dz[t].mult(this._i[t])
			this._dz[t].mult(this._grad_tanh(this._zb[t]))

			bi[t] = this._dz[t].dot(this._w_z.t)
			bi[t].add(this._di[t].dot(this._w_in.t))
			bi[t].add(this._df[t].dot(this._w_for.t))
			bi[t].add(this._do[t].dot(this._w_out.t))
		}
		const t = Tensor.fromArray(bi.map(b => b.toArray()))
		return t.transpose(1, 0, 2)
	}

	update() {
		this._update_bptt()
	}

	_update_bptt() {
		const s = this._y.length
		const n = this._x[0].rows

		const dw_z = Matrix.zeros(...this._w_z.sizes)
		const dw_i = Matrix.zeros(...this._w_in.sizes)
		const dw_o = Matrix.zeros(...this._w_out.sizes)
		const dw_f = Matrix.zeros(...this._w_for.sizes)
		const db_z = Matrix.zeros(1, this._size)
		const db_i = Matrix.zeros(1, this._size)
		const db_o = Matrix.zeros(1, this._size)
		const db_f = Matrix.zeros(1, this._size)
		const dp_o = Matrix.zeros(1, this._size)
		for (let t = 0; t < s; t++) {
			const dwz = this._x[t].tDot(this._dz[t])
			dwz.div(n)
			dw_z.add(dwz)
			const dwi = this._x[t].tDot(this._di[t])
			dwi.div(n)
			dw_i.add(dwi)
			const dwo = this._x[t].tDot(this._do[t])
			dwo.div(n)
			dw_o.add(dwo)
			const dwf = this._x[t].tDot(this._df[t])
			dwf.div(n)
			dw_f.add(dwf)
			db_z.add(this._dz[t].mean(0))
			db_i.add(this._di[t].mean(0))
			db_o.add(this._do[t].mean(0))
			db_f.add(this._df[t].mean(0))
			const dpo = this._dc[t].copyMult(this._do[t])
			dp_o.add(dpo.mean(0))
		}
		this._w_z.sub(this._opt.delta('w_z', dw_z))
		this._w_in.sub(this._opt.delta('w_i', dw_i))
		this._w_out.sub(this._opt.delta('w_o', dw_o))
		this._w_for.sub(this._opt.delta('w_f', dw_f))
		this._b_z.sub(this._opt.delta('b_z', db_z))
		this._b_in.sub(this._opt.delta('b_i', db_i))
		this._b_out.sub(this._opt.delta('b_o', db_o))
		this._b_for.sub(this._opt.delta('b_f', db_f))
		this._p_out.sub(this._opt.delta('p_o', dp_o))

		const dr_z = Matrix.zeros(this._size, this._size)
		const dr_i = Matrix.zeros(this._size, this._size)
		const dr_o = Matrix.zeros(this._size, this._size)
		const dr_f = Matrix.zeros(this._size, this._size)
		const dp_i = Matrix.zeros(1, this._size)
		const dp_f = Matrix.zeros(1, this._size)
		for (let t = 0; t < s - 1; t++) {
			const drz = this._y[t].tDot(this._dz[t + 1])
			drz.div(n)
			dr_z.add(drz)
			const dri = this._y[t].tDot(this._di[t + 1])
			dri.div(n)
			dr_i.add(dri)
			const dro = this._y[t].tDot(this._do[t + 1])
			dro.div(n)
			dr_o.add(dro)
			const drf = this._y[t].tDot(this._df[t + 1])
			drf.div(n)
			dr_f.add(drf)
			const dpi = this._dc[t].copyMult(this._di[t + 1])
			dp_i.add(dpi.mean(0))
			const dpf = this._dc[t].copyMult(this._df[t + 1])
			dp_f.add(dpf.mean(0))
		}
		this._r_z.sub(this._opt.delta('r_z', dr_z))
		this._r_in.sub(this._opt.delta('r_i', dr_i))
		this._r_out.sub(this._opt.delta('r_o', dr_o))
		this._r_for.sub(this._opt.delta('r_f', dr_f))
		this._p_in.sub(this._opt.delta('p_i', dp_i))
		this._p_for.sub(this._opt.delta('p_f', dp_f))
	}
}

LSTMLayer.registLayer('lstm')
