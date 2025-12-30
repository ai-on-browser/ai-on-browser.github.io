import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'
import Layer, { NeuralnetworkLayerException } from './base.js'

/**
 * GRU layer
 */
export default class GRULayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} config.size Size of output
	 * @param {boolean} [config.return_sequences] Return sequences or not
	 * @param {number[][] | Matrix | string} [config.w_z] Weight of z from input to sequence
	 * @param {number[][] | Matrix | string} [config.w_r] Weight of r from input to sequence
	 * @param {number[][] | Matrix | string} [config.w_h] Weight of h from input to sequence
	 * @param {number[][] | Matrix | string} [config.u_z] Weight of z from sequence to sequence
	 * @param {number[][] | Matrix | string} [config.u_r] Weight of r from sequence to sequence
	 * @param {number[][] | Matrix | string} [config.u_h] Weight of h from sequence to sequence
	 * @param {number[][] | Matrix | string} [config.b_z] Bias of z of output
	 * @param {number[][] | Matrix | string} [config.b_r] Bias of r of output
	 * @param {number[][] | Matrix | string} [config.b_h] Bias of h of output
	 * @param {number} [config.sequence_dim] Dimension of the timesteps
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
		sequence_dim = 1,
		...rest
	}) {
		super(rest)
		this._size = size
		this._unit = new GRUUnitLayer({ layer: this, size, w_z, w_r, w_h, u_z, u_r, u_h, b_z, b_r, b_h })

		this._return_sequences = return_sequences
		this._sequence_dim = sequence_dim
		if (this._sequence_dim !== 0 && this._sequence_dim !== 1) {
			throw new NeuralnetworkLayerException('Invalid sequence dimension.')
		}
	}

	get dependentLayers() {
		return this._unit.dependentLayers
	}

	calc(x) {
		if (this._sequence_dim === 1) {
			x = x.transpose(1, 0, 2)
		}
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
			return this._sequence_dim === 1 ? t.transpose(1, 0, 2) : t
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
			if (this._sequence_dim === 1) {
				bo = bo.transpose(1, 0, 2)
			}
			for (let i = 0; i < s; i++) {
				this._bo[i] = bo.index(i).toMatrix()
			}
		} else {
			this._bo[s - 1] = bo
		}

		const bi = []
		let gp = null
		for (let t = s - 1; t >= 0; t--) {
			const bit = this._unit.grad(this._bo[t], t)
			if (t === 0 && Array.isArray(bit)) {
				bi[t] = bit[0]
				gp = bit[1]
			} else {
				bi[t] = bit
			}
		}
		let t = Tensor.fromArray(bi.map(b => b.toArray()))
		if (this._sequence_dim === 1) {
			t = t.transpose(1, 0, 2)
		}
		return gp ? [t, gp] : t
	}

	update(optimizer) {
		this._unit.update(optimizer)
	}

	toObject() {
		return {
			type: 'gru',
			size: this._size,
			return_sequences: this._return_sequences,
			sequence_dim: this._sequence_dim,
			...this._unit.toObject(),
		}
	}
}

class GRUUnitLayer extends Layer {
	constructor({
		layer,
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

		this._w_z = new Variable(layer, w_z)
		this._w_r = new Variable(layer, w_r)
		this._w_h = new Variable(layer, w_h)

		this._u_z = new Variable(layer, u_z, [this._size, this._size])
		this._u_r = new Variable(layer, u_r, [this._size, this._size])
		this._u_h = new Variable(layer, u_h, [this._size, this._size])

		this._b_z = new Variable(layer, b_z, [1, this._size])
		this._b_r = new Variable(layer, b_r, [1, this._size])
		this._b_h = new Variable(layer, b_h, [1, this._size])

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

	get dependentLayers() {
		const layers = []
		if (this._w_z.name) {
			layers.push(this._w_z.name)
		}
		if (this._w_r.name) {
			layers.push(this._w_r.name)
		}
		if (this._w_h.name) {
			layers.push(this._w_h.name)
		}
		if (this._u_z.name) {
			layers.push(this._u_z.name)
		}
		if (this._u_r.name) {
			layers.push(this._u_r.name)
		}
		if (this._u_h.name) {
			layers.push(this._u_h.name)
		}
		if (this._b_z.name) {
			layers.push(this._b_z.name)
		}
		if (this._b_r.name) {
			layers.push(this._b_r.name)
		}
		if (this._b_h.name) {
			layers.push(this._b_h.name)
		}
		return layers
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
		if (k === 0) {
			this._s = []
		}
		this._x[k] = x

		const pre_s = k === 0 ? this._s0 : this._s[k - 1]

		const zb = this._x[k].dot(this._w_z.get(x.cols, this._size))
		zb.add(pre_s.dot(this._u_z.get()))
		zb.add(this._b_z.get())
		const z = this._sigmoid(zb)
		this._z[k] = z

		const rb = this._x[k].dot(this._w_r.get(x.cols, this._size))
		rb.add(pre_s.dot(this._u_r.get()))
		rb.add(this._b_r.get())
		const r = this._sigmoid(rb)
		this._r[k] = r

		const hb = this._x[k].dot(this._w_h.get(x.cols, this._size))
		hb.add(Matrix.mult(r, pre_s).dot(this._u_h.get()))
		hb.add(this._b_h.get())
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
			this._dy[t].add(this._dz[t + 1].dot(this._u_z.value.t))
			this._dy[t].add(this._dr[t + 1].dot(this._u_r.value.t))
			this._dy[t].add(Matrix.mult(this._dh[t + 1].dot(this._u_h.value.t), this._r[t + 1]))
			this._dy[t].add(Matrix.mult(this._z[t + 1], this._dy[t + 1]))
		}

		this._dz[t] = Matrix.mult(pre_s, this._dy[t])
		this._dz[t].sub(Matrix.mult(this._h[t], this._dy[t]))
		this._dz[t].mult(this._grad_sigmoid(this._z[t]))

		this._dh[t] = Matrix.sub(1, this._z[t])
		this._dh[t].mult(this._dy[t])
		this._dh[t].mult(this._grad_tanh(this._h[t]))

		this._dr[t] = this._dh[t].dot(this._u_h.value.t)
		this._dr[t].mult(pre_s)
		this._dr[t].mult(this._grad_sigmoid(this._r[t]))

		const bi = this._dh[t].dot(this._w_h.value.t)
		bi.add(this._dz[t].dot(this._w_z.value.t))
		bi.add(this._dr[t].dot(this._w_r.value.t))

		if (t === 0) {
			this._diff_bptt()

			const gp = {}
			if (this._w_r.name) {
				gp[this._w_r.name] = this._dw_r
			}
			if (this._w_z.name) {
				gp[this._w_z.name] = this._dw_z
			}
			if (this._w_h.name) {
				gp[this._w_h.name] = this._dw_h
			}
			if (this._b_r.name) {
				gp[this._b_r.name] = this._db_r
			}
			if (this._b_z.name) {
				gp[this._b_z.name] = this._db_z
			}
			if (this._b_h.name) {
				gp[this._b_h.name] = this._db_h
			}
			if (this._u_r.name) {
				gp[this._u_r.name] = this._du_r
			}
			if (this._u_z.name) {
				gp[this._u_z.name] = this._du_z
			}
			if (this._u_h.name) {
				gp[this._u_h.name] = this._du_h
			}
			if (Object.keys(gp).length > 0) {
				return [bi, gp]
			}
		}

		return bi
	}

	_diff_bptt() {
		const s = this._s.length
		const n = this._x[0].rows

		this._dw_r = Matrix.zeros(...this._w_r.sizes)
		this._dw_z = Matrix.zeros(...this._w_z.sizes)
		this._dw_h = Matrix.zeros(...this._w_h.sizes)
		this._db_r = Matrix.zeros(1, this._size)
		this._db_z = Matrix.zeros(1, this._size)
		this._db_h = Matrix.zeros(1, this._size)
		for (let t = 0; t < s; t++) {
			const dwr = this._x[t].tDot(this._dr[t])
			dwr.div(n)
			this._dw_r.add(dwr)
			const dwz = this._x[t].tDot(this._dz[t])
			dwz.div(n)
			this._dw_z.add(dwz)
			const dwh = this._x[t].tDot(this._dh[t])
			dwh.div(n)
			this._dw_h.add(dwh)
			this._db_r.add(this._dr[t].mean(0))
			this._db_z.add(this._dz[t].mean(0))
			this._db_h.add(this._dh[t].mean(0))
		}

		this._du_r = Matrix.zeros(this._size, this._size)
		this._du_z = Matrix.zeros(this._size, this._size)
		this._du_h = Matrix.zeros(this._size, this._size)
		for (let t = 0; t < s - 1; t++) {
			const dur = this._s[t].tDot(this._dr[t + 1])
			dur.div(n)
			this._du_r.add(dur)
			const duz = this._s[t].tDot(this._dz[t + 1])
			duz.div(n)
			this._du_z.add(duz)
			const duh = this._s[t].tDot(this._dh[t + 1])
			duh.div(n)
			this._du_h.add(duh)
		}
	}

	update(optimizer) {
		this._update_bptt(optimizer)
	}

	_update_bptt(optimizer) {
		if (!this._w_r.name) {
			this._w_r.value.sub(optimizer.delta('w_r', this._dw_r))
		}
		if (!this._w_z.name) {
			this._w_z.value.sub(optimizer.delta('w_z', this._dw_z))
		}
		if (!this._w_h.name) {
			this._w_h.value.sub(optimizer.delta('w_h', this._dw_h))
		}
		if (!this._b_r.name) {
			this._b_r.value.sub(optimizer.delta('b_r', this._db_r))
		}
		if (!this._b_z.name) {
			this._b_z.value.sub(optimizer.delta('b_z', this._db_z))
		}
		if (!this._b_h.name) {
			this._b_h.value.sub(optimizer.delta('b_h', this._db_h))
		}
		if (!this._u_r.name) {
			this._u_r.value.sub(optimizer.delta('u_r', this._du_r))
		}
		if (!this._u_z.name) {
			this._u_z.value.sub(optimizer.delta('u_z', this._du_z))
		}
		if (!this._u_h.name) {
			this._u_h.value.sub(optimizer.delta('u_h', this._du_h))
		}
	}

	toObject() {
		return {
			w_z: this._w_z?.toObject(),
			w_r: this._w_r?.toObject(),
			w_h: this._w_h?.toObject(),
			u_z: this._u_z?.toObject(),
			u_r: this._u_r?.toObject(),
			u_h: this._u_h?.toObject(),
			b_z: this._b_z?.toObject(),
			b_r: this._b_r?.toObject(),
			b_h: this._b_h?.toObject(),
		}
	}
}

class Variable {
	constructor(layer, value, sizes) {
		this._layer = layer
		this._sizes = sizes
		if (typeof value === 'string') {
			this._name = value
		} else if (value) {
			this._value = Matrix.fromArray(value)
		}
	}

	get name() {
		return this._name
	}

	get value() {
		return this._value
	}

	get sizes() {
		return this._value.sizes
	}

	get(...sizes) {
		if (sizes.length === 0) {
			sizes = this._sizes
		}
		if (this._name) {
			return (this._value = this._layer.graph.getNode(this._name).outputValue)
		} else if (this._value) {
			return this._value
		}
		return (this._value = Matrix.randn(...sizes))
	}

	toObject() {
		if (this._name) {
			return this._name
		}
		return this._value?.toArray()
	}
}

GRULayer.registLayer('gru')
