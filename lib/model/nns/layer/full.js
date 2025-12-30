import Matrix from '../../../util/matrix.js'
import Layer from './base.js'

/**
 * Fully connected layer
 */
export default class FullyConnected extends Layer {
	/**
	 * @param {object} config object
	 * @param {number | string} config.out_size Size of output
	 * @param {number[][] | Matrix | string} [config.w] Weight of kernel
	 * @param {number[][] | Matrix | string} [config.b] Weight of kernel
	 * @param {string | object} [config.activation] Name of activation or activation layer object
	 * @param {number} [config.l2_decay] L2 decay
	 * @param {number} [config.l1_decay] L1 decay
	 */
	constructor({ out_size, w = null, b = null, activation = null, l2_decay = 0, l1_decay = 0, ...rest }) {
		super(rest)
		this._out_size = out_size
		this._w = null
		if (typeof w === 'string') {
			this._wname = w
		} else if (w) {
			this._w = Matrix.fromArray(w)
		}
		this._b = null
		if (typeof b === 'string') {
			this._bname = b
		} else if (b) {
			this._b = Matrix.fromArray(b)
		}
		if (typeof activation === 'string') {
			this._activation = Layer.fromObject({ type: activation })
		} else if (activation) {
			this._activation = Layer.fromObject(activation)
		}
		this._l2_decay = l2_decay
		this._l1_decay = l1_decay
	}

	get dependentLayers() {
		const layers = []
		if (this._wname) {
			layers.push(this._wname)
		}
		if (this._bname) {
			layers.push(this._bname)
		}
		if (this._activation) {
			layers.push(...this._activation.dependentLayers)
		}
		return layers
	}

	calc(x) {
		if (this._wname) {
			this._w = this.graph.getNode(this._wname).outputValue
			if (!this._out_size) {
				this._out_size = this._w.sizes.at(-1)
			}
		}
		if (this._bname) {
			this._b = this.graph.getNode(this._bname).outputValue
		}
		if (!this._w || !this._b) {
			const size =
				typeof this._out_size === 'string'
					? this.graph.getNode(this._out_size).outputValue.value.at(-1)
					: this._out_size
			if (!this._w) {
				this._w = Matrix.randn(x.sizes.at(-1), size)
			}
			if (!this._b) {
				this._b = Matrix.zeros(1, size)
			}
		}
		this._i = x
		this._o = x.dot(this._w)
		this._o.broadcastOperate(this._b, (a, b) => a + b)
		if (this._activation) {
			return this._activation.calc(this._o)
		}
		return this._o
	}

	grad(bo) {
		if (this._activation) {
			bo = this._activation.grad(bo)
		}

		let i = this._i
		if (this._i.dimension !== 2) {
			i = this._i.copy()
			i.reshape(-1, this._w.rows)
			i = i.toMatrix()
		} else if (!(this._i instanceof Matrix)) {
			i = i.toMatrix()
		}
		let b = bo
		if (b.dimension !== 2) {
			b = bo.copy()
			b.reshape(-1, this._w.cols)
			b = b.toMatrix()
		} else if (!(b instanceof Matrix)) {
			b = b.toMatrix()
		}
		const n = this._i.sizes[0]
		this._dw = i.tDot(b)
		this._dw.div(n)
		if (this._l2_decay > 0 || this._l1_decay > 0) {
			for (let i = 0; i < this._dw.rows; i++) {
				for (let j = 0; j < this._dw.cols; j++) {
					const v = this._w.at(i, j)
					this._dw.addAt(i, j, v * this._l2_decay + Math.sign(v) * this._l1_decay)
				}
			}
		}
		this._db = b.sum(0)
		this._db.div(n)

		this._bi = bo.dot(this._w.t)
		if (this._wname || this._bname) {
			const gp = {}
			if (this._wname) {
				gp[this._wname] = this._dw
			}
			if (this._bname) {
				gp[this._bname] = this._db
			}
			return [this._bi, gp]
		}
		return this._bi
	}

	update(optimizer) {
		if (!this._wname) {
			this._w.sub(optimizer.delta('w', this._dw))
		}
		if (!this._bname) {
			this._b.sub(optimizer.delta('b', this._db))
		}
	}

	toObject() {
		return {
			type: 'full',
			out_size: this._out_size,
			w: this._wname || this._w?.toArray(),
			b: this._bname || this._b?.toArray(),
			activation: this._activation?.toObject(),
			l2_decay: this._l2_decay,
			l1_decay: this._l1_decay,
		}
	}
}

FullyConnected.registLayer('full')
