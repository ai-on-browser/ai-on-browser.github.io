import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

/**
 * Fully connected layer
 */
export default class FullyConnected extends Layer {
	/**
	 * @param {object} config object
	 * @param {number | string} config.out_size Size of output
	 * @param {number[][] | Matrix} [config.w] Weight of kernel
	 * @param {number[][] | Matrix} [config.b] Weight of kernel
	 * @param {string} [config.activation] Name of activation
	 * @param {number} [config.l2_decay=0] L2 decay
	 * @param {number} [config.l1_decay=0] L1 decay
	 * @param {object} [config.activation_params] Parameters of activation
	 */
	constructor({
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
		this._out_size = out_size
		this._w = w ? Matrix.fromArray(w) : null
		this._b = b ? Matrix.fromArray(b) : typeof out_size !== 'string' ? Matrix.randn(1, out_size) : null
		this._activation = activation
		if (activation) {
			this._activation_func = Layer.fromObject({ type: activation, ...activation_params })
		}
		this._l2_decay = l2_decay
		this._l1_decay = l1_decay
	}

	calc(x) {
		if (!this._w) {
			const size =
				typeof this._out_size === 'string'
					? this.graph.getNode(this._out_size).lastOutputSize.at(-1)
					: this._out_size
			this._w = Matrix.randn(x.sizes.at(-1), size)
		}
		if (!this._b) {
			const size = this.graph.getNode(this._out_size).lastOutputSize.at(-1)
			this._b = Matrix.randn(1, size)
		}
		this._i = x
		this._o = x.dot(this._w)
		this._o.broadcastOperate(this._b, (a, b) => a + b)
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
