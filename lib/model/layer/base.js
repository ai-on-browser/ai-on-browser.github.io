import { Matrix } from '../../util/math.js'
import { NeuralnetworkException } from '../neuralnetwork.js'

/**
 * Neuralnetwork layer.
 * @property {string} name
 * @property {{layer: Layer, index: number, subscript: ?number}[]} parent
 * @property {?(string[])} input
 */
export default class Layer {
	/**
	 * @param {object} obj
	 * @param {{lr: number, delta: function (string, Matrix): Matrix}} obj.optimizer
	 */
	constructor({ optimizer = null }) {
		this._opt = optimizer
	}

	/**
	 * Bind pre-condition values.
	 * @param {object} values
	 * @param {Matrix | Tensor | Record<string, Matrix | Tensor>} values.input
	 * @param {?Matrix} values.supervisor
	 * @param {number} values.n
	 * @param {*} values.rest
	 */
	bind(values) {}

	/**
	 * Returns calculated values.
	 * @param {Matrix | Tensor} x
	 */
	calc(x) {
		throw new NeuralnetworkException('Not impleneted', this)
	}

	/**
	 * Returns gradient values.
	 * @param {Matrix | Tensor} bo
	 */
	grad(bo) {
		throw new NeuralnetworkException('Not impleneted', this)
	}

	/**
	 * Update parameters.
	 */
	update() {}

	/**
	 * Returns parameters of this layer.
	 * @returns {?object}
	 */
	get_params() {
		return null
	}

	/**
	 * Set parameters of this layer.
	 * @param {?object} param
	 */
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
