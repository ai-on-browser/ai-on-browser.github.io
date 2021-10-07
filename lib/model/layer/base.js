import { NeuralnetworkException } from '../neuralnetwork.js'

export default class Layer {
	constructor({ optimizer = null }) {
		this._opt = optimizer
	}

	bind(x) {}

	calc(x) {
		throw new NeuralnetworkException('Not impleneted', this)
	}

	grad(bo) {
		throw new NeuralnetworkException('Not impleneted', this)
	}

	update() {}

	get_params() {
		return null
	}

	set_params(param) {}
}

export class LossLayer extends Layer {
	calc(x) {
		return x
	}

	grad() {
		return new Matrix(1, 1, 1)
	}
}
