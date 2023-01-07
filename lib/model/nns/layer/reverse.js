import Layer from './base.js'

/**
 * Reverse layer
 */
export default class ReverseLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number} [config.axis=1] axis
	 */
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
