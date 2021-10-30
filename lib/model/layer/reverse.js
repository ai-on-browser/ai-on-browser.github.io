import Layer from './base.js'

export default class ReverseLayer extends Layer {
	constructor({ axis = 1, ...rest }) {
		super(rest)
		this._axis = axis
	}

	calc(x) {
		const o = x.copy()
		o.flip(this._axis)
		return o
	}

	grad(bo) {
		const bi = bo.copy()
		bi.flip(this._axis)
		return bi
	}

	toObject() {
		return {
			type: 'reverse',
			axis: this._axis,
		}
	}
}

ReverseLayer.registLayer()
