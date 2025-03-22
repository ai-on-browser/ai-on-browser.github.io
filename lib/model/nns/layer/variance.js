import Layer from './base.js'
import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'

/**
 * Variance layer
 */
export default class VarLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number | number[] | string} [config.axis] axis
	 * @param {boolean} [config.keepdims] Keep dimensions or not
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

	get dependentLayers() {
		const layers = []
		if (this._axisname) {
			layers.push(this._axisname)
		}
		return layers
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
			this._m = x.reduce((s, v) => s + v, 0) / x.length
			return new Tensor([], x.reduce((s, v) => s + (v - this._m) ** 2, 0) / x.length)
		}
		if (!this._keepdims && x instanceof Matrix) {
			x = Tensor.fromArray(x)
		}
		const len = this._axis.includes(-1) ? x.length : this._axis.reduce((s, v) => s * x.sizes[v], 1)
		this._m = x.reduce((s, v) => s + v, 0, this._axis, true)
		this._m.map(v => v / len)
		const d = x.copy()
		d.broadcastOperate(this._m, (a, b) => a - b)
		const o = d.reduce((s, v) => s + v ** 2, 0, this._axis, this._keepdims)
		o.map(v => v / len)
		return o
	}

	grad(bo) {
		bo.reshape(...this._size)
		const len = this._axis.includes(-1) ? this._i.length : this._axis.reduce((s, v) => s * this._i.sizes[v], 1)
		const bi = this._i.copy()
		bi.broadcastOperate(this._m, (a, b) => (2 * (a - b)) / len)
		bi.broadcastOperate(bo, (a, b) => a * b)
		return bi
	}

	toObject() {
		return {
			type: 'variance',
			axis: this._axis,
			keepdims: this._keepdims,
		}
	}
}

VarLayer.registLayer('variance')
