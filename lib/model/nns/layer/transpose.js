import Layer from './base.js'

/**
 * Transpose layer
 */
export default class TransposeLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number[]} config.axis axis
	 */
	constructor({ axis, ...rest }) {
		super(rest)
		this._axis = axis
	}

	calc(x) {
		return x.transpose(...this._axis)
	}

	grad(bo) {
		const raxis = []
		for (let i = 0; i < this._axis.length; i++) {
			raxis.push(this._axis.indexOf(i))
		}
		return bo.transpose(...raxis)
	}

	toObject() {
		return {
			type: 'transpose',
			axis: this._axis,
		}
	}
}

TransposeLayer.registLayer()
