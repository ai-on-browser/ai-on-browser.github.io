import Layer from './base.js'
import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'

/**
 * Constant layer
 */
export default class ConstLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} config.value Value
	 */
	constructor({ value, ...rest }) {
		super(rest)
		this._value = value
	}

	calc() {
		if (!Array.isArray(this._value)) {
			return new Matrix(1, 1, this._value)
		}
		const ten = Tensor.fromArray(this._value)
		if (ten.dimension === 2) {
			return ten.toMatrix()
		}
		return ten
	}

	grad(bo) {}

	toObject() {
		return {
			type: 'const',
			value: this._value,
		}
	}
}

ConstLayer.registLayer()
