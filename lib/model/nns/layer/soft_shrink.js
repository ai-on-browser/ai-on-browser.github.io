import Layer from './base.js'

export default class SoftShrinkLayer extends Layer {
	constructor({ l = 0.5, ...rest }) {
		super(rest)
		this._l = l
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => (v < -this._l ? v + this._l : this._l < v ? v - this._l : 0))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => (b < -this._l || this._l < b ? a : 0))
		return bi
	}

	toObject() {
		return {
			type: 'soft_shrink',
			l: this._l,
		}
	}
}

SoftShrinkLayer.registLayer()
