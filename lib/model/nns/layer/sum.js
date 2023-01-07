import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

/**
 * Reduce sum layer
 */
export default class SumLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number} [config.axis=-1] axis
	 */
	constructor({ axis = -1, ...rest }) {
		super(rest)
		this._axis = axis
	}

	calc(x) {
		this._i = x
		if (this._axis < 0) {
			return new Matrix(
				1,
				1,
				x.reduce((s, v) => s + v, 0)
			)
		}
		return x.reduce((s, v) => s + v, 0, this._axis, true)
	}

	grad(bo) {
		if (this._axis < 0) {
			const bi = this._i.copy()
			bi.fill(bo.toScaler())
			return bi
		}
		const bi = this._i.copy()
		bi.broadcastOperate(bo, (a, b) => b)
		return bi
	}

	toObject() {
		return {
			type: 'sum',
			axis: this._axis,
		}
	}
}

SumLayer.registLayer()
