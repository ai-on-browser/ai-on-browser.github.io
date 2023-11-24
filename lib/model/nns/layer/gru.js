import Layer from './base.js'
import Tensor from '../../../util/tensor.js'
import Matrix from '../../../util/matrix.js'

/**
 * GRU layer
 */
export default class GRULayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} config.size Size of output
	 * @param {boolean} [config.return_sequences=false] Return sequences or not
	 * @param {number[][] | Matrix} [config.w_z] Weight of z from input to sequence
	 * @param {number[][] | Matrix} [config.w_r] Weight of r from input to sequence
	 * @param {number[][] | Matrix} [config.w_h] Weight of h from input to sequence
	 * @param {number[][] | Matrix} [config.u_z] Weight of z from sequence to sequence
	 * @param {number[][] | Matrix} [config.u_r] Weight of r from sequence to sequence
	 * @param {number[][] | Matrix} [config.u_h] Weight of h from sequence to sequence
	 * @param {number[][] | Matrix} [config.b_z] Bias of z of output
	 * @param {number[][] | Matrix} [config.b_r] Bias of r of output
	 * @param {number[][] | Matrix} [config.b_h] Bias of h of output
	 */
	constructor({
		size,
		return_sequences = false,
		w_z = null,
		w_r = null,
		w_h = null,
		u_z = null,
		u_r = null,
		u_h = null,
		b_z = null,
		b_r = null,
		b_h = null,
		...rest
	}) {
		super(rest)
		this._size = size
		this._unit = new GRUUnitLayer({ size, w_z, w_r, w_h, u_z, u_r, u_h, b_z, b_r, b_h })

		this._return_sequences = return_sequences
	}

	calc(x) {
		x = x.transpose(1, 0, 2)
		this._x = []
		for (let k = 0; k < x.sizes[0]; k++) {
			this._x[k] = x.index(k).toMatrix()
		}

		const s = []
		for (let k = 0; k < this._x.length; k++) {
			s[k] = this._unit.calc(this._x[k], k)
		}
		if (this._return_sequences) {
			const t = Tensor.fromArray(s.map(v => v.toArray()))
			return t.transpose(1, 0, 2)
		}
		return s[s.length - 1]
	}

	grad(bo) {
		return this._grad_bptt(bo)
	}

	_grad_bptt(bo) {
		const s = this._x.length
		this._bo = Array(s)
		if (this._return_sequences) {
			bo = bo.transpose(1, 0, 2)
			for (let i = 0; i < s; i++) {
				this._bo[i] = bo.index(i).toMatrix()
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
			type: 'gru',
			size: this._size,
			return_sequences: this._return_sequences,
			...this._unit.toObject(),
		}
	}
}

class GRUUnitLayer extends Layer {
	constructor({
		size,
		w_z = null,
		w_r = null,
		w_h = null,
		u_z = null,
		u_r = null,
		u_h = null,
		b_z = null,
		b_r = null,
		b_h = null,
		...rest
	}) {
		super(rest)
		this._size = size

		this._w_z = w_z ? Matrix.fromArray(w_z) : null
		this._w_r = w_r ? Matrix.fromArray(w_r) : null
		this._w_h = w_h ? Matrix.fromArray(w_h) : null

		this._u_z = u_z ? Matrix.fromArray(u_z) : Matrix.randn(this._size, this._size)
		this._u_r = u_r ? Matrix.fromArray(u_r) : Matrix.randn(this._size, this._size)
		this._u_h = u_h ? Matrix.fromArray(u_h) : Matrix.randn(this._size, this._size)

		this._b_z = b_z ? Matrix.fromArray(b_z) : Matrix.zeros(1, this._size)
		this._b_r = b_r ? Matrix.fromArray(b_r) : Matrix.zeros(1, this._size)
		this._b_h = b_h ? Matrix.fromArray(b_h) : Matrix.zeros(1, this._size)

		this._s0 = Matrix.zeros(1, this._size)

		this._x = []
		this._h = []
		this._s = []
		this._z = []
		this._r = []

		this._bo = []
		this._dy = []
		this._dr = []
		this._dz = []
		this._dh = []
	}

	_sigmoid(x) {
		return Matrix.map(x, v => 1 / (1 + Math.exp(-v)))
	}

	_grad_sigmoid(y) {
		return Matrix.map(y, v => v * (1 - v))
	}

	_tanh(x) {
		return Matrix.map(x, Math.tanh)
	}

	_grad_tanh(y) {
		return Matrix.map(y, v => 1 - v ** 2)
	}

	calc(x, k) {
		if (!this._w_z) {
			this._w_z = Matrix.randn(x.cols, this._size)
		}
		if (!this._w_r) {
			this._w_r = Matrix.randn(x.cols, this._size)
		}
		if (!this._w_h) {
			this._w_h = Matrix.randn(x.cols, this._size)
		}
		if (k === 0) {
			this._s = []
		}
		this._x[k] = x

		const pre_s = k === 0 ? this._s0 : this._s[k - 1]

		const zb = this._x[k].dot(this._w_z)
		zb.add(pre_s.dot(this._u_z))
		zb.add(this._b_h)
		const z = this._sigmoid(zb)
		this._z[k] = z

		const rb = this._x[k].dot(this._w_r)
		rb.add(pre_s.dot(this._u_r))
		rb.add(this._b_r)
		const r = this._sigmoid(rb)
		this._r[k] = r

		const hb = this._x[k].dot(this._w_h)
		hb.add(Matrix.mult(r, pre_s).dot(this._u_h))
		hb.add(this._b_h)
		const h = this._tanh(hb)
		this._h[k] = h

		this._s[k] = Matrix.sub(1, z)
		this._s[k].mult(h)
		this._s[k].add(Matrix.mult(z, pre_s))

		return this._s[k]
	}

	grad(bo, t) {
		return this._grad_bptt(bo, t)
	}

	_grad_bptt(bo, t) {
		const s = this._s.length
		this._bo[t] = bo

		const pre_s = t === 0 ? this._s0 : this._s[t - 1]
		this._dy[t] = this._bo[t] || Matrix.zeros(1, 1)
		if (t < s - 1) {
			this._dy[t].add(this._dz[t + 1].dot(this._u_z.t))
			this._dy[t].add(this._dr[t + 1].dot(this._u_r.t))
			this._dy[t].add(Matrix.mult(this._dh[t + 1].dot(this._u_h.t), this._r[t + 1]))
			this._dy[t].add(Matrix.mult(this._z[t + 1], this._dy[t + 1]))
		}

		this._dz[t] = Matrix.mult(pre_s, this._dy[t])
		this._dz[t].sub(Matrix.mult(this._h[t], this._dy[t]))
		this._dz[t].mult(this._grad_sigmoid(this._z[t]))

		this._dh[t] = Matrix.sub(1, this._z[t])
		this._dh[t].mult(this._dy[t])
		this._dh[t].mult(this._grad_tanh(this._h[t]))

		this._dr[t] = this._dh[t].dot(this._u_h.t)
		this._dr[t].mult(pre_s)
		this._dr[t].mult(this._grad_sigmoid(this._r[t]))

		const bi = this._dh[t].dot(this._w_h.t)
		bi.add(this._dz[t].dot(this._w_z.t))
		bi.add(this._dr[t].dot(this._w_r.t))

		return bi
	}

	update(optimizer) {
		this._update_bptt(optimizer)
	}

	_update_bptt(optimizer) {
		const s = this._s.length
		const n = this._x[0].rows

		const dw_r = Matrix.zeros(...this._w_r.sizes)
		const dw_z = Matrix.zeros(...this._w_z.sizes)
		const dw_h = Matrix.zeros(...this._w_h.sizes)
		const db_r = Matrix.zeros(1, this._size)
		const db_z = Matrix.zeros(1, this._size)
		const db_h = Matrix.zeros(1, this._size)
		for (let t = 0; t < s; t++) {
			const dwr = this._x[t].tDot(this._dr[t])
			dwr.div(n)
			dw_r.add(dwr)
			const dwz = this._x[t].tDot(this._dz[t])
			dwz.div(n)
			dw_z.add(dwz)
			const dwh = this._x[t].tDot(this._dh[t])
			dwh.div(n)
			dw_h.add(dwh)
			db_r.add(this._dr[t].mean(0))
			db_z.add(this._dz[t].mean(0))
			db_h.add(this._dh[t].mean(0))
		}
		this._w_r.sub(optimizer.delta('w_r', dw_r))
		this._w_z.sub(optimizer.delta('w_z', dw_z))
		this._w_h.sub(optimizer.delta('w_h', dw_h))
		this._b_r.sub(optimizer.delta('b_r', db_r))
		this._b_z.sub(optimizer.delta('b_z', db_z))
		this._b_h.sub(optimizer.delta('b_h', db_h))

		const du_r = Matrix.zeros(this._size, this._size)
		const du_z = Matrix.zeros(this._size, this._size)
		const du_h = Matrix.zeros(this._size, this._size)
		for (let t = 0; t < s - 1; t++) {
			const dur = this._s[t].tDot(this._dr[t + 1])
			dur.div(n)
			du_r.add(dur)
			const duz = this._s[t].tDot(this._dz[t + 1])
			duz.div(n)
			du_z.add(duz)
			const duh = this._s[t].tDot(this._dh[t + 1])
			duh.div(n)
			du_h.add(duh)
		}
		this._u_r.sub(optimizer.delta('u_r', du_r))
		this._u_z.sub(optimizer.delta('u_z', du_z))
		this._u_h.sub(optimizer.delta('u_h', du_h))
	}

	toObject() {
		return {
			w_z: this._w_z?.toArray(),
			w_r: this._w_r?.toArray(),
			w_h: this._w_h?.toArray(),
			u_z: this._u_z.toArray(),
			u_r: this._u_r.toArray(),
			u_h: this._u_h.toArray(),
			b_z: this._b_z.toArray(),
			b_r: this._b_r.toArray(),
			b_h: this._b_h.toArray(),
		}
	}
}

GRULayer.registLayer('gru')
