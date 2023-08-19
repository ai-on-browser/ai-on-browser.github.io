import Tensor from '../../../util/tensor.js'
import Layer, { NeuralnetworkLayerException } from './base.js'

/**
 * Batch normalization layer
 */
export default class BatchNormalizationLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number | number[] | string} [config.scale=1] Scale
	 * @param {number | number[] | string} [config.offset=0] Offset
	 * @param {number} [config.epsilon=1.0e-12] Epsilon
	 * @param {number} [config.channel_dim=-1] Dimension of the channel
	 * @param {number[] | string} [config.input_mean] Input mean
	 * @param {number[] | string} [config.input_var] Input variance
	 */
	constructor({ scale = 1, offset = 0, epsilon = 1.0e-12, channel_dim = -1, input_mean, input_var, ...rest }) {
		super(rest)
		this._scale = null
		if (typeof scale === 'string') {
			this._scalename = scale
		} else {
			this._scale = scale
		}
		this._offset = null
		if (typeof offset === 'string') {
			this._offsetname = offset
		} else {
			this._offset = offset
		}
		this._epsilon = epsilon
		this._channel_dim = channel_dim
		if (this._channel_dim !== -1 && this._channel_dim !== 1) {
			throw new NeuralnetworkLayerException('Invalid channel dimension.')
		}
		this._input_mean = input_mean
		this._input_var = input_var
	}

	calc(x) {
		const channel_dim = this._channel_dim < 0 ? this._channel_dim + x.dimension : this._channel_dim
		const csizes = Array(x.dimension - channel_dim).fill(1)
		csizes[0] = x.sizes[channel_dim]
		if (this._scalename) {
			this._scale = this.graph.getNode(this._scalename).outputValue
			this._scale.reshape(...csizes)
		} else if (typeof this._scale === 'number') {
			this._scale = new Tensor(csizes, this._scale)
		} else if (Array.isArray(this._scale)) {
			this._scale = Tensor.fromArray(this._scale)
			this._scale.reshape(...csizes)
		}
		if (this._offsetname) {
			this._offset = this.graph.getNode(this._offsetname).outputValue
			this._offset.reshape(...csizes)
		} else if (typeof this._offset === 'number') {
			this._offset = new Tensor(csizes, this._offset)
		} else if (Array.isArray(this._offset)) {
			this._offset = Tensor.fromArray(this._offset)
			this._offset.reshape(...csizes)
		}

		if (typeof this._input_mean === 'string') {
			this._mean = this.graph.getNode(this._input_mean).outputValue
			this._mean.reshape(...csizes)
		} else if (Array.isArray(this._input_mean)) {
			this._mean = Tensor.fromArray(this._input_mean)
			this._mean.reshape(...csizes)
		}
		if (typeof this._input_var === 'string') {
			this._var = this.graph.getNode(this._input_var).outputValue
			this._var.reshape(...csizes)
		} else if (Array.isArray(this._input_var)) {
			this._var = Tensor.fromArray(this._input_var)
			this._var.reshape(...csizes)
		}

		if (!this._input_mean || !this._input_var) {
			const axis = Array.from({ length: x.dimension }, (_, k) => k)
			axis.splice(channel_dim, 1)
			const redSize = axis.reduce((s, v) => s * x.sizes[v], 1)
			const m = x.reduce((s, v) => s + v / redSize, 0, axis, true)

			if (!this._input_mean) {
				this._mean = m
			}
			if (!this._input_var) {
				const d = x.copy()
				d.broadcastOperate(m, (a, b) => (a - b) ** 2)
				const v = d.reduce((s, v) => s + v / redSize, 0, axis, true)
				this._var = v
			}
		}

		this._xc = x.copy()
		this._xc.broadcastOperate(this._mean, (a, b) => a - b)
		this._xh = this._xc.copy()
		this._xh.broadcastOperate(this._var, (a, b) => a / Math.sqrt(b + this._epsilon))
		const o = this._xh.copy()
		o.broadcastOperate(this._scale, (a, b) => a * b)
		o.broadcastOperate(this._offset, (a, b) => a + b)
		return o
	}

	grad(bo) {
		const channel_dim = this._channel_dim < 0 ? this._channel_dim + bo.dimension : this._channel_dim

		this._bo = bo

		const bs = this._bo.copy()
		bs.broadcastOperate(this._scale, (a, b) => a * b)
		const xcbs = this._xc.copy()
		xcbs.broadcastOperate(bs, (a, b) => a * b)

		const axis = Array.from({ length: bo.dimension }, (_, k) => k)
		axis.splice(channel_dim, 1)
		const redSize = axis.reduce((s, v) => s * bo.sizes[v], 1)
		const m = xcbs.reduce((s, v) => s + v / redSize, 0, axis, true)

		const bi = this._xc.copy()
		bi.broadcastOperate(this._var, (a, b) => a / (b + this._epsilon))
		bi.broadcastOperate(m, (a, b) => a * b)
		bi.broadcastOperate(bs, (a, b) => b - a)
		bi.broadcastOperate(this._var, (a, b) => a / Math.sqrt(b + this._epsilon))

		const m2 = bi.reduce((s, v) => s + v / redSize, 0, axis, true)

		bi.broadcastOperate(m2, (a, b) => a - b)
		if (this._scalename || this._offsetname) {
			const w = {}
			if (this._scalename) {
				const mboxh = this._bo.reduce((s, v, i) => s + (v * this._xh.at(i)) / redSize, 0, axis, true)
				w[this._scalename] = mboxh
			}
			if (this._offsetname) {
				const mbo = this._bo.reduce((s, v) => s + v / redSize, 0, axis, true)
				w[this._offsetname] = mbo
			}
			return [bi, w]
		}
		return bi
	}

	update(optimizer) {
		if (this._scalename && this._offsetname) {
			return
		}
		const channel_dim = this._channel_dim < 0 ? this._channel_dim + this._bo.dimension : this._channel_dim
		const axis = Array.from({ length: this._bo.dimension }, (_, k) => k)
		axis.splice(channel_dim, 1)
		const redSize = axis.reduce((s, v) => s * this._bo.sizes[v], 1)

		if (!this._offsetname) {
			const mbo = this._bo.reduce((s, v) => s + v / redSize, 0, axis, true)
			this._offset.broadcastOperate(optimizer.delta('offset', mbo), (a, b) => a - b)
		}
		if (!this._scalename) {
			const mboxh = this._bo.reduce((s, v, i) => s + (v * this._xh.at(i)) / redSize, 0, axis, true)
			this._scale.broadcastOperate(optimizer.delta('scale', mboxh), (a, b) => a - b)
		}
	}

	toObject() {
		return {
			type: 'batch_normalization',
			scale: this._scalename || this._scale.toArray?.() || this._scale,
			offset: this._offsetname || this._offset.toArray?.() || this._offset,
			epsilon: this._epsilon,
			channel_dim: this._channel_dim,
			input_mean: this._input_mean,
			input_var: this._input_var,
		}
	}
}

BatchNormalizationLayer.registLayer()
