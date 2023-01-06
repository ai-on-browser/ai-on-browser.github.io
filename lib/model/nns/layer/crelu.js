import Layer from './base.js'

/**
 * Concatenated ReLU layer
 */
export default class ConcatenatedReLULayer extends Layer {
	calc(x) {
		this._i = x
		const o1 = x.copy()
		o1.map(v => (v > 0 ? v : 0))
		const o2 = x.copy()
		o2.map(v => (v < 0 ? -v : 0))
		o1.concat(o2, o1.dimension - 1)
		return o1
	}

	grad(bo) {
		const dim = this._i.dimension - 1
		const bo1 = bo.slice(0, this._i.sizes[dim], dim)
		const bo2 = bo.slice(this._i.sizes[dim], bo.sizes[dim], dim)
		bo1.map((v, i) => (this._i.at(i) >= 0 ? v : -bo2.at(i)))
		return bo1
	}
}

ConcatenatedReLULayer.registLayer('crelu')
