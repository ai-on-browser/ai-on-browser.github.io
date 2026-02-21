import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'
import Layer, { NeuralnetworkLayerException } from './base.js'

/**
 * Simple RNN layer
 */
export default class RNNLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} config.size Size of recurrent
	 * @param {string | object} [config.activation] Name of activation or activation layer object
	 * @param {boolean} [config.return_sequences] Return sequences or not
	 * @param {number[][] | Matrix | string} [config.w_x] Weight from input to sequence
	 * @param {number[][] | Matrix | string} [config.w_h] Weight from sequence to sequence
	 * @param {number[][] | Matrix | string} [config.b_x] Bias from input to sequence
	 * @param {number[][] | Matrix | string} [config.b_h] Bias from sequence to sequence
	 * @param {number} [config.sequence_dim] Dimension of the timesteps
	 */
	constructor({
		size,
		activation = 'tanh',
		return_sequences = false,
		w_x = null,
		w_h = null,
		b_x = null,
		b_h = null,
		sequence_dim = 1,
		...rest
	}) {
		super(rest)
		this._size = size

		this._unit = new RNNUnitLayer({ layer: this, size, activation, w_x, w_h, b_x, b_h })

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
		this._i = []
		for (let k = 0; k < x.sizes[0]; k++) {
			this._i[k] = x.index(k).toMatrix()
		}
		this._o = []
		for (let k = 0; k < this._i.length; k++) {
			this._o[k] = this._unit.calc(this._i[k], k)
		}
		if (this._return_sequences) {
			const t = Tensor.fromArray(this._o.map(v => v.toArray()))
			return this._sequence_dim === 1 ? t.transpose(1, 0, 2) : t
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
			type: 'rnn',
			size: this._size,
			return_sequences: this._return_sequences,
			sequence_dim: this._sequence_dim,
			...this._unit.toObject(),
		}
	}
}

class RNNUnitLayer extends Layer {
	constructor({ layer, size, activation = 'sigmoid', w_x = null, w_h = null, b_x = null, b_h = null, ...rest }) {
		super(rest)
		this._size = size
		this._w_x = new Variable(layer, w_x)
		this._w_h = new Variable(layer, w_h, [size, size])
		this._b_x = new Variable(layer, b_x, [1, size])
		this._b_h = new Variable(layer, b_h, [1, size])
		this._z0 = Matrix.zeros(1, size)
		this._i = []
		this._z = []
		this._u = []

		this._bo = []
		this._bh = []

		if (typeof activation === 'string') {
			this._activation = Layer.fromObject({ type: activation })
		} else if (activation) {
			this._activation = Layer.fromObject(activation)
		}
	}

	get dependentLayers() {
		const layers = []
		if (this._w_x.name) {
			layers.push(this._w_x.name)
		}
		if (this._w_h.name) {
			layers.push(this._w_h.name)
		}
		if (this._b_x.name) {
			layers.push(this._b_x.name)
		}
		if (this._b_h.name) {
			layers.push(this._b_h.name)
		}
		if (this._activation) {
			layers.push(...this._activation.dependentLayers)
		}
		return layers
	}

	calc(x, k) {
		if (k === 0) {
			this._z = []
		}

		this._i[k] = x
		this._z[k] = x.dot(this._w_x.get(x.cols, this._size))
		const pre_z = k === 0 ? this._z0 : this._z[k - 1]
		this._z[k].add(pre_z.dot(this._w_h.get()))
		this._z[k].add(this._b_x.get())
		this._z[k].add(this._b_h.get())
		if (this._activation) {
			this._u[k] = this._z[k]
			this._z[k] = this._activation.calc(this._z[k])
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
			this._bh[k].add(this._bh[k + 1].dot(this._w_h.value.t))
		}
		if (this._activation) {
			this._activation.calc(this._u[k])
			this._bh[k] = this._activation.grad(this._bh[k])
		}
		const bi = this._bh[k].dot(this._w_x.value.t)
		if (k === 0) {
			this._diff_bptt()

			const gp = {}
			if (this._w_x.name) {
				gp[this._w_x.name] = this._dw_x
			}
			if (this._w_h.name) {
				gp[this._w_h.name] = this._dw_h
			}
			if (this._b_x.name) {
				gp[this._b_x.name] = this._db_x
			}
			if (this._b_h.name) {
				gp[this._b_h.name] = this._db_h
			}
			if (Object.keys(gp).length > 0) {
				return [bi, gp]
			}
		}
		return bi
	}

	_diff_bptt() {
		const s = this._z.length
		this._dw_x = Matrix.zeros(...this._w_x.sizes)
		this._db_x = Matrix.zeros(1, this._size)
		for (let i = 0; i < s; i++) {
			const dw = this._i[i].tDot(this._bh[i])
			dw.div(this._i[i].rows)
			this._dw_x.add(dw)
			this._db_x.add(this._bh[i].mean(0))
		}
		this._dw_x.div(s)
		this._db_x.div(s)

		this._dw_h = Matrix.zeros(this._size, this._size)
		this._db_h = Matrix.zeros(1, this._size)
		for (let i = 0; i < s - 1; i++) {
			const dw = this._z[i].tDot(this._bh[i + 1])
			dw.div(this._z[i].rows)
			this._dw_h.add(dw)
			this._db_h.add(this._bh[i + 1].mean(0))
		}
		this._dw_h.div(s - 1)
		this._db_h.div(s - 1)
	}

	update(optimizer) {
		this._update_bptt(optimizer)
	}

	_update_bptt(optimizer) {
		if (!this._w_x.name) {
			this._w_x.value.sub(optimizer.delta('w_x', this._dw_x))
		}
		if (!this._b_x.name) {
			this._b_x.value.sub(optimizer.delta('b_x', this._db_x))
		}
		if (!this._w_h.name) {
			this._w_h.value.sub(optimizer.delta('w_h', this._dw_h))
		}
		if (!this._b_h.name) {
			this._b_h.value.sub(optimizer.delta('b_h', this._db_h))
		}
	}

	toObject() {
		return {
			w_x: this._w_x?.toObject(),
			w_h: this._w_h?.toObject(),
			b_x: this._b_x?.toObject(),
			b_h: this._b_h?.toObject(),
			activation: this._activation?.toObject(),
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

RNNLayer.registLayer('rnn')
