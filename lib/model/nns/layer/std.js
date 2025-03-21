import Layer from './base.js'
import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'

/**
 * Standard deviation layer
 */
export default class StdLayer extends Layer {
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
			this._o = Math.sqrt(x.reduce((s, v) => s + (v - this._m) ** 2, 0) / x.length)
			return new Tensor([], this._o)
		}
		if (!this._keepdims && x instanceof Matrix) {
			x = Tensor.fromArray(x)
		}
		const len = this._axis.includes(-1) ? x.length : this._axis.reduce((s, v) => s * x.sizes[v], 1)
		this._m = x.reduce((s, v) => s + v, 0, this._axis, true)
		this._m.map(v => v / len)
		const d = x.copy()
		d.broadcastOperate(this._m, (a, b) => a - b)
		this._o = d.reduce((s, v) => s + v ** 2, 0, this._axis, true)
		this._o.map(v => Math.sqrt(v / len))
		if (!this._keepdims) {
			const o = this._o.copy()
			o.reshape(...o.sizes.filter((v, k) => !this._axis.includes(k)))
			return o
		}
		return this._o
	}

	grad(bo) {
		bo.reshape(...this._size)
		const len = this._axis.includes(-1) ? this._i.length : this._axis.reduce((s, v) => s * this._i.sizes[v], 1)
		const bi = this._i.copy()
		bi.broadcastOperate(this._m, (a, b) => (a - b) / len)
		bi.broadcastOperate(this._o, (a, b) => a / b)
		bi.broadcastOperate(bo, (a, b) => a * b)
		return bi
	}

	toObject() {
		return {
			type: 'std',
			axis: this._axis,
			keepdims: this._keepdims,
		}
	}
}

StdLayer.registLayer('std')
