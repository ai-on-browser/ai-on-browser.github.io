import Tensor from '../../../util/tensor.js'
import Layer from './base.js'

/**
 * Random translation ReLU layer
 */
export default class RandomTranslationReLULayer extends Layer {
	constructor({ ...rest }) {
		super(rest)
		this._r = null
		this._training = false
	}

	bind({ training }) {
		this._training = training
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		if (this._training) {
			this._r = Tensor.randn(x.sizes.slice(1))
			o.map((v, i) => Math.max(0, v + this._r.at(i.slice(1))))
		} else {
			this._r = Tensor.zeros(x.sizes.slice(1))
			o.map(v => (v > 0 ? v : 0))
		}
		return o
	}

	grad(bo) {
		const bi = bo.copy()
		bi.map((v, i) => (this._i.at(i) + this._r.at(i.slice(1)) > 0 ? v : 0))
		return bi
	}
}

RandomTranslationReLULayer.registLayer('rtrelu')
