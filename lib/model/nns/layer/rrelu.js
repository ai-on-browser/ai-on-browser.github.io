import Layer from './base.js'
import Tensor from '../../../util/tensor.js'

export default class RReluLayer extends Layer {
	constructor({ l = 1.0 / 8, u = 1.0 / 3, r = null, ...rest }) {
		super(rest)
		this._l = l
		this._u = u
		this._r = null
		if (r) {
			this._r = Tensor.fromArray(r)
		}
	}

	calc(x) {
		if (!this._r) {
			this._r = Tensor.random([1, ...x.sizes.slice(1)], this._l, this._u)
		}
		this._i = x
		this._o = x.copy()
		this._o.map((v, i) => (v > 0 ? v : v * this._r.at(0, ...i.slice(1))))
		return this._o
	}

	grad(bo) {
		const bi = bo.copy()
		bi.map((v, i) => (this._i.at(i) > 0 ? v : v * this._r.at(0, ...i.slice(1))))
		return bi
	}

	toObject() {
		return {
			type: 'rrelu',
			l: this._l,
			u: this._u,
			r: this._r?.toArray(),
		}
	}
}

RReluLayer.registLayer('rrelu')
