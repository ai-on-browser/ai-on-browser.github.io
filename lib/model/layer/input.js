import { NeuralnetworkException } from '../neuralnetwork.js'
import Layer from './base.js'
import Matrix from '../../util/matrix.js'
import Tensor from '../../util/tensor.js'

export default class InputLayer extends Layer {
	constructor({ name = null, ...rest }) {
		super(rest)
		this._name = name
	}

	bind({ input }) {
		if (input instanceof Matrix || input instanceof Tensor) {
			this._o = input
		} else if (input && input[this._name]) {
			this._o = input[this._name]
		} else {
			throw new NeuralnetworkException('Invalid input.', [this, input])
		}
	}

	calc() {
		return this._o
	}

	grad(bo) {}

	toObject() {
		return {
			type: 'input',
			name: this._name,
		}
	}
}

InputLayer.registLayer()
