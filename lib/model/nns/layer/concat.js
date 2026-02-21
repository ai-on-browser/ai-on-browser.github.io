import Layer from './base.js'

/**
 * Concat layer
 */
export default class ConcatLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} [config.axis] Axis
	 */
	constructor({ axis = 1, ...rest }) {
		super(rest)
		this._axis = axis
	}

	calc(...x) {
		const m = x[0].copy()
		let c = x[0].sizes[this._axis]
		this._sizes = [0, c]
		for (let i = 1; i < x.length; i++) {
			m.concat(x[i], this._axis)
			c += x[i].sizes[this._axis]
			this._sizes.push(c)
		}
		return m
	}

	grad(bo) {
		const bi = []
		for (let i = 0; i < this._sizes.length - 1; i++) {
			bi.push(bo.slice(this._sizes[i], this._sizes[i + 1], this._axis))
		}
		return bi
	}

	toObject() {
		return {
			type: 'concat',
			axis: this._axis,
		}
	}
}

ConcatLayer.registLayer()
