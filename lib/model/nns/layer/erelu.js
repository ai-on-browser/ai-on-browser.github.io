import Layer from './base.js'
import Tensor from '../../../util/tensor.js'

/**
 * Elastic ReLU layer
 */
export default class ElasticReLULayer extends Layer {
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
			this._r = Tensor.random(x.sizes.slice(1), 0, 2)
			o.map((v, i) => (v > 0 ? v * this._r.at(i.slice(1)) : 0))
		} else {
			this._r = Tensor.ones(x.sizes.slice(1))
			o.map(v => (v > 0 ? v : 0))
		}
		return o
	}

	grad(bo) {
		const bi = bo.copy()
		bi.map((v, i) => (this._i.at(i) > 0 ? v * this._r.at(i.slice(1)) : 0))
		return bi
	}
}

ElasticReLULayer.registLayer('erelu')
