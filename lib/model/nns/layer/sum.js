import Layer from './base.js'
import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'

/**
 * Reduce sum layer
 */
export default class SumLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number | number[] | string} [config.axis] axis
	 * @param {boolean} [config.keepdims] Keep dimensions or not
	 */
	constructor({ axis = -1, keepdims = true, ...rest }) {
		super(rest)
		this._axis = typeof axis === 'number' ? [axis] : axis
		this._keepdims = keepdims
	}

	calc(x) {
		const a = typeof this._axis === 'string' ? this.graph.getNode(this._axis).outputValue.toArray() : this._axis
		if (a.includes(-1)) {
			this._size = Array(x.dimension).fill(1)
		} else {
			this._size = x.sizes.concat()
			for (let k = 0; k < a.length; k++) {
				this._size[a[k]] = 1
			}
		}
		this._i = x
		if (!this._keepdims && a.includes(-1)) {
			return new Tensor(
				[],
				x.reduce((s, v) => s + v, 0)
			)
		}
		if (!this._keepdims && x instanceof Matrix) {
			x = Tensor.fromArray(x)
		}
		return x.reduce((s, v) => s + v, 0, a, this._keepdims)
	}

	grad(bo) {
		bo.reshape(...this._size)
		const bi = this._i.copy()
		bi.broadcastOperate(bo, (a, b) => b)
		return bi
	}

	toObject() {
		return {
			type: 'sum',
			axis: this._axis,
			keepdims: this._keepdims,
		}
	}
}

SumLayer.registLayer()
