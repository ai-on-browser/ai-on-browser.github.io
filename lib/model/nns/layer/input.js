import Layer from './base.js'
import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'

/**
 * Input layer
 */
export default class InputLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {string} [config.name] Name of the layer
	 */
	constructor({ name = null, ...rest }) {
		super(rest)
		this._name = name
	}

	bind({ input }) {
		if (
			input &&
			!Array.isArray(input) &&
			!(input instanceof Matrix) &&
			!(input instanceof Tensor) &&
			input[this._name]
		) {
			input = input[this._name]
		}
		if (Array.isArray(input)) {
			this._o = Tensor.fromArray(input)
			if (this._o.dimension === 2) {
				this._o = this._o.toMatrix()
			}
		} else if (input instanceof Matrix || input instanceof Tensor) {
			this._o = input
		} else {
			this._o = new Matrix(1, 1, input)
		}
	}

	calc() {
		return this._o
	}

	grad() {}

	toObject() {
		return {
			type: 'input',
			name: this._name,
		}
	}
}

InputLayer.registLayer()
