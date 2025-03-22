import Tensor from '../../../util/tensor.js'
import Layer from './base.js'

/**
 * Layer normalization layer
 */
export default class LayerNormalizationLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} [config.axis] Dimension of the channel
	 * @param {number} [config.epsilon] Epsilon
	 * @param {number | number[] | string} [config.scale] Scale
	 * @param {number | number[] | string} [config.offset] Offset
	 */
	constructor({ axis = -1, epsilon = 1.0e-12, scale = 1, offset = 0, ...rest }) {
		super(rest)
		this._axis = axis
		this._epsilon = epsilon
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
	}

	get dependentLayers() {
		const layers = []
		if (this._scalename) {
			layers.push(this._scalename)
		}
		if (this._offsetname) {
			layers.push(this._offsetname)
		}
		return layers
	}

	get mean() {
		return this._mean
	}

	get invStdDev() {
		return this._invStdDev
	}

	calc(x) {
		const a = this._axis < 0 ? x.dimension + this._axis : this._axis
		const axis = []
		for (let i = a; i < x.dimension; i++) {
			axis.push(i)
		}

		const size = axis.map(a => x.sizes[a])
		if (this._scalename) {
			this._scale = this.graph.getNode(this._scalename).outputValue
			this._scale.reshape(...size)
		} else if (typeof this._scale === 'number') {
			this._scale = new Tensor(size, this._scale)
		} else if (Array.isArray(this._scale)) {
			this._scale = Tensor.fromArray(this._scale)
			this._scale.reshape(...size)
		}
		if (this._offsetname) {
			this._offset = this.graph.getNode(this._offsetname).outputValue
			this._offset.reshape(...size)
		} else if (typeof this._offset === 'number') {
			this._offset = new Tensor(size, this._offset)
		} else if (Array.isArray(this._offset)) {
			this._offset = Tensor.fromArray(this._offset)
			this._offset.reshape(...size)
		}

		const len = axis.reduce((s, v) => s * x.sizes[v], 1)
		const mean = x.reduce((s, v) => s + v / len, 0, axis, true)
		this._xc = x.copy()
		this._xc.broadcastOperate(mean, (a, b) => a - b)
		this._var = this._xc.reduce((s, v) => s + v ** 2 / len, 0, axis, true)
		this._xh = this._xc.copy()
		this._xh.broadcastOperate(this._var, (a, b) => a / Math.sqrt(b + this._epsilon))
		const o = this._xh.copy()
		o.broadcastOperate(this._scale, (a, b) => a * b)
		o.broadcastOperate(this._offset, (a, b) => a + b)
		this._mean = mean
		this._invStdDev = this._var.copy()
		this._invStdDev.map(v => 1 / Math.sqrt(v + this._epsilon))
		return o
	}

	grad(bo) {
		this._bo = bo

		const bs = this._bo.copy()
		bs.broadcastOperate(this._scale, (a, b) => a * b)
		const xcbs = this._xc.copy()
		xcbs.broadcastOperate(bs, (a, b) => a * b)

		const a = this._axis < 0 ? this._bo.dimension + this._axis : this._axis
		const axis = []
		for (let i = a; i < this._bo.dimension; i++) {
			axis.push(i)
		}
		const len = axis.reduce((s, v) => s * bo.sizes[v], 1)
		const m = xcbs.reduce((s, v) => s + v / len, 0, axis, true)

		const bi = this._xc.copy()
		bi.broadcastOperate(this._var, (a, b) => a / (b + this._epsilon))
		bi.broadcastOperate(m, (a, b) => a * b)
		bi.broadcastOperate(bs, (a, b) => b - a)
		bi.broadcastOperate(this._var, (a, b) => a / Math.sqrt(b + this._epsilon))

		const m2 = bi.reduce((s, v) => s + v / len, 0, axis, true)

		bi.broadcastOperate(m2, (a, b) => a - b)
		if (this._scalename || this._offsetname) {
			const redAxis = Array.from({ length: a }, (_, i) => i)
			const redSize = redAxis.reduce((s, v) => s * bo.sizes[v], 1)
			const w = {}
			if (this._scalename) {
				const mboxh = this._bo.reduce((s, v, i) => s + (v * this._xh.at(i)) / redSize, 0, redAxis)
				w[this._scalename] = mboxh
			}
			if (this._offsetname) {
				const mbo = this._bo.reduce((s, v) => s + v / redSize, 0, redAxis)
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
		const a = this._axis < 0 ? this._bo.dimension + this._axis : this._axis
		const redAxis = Array.from({ length: a }, (_, i) => i)
		const redSize = redAxis.reduce((s, v) => s * this._bo.sizes[v], 1)

		if (!this._offsetname) {
			const mbo = this._bo.reduce((s, v) => s + v / redSize, 0, redAxis)
			this._offset.broadcastOperate(optimizer.delta('offset', mbo), (a, b) => a - b)
		}
		if (!this._scalename) {
			const mboxh = this._bo.reduce((s, v, i) => s + (v * this._xh.at(i)) / redSize, 0, redAxis)
			this._scale.broadcastOperate(optimizer.delta('scale', mboxh), (a, b) => a - b)
		}
	}

	toObject() {
		return {
			type: 'layer_normalization',
			axis: this._axis,
			epsilon: this._epsilon,
			scale: this._scalename || this._scale.toArray?.() || this._scale,
			offset: this._offsetname || this._offset.toArray?.() || this._offset,
		}
	}
}

LayerNormalizationLayer.registLayer()
