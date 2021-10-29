import { NeuralnetworkException } from '../neuralnetwork.js'
import Layer from './base.js'
import { Matrix, Tensor } from '../../util/math.js'

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
}

InputLayer.registLayer()
