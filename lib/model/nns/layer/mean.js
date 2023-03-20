import Layer from './base.js'
import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'

/**
 * Reduce mean layer
 */
export default class MeanLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number | number[] | string} [config.axis=-1] axis
	 * @param {boolean} [config.keepdims=true] Keep dimensions or not
	 */
	constructor({ axis = -1, keepdims = true, ...rest }) {
		super(rest)
		this._axis = null
		if (typeof axis === 'string') {
			this._axisname = axis
		} else {
			this._axis = typeof axis === 'number' ? [axis] : axis
		}
		this._keepdims = keepdims
	}

	calc(x) {
		if (this._axisname) {
			this._axis = this.graph.getNode(this._axisname).outputValue.toArray()
		}
		if (this._axis.includes(-1)) {
			this._size = Array(x.dimension).fill(1)
		} else {
			this._size = x.sizes.concat()
			for (let k = 0; k < this._axis.length; k++) {
				this._size[this._axis[k]] = 1
			}
		}
		this._i = x
		if (!this._keepdims && this._axis.includes(-1)) {
			return new Tensor([], x.reduce((s, v) => s + v, 0) / x.length)
		}
		if (!this._keepdims && x instanceof Matrix) {
			x = Tensor.fromArray(x)
		}
		const len = this._axis.includes(-1) ? x.length : this._axis.reduce((s, v) => s * x.sizes[v], 1)
		const o = x.reduce((s, v) => s + v, 0, this._axis, this._keepdims)
		o.map(v => v / len)
		return o
	}

	grad(bo) {
		bo.reshape(...this._size)
		const len = this._axis.includes(-1) ? this._i.length : this._axis.reduce((s, v) => s * this._i.sizes[v], 1)
		const bi = this._i.copy()
		bi.broadcastOperate(bo, (a, b) => b / len)
		return bi
	}

	toObject() {
		return {
			type: 'mean',
			axis: this._axisname || this._axis,
			keepdims: this._keepdims,
		}
	}
}

MeanLayer.registLayer()
