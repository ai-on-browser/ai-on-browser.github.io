import Layer from './base.js'
import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'

/**
 * Reduce product layer
 */
export default class ProdLayer extends Layer {
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

	get dependentLayers() {
		const layers = []
		if (typeof this._axis === 'string') {
			layers.push(this._axis)
		}
		return layers
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
			this._o = x.reduce((s, v) => s * v, 1)
			return new Tensor([], this._o)
		}
		if (!this._keepdims && x instanceof Matrix) {
			x = Tensor.fromArray(x)
		}
		this._o = x.reduce((s, v) => s * v, 1, a, true)
		if (!this._keepdims) {
			const o = this._o.copy()
			o.reshape(...o.sizes.filter((v, k) => !a.includes(k)))
			return o
		}
		return this._o
	}

	grad(bo) {
		bo.reshape(...this._size)
		const bi = this._i.copy()
		bi.broadcastOperate(this._o, (a, b) => b / a)
		bi.broadcastOperate(bo, (a, b) => a * b)
		return bi
	}

	toObject() {
		return {
			type: 'prod',
			axis: this._axis,
			keepdims: this._keepdims,
		}
	}
}

ProdLayer.registLayer()
