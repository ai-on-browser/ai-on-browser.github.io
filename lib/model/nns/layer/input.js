import Layer, { NeuralnetworkLayerException } from './base.js'
import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'

/**
 * Input layer
 */
export default class InputLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {string} [config.name] Name of the layer
	 * @param {number[]} [config.size] Size of the layer
	 */
	constructor({ name = null, size = null, ...rest }) {
		super(rest)
		this._name = name
		this._size = size
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

		if (this._size) {
			const inSize = this._o.sizes
			if (inSize.length !== this._size.length || this._size.some((v, i) => v != null && v !== inSize[i])) {
				throw new NeuralnetworkLayerException(`Invalid input size`, [this])
			}
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
			size: this._size?.concat(),
		}
	}
}

InputLayer.registLayer()
