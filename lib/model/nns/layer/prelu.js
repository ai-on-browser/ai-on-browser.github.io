import Layer from './base.js'
import Tensor from '../../../util/tensor.js'

/**
 * Parametric ReLU layer
 */
export default class ParametricReLULayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number | number[] | string} [config.a] a
	 */
	constructor({ a = 0.25, ...rest }) {
		super(rest)
		this._a = null
		this._da = 0
		if (typeof a === 'string') {
			this._aname = a
		} else if (Array.isArray(a)) {
			this._a = Tensor.fromArray(a)
			this._da = this._a.copy()
			this._da.fill(0)
		} else {
			this._a = a
		}
	}

	calc(x) {
		this._i = x
		this._o = x.copy()
		if (this._aname) {
			this._a = this.graph.getNode(this._aname).outputValue
		}
		this._o.broadcastOperate(this._a, (a, b) => (a > 0 ? a : b * a))
		return this._o
	}

	grad(bo) {
		const bi = this._i.copy()
		bi.broadcastOperate(this._a, (a, b) => (a > 0 ? 1 : b))
		bi.broadcastOperate(bo, (a, b) => a * b)

		if (typeof this._a === 'number') {
			this._da0 = 0
			for (let i = 0; i < this._i.length; i++) {
				if (this._i.value[i] < 0) {
					this._da0 += bo.value[i] * this._i.value[i]
				}
			}
		} else {
			this._da0 = this._a.copy()
			this._da0.fill(0)
			const dimdiff = this._i.dimension - this._a.dimension
			const idx = Array(this._i.dimension).fill(0)
			do {
				const val = this._i.at(idx)
				if (val > 0) {
					this._da0.operateAt(idx.slice(dimdiff), v => v + val * bo.at(idx))
				}
				for (let k = 0; k < idx.length; k++) {
					idx[k]++
					if (idx[k] < this._i.sizes[k]) {
						break
					}
					idx[k] = 0
				}
			} while (idx.some(v => v > 0))
		}
		if (this._aname) {
			return [bi, { [this._aname]: this._da0 }]
		}
		return bi
	}

	update(optimizer) {
		const myu = 0.1
		if (this._aname) {
			return
		} else if (typeof this._a === 'number') {
			this._da = myu * this._da + (optimizer.lr * this._da0) / this._i.length
			this._a -= this._da
		} else {
			this._da.broadcastOperate(this._da0, (a, b) => myu * a + (optimizer.lr * b) / this._i.length)
			this._a.broadcastOperate(this._da, (a, b) => a - b)
		}
	}

	toObject() {
		return {
			type: 'prelu',
			a: this._aname || this._a,
		}
	}
}

ParametricReLULayer.registLayer('prelu')
