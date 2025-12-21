import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'
import Layer, { NeuralnetworkLayerException } from './base.js'

/**
 * Input layer
 */
export default class InputLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {string} [config.name] Name of the layer
	 * @param {(number | null)[]} [config.size] Size of the layer
	 * @param {number | number[] | number[][] | number[][][] | number[][][][] | Matrix | Tensor} [config.value] Default value
	 */
	constructor({ name = null, size = null, value, ...rest }) {
		super(rest)
		this._name = name
		this._size = size
		this._value = value
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
		if (input == null) {
			input = this._value
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
			value: this._value instanceof Matrix || this._value instanceof Tensor ? this._value.toArray() : this._value,
		}
	}
}

InputLayer.registLayer()
