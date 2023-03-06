import Layer from './base.js'
import Tensor from '../../../util/tensor.js'

/**
 * Variable layer
 */
export default class VariableLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number[] | string} config.size Size of variable
	 * @param {number} [config.l2_decay=0] L2 decay
	 * @param {number} [config.l1_decay=0] L1 decay
	 * @param {number[] | number[][] | Tensor} [config.value] Default value
	 */
	constructor({ size, l2_decay = 0, l1_decay = 0, value = null, ...rest }) {
		super(rest)
		this._size = size
		this._v = null
		if (value) {
			this._v = Tensor.fromArray(value)
		} else if (typeof size !== 'string') {
			this._v = Tensor.randn(size)
		}
		if (this._v && this._v.dimension === 2) {
			this._v = this._v.toMatrix()
		}
		this._l2_decay = l2_decay
		this._l1_decay = l1_decay
		this._n = 1
	}

	bind({ n }) {
		this._n = n
	}

	calc() {
		if (!this._v) {
			const sizes = this.graph.getNode(this._size).lastOutputSize
			this._v = Tensor.randn(sizes)
			if (this._v.dimension === 2) {
				this._v = this._v.toMatrix()
			}
		}
		return this._v
	}

	grad(bo) {
		this._bo = bo
	}

	update(optimizer) {
		const d = this._bo.copy()
		d.map(v => v / this._n)
		if (this._l2_decay > 0 || this._l1_decay > 0) {
			d.map((v, i) => {
				const vi = this._v.at(i)
				return v + vi * this._l2_decay + Math.sign(vi) * this._l1_decay
			})
		}
		this._v.broadcastOperate(optimizer.delta('v', d), (a, b) => a - b)
	}

	toObject() {
		return {
			type: 'variable',
			size: this._size,
			l2_decay: this._l2_decay,
			l1_decay: this._l1_decay,
			value: this._v.toArray(),
		}
	}
}

VariableLayer.registLayer()
