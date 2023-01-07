import Layer from './base.js'
import Tensor from '../../../util/tensor.js'

/**
 * Randomized ReLU layer
 */
export default class RandomizedReLULayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number} [config.l=0.125] Low value
	 * @param {number} [config.u=0.3333333333333333] High value
	 */
	constructor({ l = 1.0 / 8, u = 1.0 / 3, ...rest }) {
		super(rest)
		this._l = l
		this._u = u
		this._r = null
		this._training = false
	}

	bind({ training }) {
		this._training = training
	}

	calc(x) {
		if (this._training) {
			this._r = Tensor.random(x.sizes.slice(1), this._l, this._u)
		} else {
			this._r = new Tensor(x.sizes.slice(1), (this._l + this._u) / 2)
		}
		this._i = x
		const o = x.copy()
		o.map((v, i) => (v > 0 ? v : v * this._r.at(i.slice(1))))
		return o
	}

	grad(bo) {
		const bi = bo.copy()
		bi.map((v, i) => (this._i.at(i) > 0 ? v : v * this._r.at(i.slice(1))))
		return bi
	}

	toObject() {
		return {
			type: 'rrelu',
			l: this._l,
			u: this._u,
		}
	}
}

RandomizedReLULayer.registLayer('rrelu')
