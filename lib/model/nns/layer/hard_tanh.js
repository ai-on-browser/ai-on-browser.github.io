import Layer from './base.js'

export default class HardTanhLayer extends Layer {
	constructor({ v = 1, ...rest }) {
		super(rest)
		this._v = v
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => (v < -this._v ? -this._v : this._v < v ? this._v : v))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => a * (b < -this._v || this._v < b ? 0 : 1))
		return bi
	}

	toObject() {
		return {
			type: 'hard_tanh',
			v: this._v,
		}
	}
}

HardTanhLayer.registLayer()
