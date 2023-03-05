import Layer from './base.js'
import Tensor from '../../../util/tensor.js'

/**
 * Power layer
 */
export default class PowerLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number | string} config.n n
	 */
	constructor({ n, ...rest }) {
		super(rest)
		this._n = null
		if (typeof n === 'string') {
			this._nname = n
		} else if (Array.isArray(n)) {
			this._n = Tensor.fromArray(n)
		} else {
			this._n = n
		}
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		if (this._nname) {
			this._n = this.graph.getNode(this._nname).outputValue
		}
		o.broadcastOperate(this._n, (a, b) => a ** b)
		return o
	}

	grad(bo) {
		const bi = bo.copy()
		const i = this._i.copy()
		i.broadcastOperate(this._n, (a, b) => b * a ** (b - 1))
		bi.broadcastOperate(i, (a, b) => a * b)
		return bi
	}

	toObject() {
		return {
			type: 'power',
			n: this._nname || this._n,
		}
	}
}

PowerLayer.registLayer()
