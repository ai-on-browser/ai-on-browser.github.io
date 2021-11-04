import Layer from './base.js'
import { Matrix, Tensor } from '../../util/math.js'

export default class LSTMLayer extends Layer {
	constructor({
		size,
		return_sequences = false,
		w_z = null,
		w_in = null,
		w_for = null,
		w_out = null,
		r_z = null,
		r_in = null,
		r_for = null,
		r_out = null,
		p_in = null,
		p_for = null,
		p_out = null,
		b_z = null,
		b_in = null,
		b_for = null,
		b_out = null,
		...rest
	}) {
		super(rest)
		this._size = size
		this._unit = new LSTMUnitLayer({
			size,
			w_z,
			w_in,
			w_for,
			w_out,
			r_z,
			r_in,
			r_for,
			r_out,
			p_in,
			p_for,
			p_out,
			b_z,
			b_in,
			b_for,
			b_out,
		})

		this._return_sequences = return_sequences
	}

	calc(x) {
		x = x.transpose(1, 0, 2)
		this._x = []
		for (let k = 0; k < x.sizes[0]; k++) {
			this._x[k] = x.at(k).toMatrix()
		}
		this._y = []

		for (let k = 0; k < this._x.length; k++) {
			this._y[k] = this._unit.calc(this._x[k], k)
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

		const bi = []
		for (let t = s - 1; t >= 0; t--) {
			bi[t] = this._unit.grad(this._bo[t], t)
		}
		const t = Tensor.fromArray(bi.map(b => b.toArray()))
		return t.transpose(1, 0, 2)
	}

	update(optimizer) {
		this._unit.update(optimizer)
	}

	toObject() {
		return {
			type: 'lstm',
			size: this._size,
			return_sequences: this._return_sequences,
			...this._unit.toObject(),
		}
	}
}

class LSTMUnitLayer extends Layer {
	constructor({
		size,
		w_z = null,
		w_in = null,
		w_for = null,
		w_out = null,
		r_z = null,
		r_in = null,
		r_for = null,
		r_out = null,
		p_in = null,
		p_for = null,
		p_out = null,
		b_z = null,
		b_in = null,
		b_for = null,
		b_out = null,
		...rest
	}) {
		super(rest)
		this._size = size

		this._w_z = w_z ? Matrix.fromArray(w_z) : null
		this._w_in = w_in ? Matrix.fromArray(w_in) : null
		this._w_for = w_for ? Matrix.fromArray(w_for) : null
		this._w_out = w_out ? Matrix.fromArray(w_out) : null

		this._r_z = r_z ? Matrix.fromArray(r_z) : Matrix.randn(this._size, this._size)
		this._r_in = r_in ? Matrix.fromArray(r_in) : Matrix.randn(this._size, this._size)
		this._r_for = r_for ? Matrix.fromArray(r_for) : Matrix.randn(this._size, this._size)
		this._r_out = r_out ? Matrix.fromArray(r_out) : Matrix.randn(this._size, this._size)

		this._p_in = p_in ? Matrix.fromArray(p_in) : Matrix.zeros(1, this._size)
		this._p_for = p_for ? Matrix.fromArray(p_for) : Matrix.zeros(1, this._size)
		this._p_out = p_out ? Matrix.fromArray(p_out) : Matrix.zeros(1, this._size)

		this._b_z = b_z ? Matrix.fromArray(b_z) : Matrix.zeros(1, this._size)
		this._b_in = b_in ? Matrix.fromArray(b_in) : Matrix.zeros(1, this._size)
		this._b_for = b_for ? Matrix.fromArray(b_for) : Matrix.zeros(1, this._size)
		this._b_out = b_out ? Matrix.fromArray(b_out) : Matrix.zeros(1, this._size)

		this._c0 = Matrix.zeros(1, this._size)
		this._y0 = Matrix.zeros(1, this._size)

		this._x = []
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

		this._bo = []
		this._dy = []
		this._do = []
		this._dc = []
		this._df = []
		this._di = []
		this._dz = []
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

	calc(x, k) {
		if (!this._w_z) {
			this._w_z = Matrix.randn(x.cols, this._size)
		}
		if (!this._w_in) {
			this._w_in = Matrix.randn(x.cols, this._size)
		}
		if (!this._w_for) {
			this._w_for = Matrix.randn(x.cols, this._size)
		}
		if (!this._w_out) {
			this._w_out = Matrix.randn(x.cols, this._size)
		}
		if (k === 0) {
			this._y = []
		}
		this._x[k] = x

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

		return this._y[k]
	}

	grad(bo, k) {
		return this._grad_bptt(bo, k)
	}

	_grad_bptt(bo, t) {
		const s = this._y.length
		this._bo[t] = bo

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

		const bi = this._dz[t].dot(this._w_z.t)
		bi.add(this._di[t].dot(this._w_in.t))
		bi.add(this._df[t].dot(this._w_for.t))
		bi.add(this._do[t].dot(this._w_out.t))

		return bi
	}

	update(optimizer) {
		this._update_bptt(optimizer)
	}

	_update_bptt(optimizer) {
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
		this._w_z.sub(optimizer.delta('w_z', dw_z))
		this._w_in.sub(optimizer.delta('w_i', dw_i))
		this._w_out.sub(optimizer.delta('w_o', dw_o))
		this._w_for.sub(optimizer.delta('w_f', dw_f))
		this._b_z.sub(optimizer.delta('b_z', db_z))
		this._b_in.sub(optimizer.delta('b_i', db_i))
		this._b_out.sub(optimizer.delta('b_o', db_o))
		this._b_for.sub(optimizer.delta('b_f', db_f))
		this._p_out.sub(optimizer.delta('p_o', dp_o))

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
		this._r_z.sub(optimizer.delta('r_z', dr_z))
		this._r_in.sub(optimizer.delta('r_i', dr_i))
		this._r_out.sub(optimizer.delta('r_o', dr_o))
		this._r_for.sub(optimizer.delta('r_f', dr_f))
		this._p_in.sub(optimizer.delta('p_i', dp_i))
		this._p_for.sub(optimizer.delta('p_f', dp_f))
	}

	toObject() {
		return {
			w_z: this._w_z?.toArray(),
			w_in: this._w_in?.toArray(),
			w_for: this._w_for?.toArray(),
			w_out: this._w_out?.toArray(),
			r_z: this._r_z.toArray(),
			r_in: this._r_in.toArray(),
			r_for: this._r_for.toArray(),
			r_out: this._r_out.toArray(),
			p_in: this._p_in.toArray(),
			p_for: this._p_for.toArray(),
			p_out: this._p_out.toArray(),
			b_z: this._b_z.toArray(),
			b_in: this._b_in.toArray(),
			b_for: this._b_for.toArray(),
			b_out: this._b_out.toArray(),
		}
	}
}

LSTMLayer.registLayer('lstm')
