import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'
import Layer, { NeuralnetworkLayerException } from './base.js'

/**
 * LSTM layer
 */
export default class LSTMLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} config.size Size of output
	 * @param {boolean} [config.return_sequences] Return sequences or not
	 * @param {number[][] | Matrix | string} [config.w_z] Weight of z from input to sequence
	 * @param {number[][] | Matrix | string} [config.w_in] Weight of 'in' from input to sequence
	 * @param {number[][] | Matrix | string} [config.w_for] Weight of 'for' from input to sequence
	 * @param {number[][] | Matrix | string} [config.w_out] Weight of 'out' from input to sequence
	 * @param {number[][] | Matrix | string} [config.r_z] Weight of z from sequence to sequence
	 * @param {number[][] | Matrix | string} [config.r_in] Weight of 'in' from sequence to sequence
	 * @param {number[][] | Matrix | string} [config.r_for] Weight of 'for' from sequence to sequence
	 * @param {number[][] | Matrix | string} [config.r_out] Weight of 'out' from sequence to sequence
	 * @param {number[][] | Matrix | string} [config.p_in] p_in
	 * @param {number[][] | Matrix | string} [config.p_for] p_for
	 * @param {number[][] | Matrix | string} [config.p_out] p_out
	 * @param {number[][] | Matrix | string} [config.b_z] Bias of z of output
	 * @param {number[][] | Matrix | string} [config.b_in] Bias of 'in' of output
	 * @param {number[][] | Matrix | string} [config.b_for] Bias of 'for' of output
	 * @param {number[][] | Matrix | string} [config.b_out] Bias of 'out' of output
	 * @param {number} [config.sequence_dim] Dimension of the timesteps
	 */
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
		sequence_dim = 1,
		...rest
	}) {
		super(rest)
		this._size = size
		this._unit = new LSTMUnitLayer({
			layer: this,
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
		this._y = []

		for (let k = 0; k < this._x.length; k++) {
			this._y[k] = this._unit.calc(this._x[k], k)
		}
		if (this._return_sequences) {
			const t = Tensor.fromArray(this._y.map(v => v.toArray()))
			return this._sequence_dim === 1 ? t.transpose(1, 0, 2) : t
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
			type: 'lstm',
			size: this._size,
			return_sequences: this._return_sequences,
			sequence_dim: this._sequence_dim,
			...this._unit.toObject(),
		}
	}
}

class LSTMUnitLayer extends Layer {
	constructor({
		layer,
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

		this._w_z = new Variable(layer, w_z)
		this._w_in = new Variable(layer, w_in)
		this._w_for = new Variable(layer, w_for)
		this._w_out = new Variable(layer, w_out)

		this._r_z = new Variable(layer, r_z, [this._size, this._size])
		this._r_in = new Variable(layer, r_in, [this._size, this._size])
		this._r_for = new Variable(layer, r_for, [this._size, this._size])
		this._r_out = new Variable(layer, r_out, [this._size, this._size])

		this._p_in = new Variable(layer, p_in, [1, this._size])
		this._p_for = new Variable(layer, p_for, [1, this._size])
		this._p_out = new Variable(layer, p_out, [1, this._size])

		this._b_z = new Variable(layer, b_z, [1, this._size])
		this._b_in = new Variable(layer, b_in, [1, this._size])
		this._b_for = new Variable(layer, b_for, [1, this._size])
		this._b_out = new Variable(layer, b_out, [1, this._size])

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

	get dependentLayers() {
		const layers = []
		if (this._w_z.name) {
			layers.push(this._w_z.name)
		}
		if (this._w_in.name) {
			layers.push(this._w_in.name)
		}
		if (this._w_for.name) {
			layers.push(this._w_for.name)
		}
		if (this._w_out.name) {
			layers.push(this._w_out.name)
		}
		if (this._r_z.name) {
			layers.push(this._r_z.name)
		}
		if (this._r_in.name) {
			layers.push(this._r_in.name)
		}
		if (this._r_for.name) {
			layers.push(this._r_for.name)
		}
		if (this._r_out.name) {
			layers.push(this._r_out.name)
		}
		if (this._p_in.name) {
			layers.push(this._p_in.name)
		}
		if (this._p_for.name) {
			layers.push(this._p_for.name)
		}
		if (this._p_out.name) {
			layers.push(this._p_out.name)
		}
		if (this._b_z.name) {
			layers.push(this._b_z.name)
		}
		if (this._b_in.name) {
			layers.push(this._b_in.name)
		}
		if (this._b_for.name) {
			layers.push(this._b_for.name)
		}
		if (this._b_out.name) {
			layers.push(this._b_out.name)
		}
		return layers
	}

	_sigmoid(x) {
		return Matrix.map(x, v => 1 / (1 + Math.exp(-v)))
	}

	_grad_sigmoid(x, y) {
		return Matrix.map(y, v => v * (1 - v))
	}

	_tanh(x) {
		return Matrix.map(x, Math.tanh)
	}

	_grad_tanh(x) {
		return Matrix.map(x, v => 1 / Math.cosh(v) ** 2)
	}

	calc(x, k) {
		if (k === 0) {
			this._y = []
		}
		this._x[k] = x

		const pre_y = k === 0 ? this._y0 : this._y[k - 1]
		const pre_c = k === 0 ? this._c0 : this._c[k - 1]

		const zb = this._x[k].dot(this._w_z.get(x.cols, this._size))
		zb.add(pre_y.dot(this._r_z.get()))
		zb.add(this._b_z.get())
		this._zb[k] = zb
		const z = this._tanh(zb)
		this._z[k] = z

		const ib = this._x[k].dot(this._w_in.get(x.cols, this._size))
		ib.add(pre_y.dot(this._r_in.get()))
		ib.add(Matrix.mult(this._p_in.get(), pre_c))
		ib.add(this._b_in.get())
		this._ib[k] = ib
		const i = this._sigmoid(ib)
		this._i[k] = i

		const fb = this._x[k].dot(this._w_for.get(x.cols, this._size))
		fb.add(pre_y.dot(this._r_for.get()))
		fb.add(Matrix.mult(this._p_for.get(), pre_c))
		fb.add(this._b_for.get())
		this._fb[k] = fb
		const f = this._sigmoid(fb)
		this._f[k] = f

		this._c[k] = Matrix.mult(i, z)
		this._c[k].add(Matrix.mult(f, pre_c))

		const ob = this._x[k].dot(this._w_out.get(x.cols, this._size))
		ob.add(pre_y.dot(this._r_out.get()))
		ob.add(Matrix.mult(this._p_out.get(), this._c[k]))
		ob.add(this._b_out.get())
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
			this._dy[t].add(this._dz[t + 1].dot(this._r_z.value.t))
			this._dy[t].add(this._di[t + 1].dot(this._r_in.value.t))
			this._dy[t].add(this._df[t + 1].dot(this._r_for.value.t))
			this._dy[t].add(this._do[t + 1].dot(this._r_out.value.t))
		}

		this._do[t] = this._dy[t].copy()
		this._do[t].mult(this._tanh(this._c[t]))
		this._do[t].mult(this._grad_sigmoid(this._ob[t], this._o[t]))

		this._dc[t] = this._dy[t].copy()
		this._dc[t].mult(this._o[t])
		this._dc[t].mult(this._grad_tanh(this._c[t]))
		this._dc[t].add(Matrix.mult(this._p_out.value, this._do[t]))
		if (t < s - 1) {
			this._dc[t].add(Matrix.mult(this._p_in.value, this._di[t + 1]))
			this._dc[t].add(Matrix.mult(this._p_for.value, this._df[t + 1]))
			this._dc[t].add(Matrix.mult(this._dc[t + 1], this._f[t + 1]))
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

		const bi = this._dz[t].dot(this._w_z.value.t)
		bi.add(this._di[t].dot(this._w_in.value.t))
		bi.add(this._df[t].dot(this._w_for.value.t))
		bi.add(this._do[t].dot(this._w_out.value.t))

		if (t === 0) {
			this._diff_bptt()

			const gp = {}
			if (this._w_z.name) {
				gp[this._w_z.name] = this._dw_z
			}
			if (this._w_in.name) {
				gp[this._w_in.name] = this._dw_in
			}
			if (this._w_for.name) {
				gp[this._w_for.name] = this._dw_for
			}
			if (this._w_out.name) {
				gp[this._w_out.name] = this._dw_out
			}
			if (this._r_z.name) {
				gp[this._r_z.name] = this._dr_z
			}
			if (this._r_in.name) {
				gp[this._r_in.name] = this._dr_in
			}
			if (this._r_for.name) {
				gp[this._r_for.name] = this._dr_for
			}
			if (this._r_out.name) {
				gp[this._r_out.name] = this._dr_out
			}
			if (this._p_in.name) {
				gp[this._p_in.name] = this._dp_in
			}
			if (this._p_for.name) {
				gp[this._p_for.name] = this._dp_for
			}
			if (this._p_out.name) {
				gp[this._p_out.name] = this._dp_out
			}
			if (this._b_z.name) {
				gp[this._b_z.name] = this._db_z
			}
			if (this._b_in.name) {
				gp[this._b_in.name] = this._db_in
			}
			if (this._b_for.name) {
				gp[this._b_for.name] = this._db_for
			}
			if (this._b_out.name) {
				gp[this._b_out.name] = this._db_out
			}
			if (Object.keys(gp).length > 0) {
				return [bi, gp]
			}
		}

		return bi
	}

	_diff_bptt() {
		const s = this._y.length
		const n = this._x[0].rows

		this._dw_z = Matrix.zeros(...this._w_z.sizes)
		this._dw_in = Matrix.zeros(...this._w_in.sizes)
		this._dw_out = Matrix.zeros(...this._w_out.sizes)
		this._dw_for = Matrix.zeros(...this._w_for.sizes)
		this._db_z = Matrix.zeros(1, this._size)
		this._db_in = Matrix.zeros(1, this._size)
		this._db_out = Matrix.zeros(1, this._size)
		this._db_for = Matrix.zeros(1, this._size)
		this._dp_out = Matrix.zeros(1, this._size)
		for (let t = 0; t < s; t++) {
			const dwz = this._x[t].tDot(this._dz[t])
			dwz.div(n)
			this._dw_z.add(dwz)
			const dwi = this._x[t].tDot(this._di[t])
			dwi.div(n)
			this._dw_in.add(dwi)
			const dwo = this._x[t].tDot(this._do[t])
			dwo.div(n)
			this._dw_out.add(dwo)
			const dwf = this._x[t].tDot(this._df[t])
			dwf.div(n)
			this._dw_for.add(dwf)
			this._db_z.add(this._dz[t].mean(0))
			this._db_in.add(this._di[t].mean(0))
			this._db_out.add(this._do[t].mean(0))
			this._db_for.add(this._df[t].mean(0))
			const dpo = Matrix.mult(this._dc[t], this._do[t])
			this._dp_out.add(dpo.mean(0))
		}

		this._dr_z = Matrix.zeros(this._size, this._size)
		this._dr_in = Matrix.zeros(this._size, this._size)
		this._dr_out = Matrix.zeros(this._size, this._size)
		this._dr_for = Matrix.zeros(this._size, this._size)
		this._dp_in = Matrix.zeros(1, this._size)
		this._dp_for = Matrix.zeros(1, this._size)
		for (let t = 0; t < s - 1; t++) {
			const drz = this._y[t].tDot(this._dz[t + 1])
			drz.div(n)
			this._dr_z.add(drz)
			const dri = this._y[t].tDot(this._di[t + 1])
			dri.div(n)
			this._dr_in.add(dri)
			const dro = this._y[t].tDot(this._do[t + 1])
			dro.div(n)
			this._dr_out.add(dro)
			const drf = this._y[t].tDot(this._df[t + 1])
			drf.div(n)
			this._dr_for.add(drf)
			const dpi = Matrix.mult(this._dc[t], this._di[t + 1])
			this._dp_in.add(dpi.mean(0))
			const dpf = Matrix.mult(this._dc[t], this._df[t + 1])
			this._dp_for.add(dpf.mean(0))
		}
	}

	update(optimizer) {
		if (!this._w_z.name) {
			this._w_z.value.sub(optimizer.delta('w_z', this._dw_z))
		}
		if (!this._w_in.name) {
			this._w_in.value.sub(optimizer.delta('w_i', this._dw_in))
		}
		if (!this._w_out.name) {
			this._w_out.value.sub(optimizer.delta('w_o', this._dw_out))
		}
		if (!this._w_for.name) {
			this._w_for.value.sub(optimizer.delta('w_f', this._dw_for))
		}
		if (!this._r_z.name) {
			this._r_z.value.sub(optimizer.delta('r_z', this._dr_z))
		}
		if (!this._r_in.name) {
			this._r_in.value.sub(optimizer.delta('r_i', this._dr_in))
		}
		if (!this._r_out.name) {
			this._r_out.value.sub(optimizer.delta('r_o', this._dr_out))
		}
		if (!this._r_for.name) {
			this._r_for.value.sub(optimizer.delta('r_f', this._dr_for))
		}
		if (!this._p_out.name) {
			this._p_out.value.sub(optimizer.delta('p_o', this._dp_out))
		}
		if (!this._p_in.name) {
			this._p_in.value.sub(optimizer.delta('p_i', this._dp_in))
		}
		if (!this._p_for.name) {
			this._p_for.value.sub(optimizer.delta('p_f', this._dp_for))
		}
		if (!this._b_z.name) {
			this._b_z.value.sub(optimizer.delta('b_z', this._db_z))
		}
		if (!this._b_in.name) {
			this._b_in.value.sub(optimizer.delta('b_i', this._db_in))
		}
		if (!this._b_out.name) {
			this._b_out.value.sub(optimizer.delta('b_o', this._db_out))
		}
		if (!this._b_for.name) {
			this._b_for.value.sub(optimizer.delta('b_f', this._db_for))
		}
	}

	toObject() {
		return {
			w_z: this._w_z?.toObject(),
			w_in: this._w_in?.toObject(),
			w_for: this._w_for?.toObject(),
			w_out: this._w_out?.toObject(),
			r_z: this._r_z?.toObject(),
			r_in: this._r_in?.toObject(),
			r_for: this._r_for?.toObject(),
			r_out: this._r_out?.toObject(),
			p_in: this._p_in?.toObject(),
			p_for: this._p_for?.toObject(),
			p_out: this._p_out?.toObject(),
			b_z: this._b_z?.toObject(),
			b_in: this._b_in?.toObject(),
			b_for: this._b_for?.toObject(),
			b_out: this._b_out?.toObject(),
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
			this._value = this._layer.graph.getNode(this._name).outputValue
		} else if (!this._value) {
			this._value = Matrix.randn(...sizes)
		}
		return this._value
	}

	toObject() {
		if (this._name) {
			return this._name
		}
		return this._value?.toArray()
	}
}

LSTMLayer.registLayer('lstm')
