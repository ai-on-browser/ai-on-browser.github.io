import Matrix from '../../../util/matrix.js'
import { NeuralnetworkException } from '../../neuralnetwork.js'

const layerClasses = {}

/**
 * Neuralnetwork layer
 *
 * @property {string} name
 */
export default class Layer {
	/**
	 * @param {object} obj
	 */
	constructor({}) {}

	/**
	 * Returns layer from JSON.
	 *
	 * @param {object} obj
	 * @returns {Layer}
	 */
	static fromObject(obj) {
		const cls = layerClasses[obj.type]
		if (!cls) {
			throw new NeuralnetworkException(`Invalid layer type: ${obj.type}`)
		}
		return new cls(obj)
	}

	/**
	 * Regist layer class.
	 *
	 * @param {string} name
	 * @param {Layer} cls
	 */
	static registLayer(name, cls) {
		cls ||= this
		if (!name && cls !== Layer) {
			name = this.name
				.replace(/Layer$/, '')
				.replace(/[A-Z]/g, s => '_' + s.toLowerCase())
				.slice(1)
			cls = this
		}
		if (layerClasses[name]) {
			throw new NeuralnetworkException(`Layer name '${name}' already exists.`)
		}
		layerClasses[name] = cls
	}

	/**
	 * Bind pre-condition values.
	 *
	 * @param {object} values
	 * @param {Matrix | Tensor | Record<string, Matrix | Tensor>} values.input
	 * @param {Matrix} [values.supervisor]
	 * @param {number} values.n
	 * @param {*} values.rest
	 */
	bind(values) {}

	/**
	 * Returns calculated values.
	 *
	 * @param {...(Matrix | Tensor)} x
	 * @returns {Matrix | Tensor | Array<Matrix | Tensor>}
	 */
	calc(...x) {
		throw new NeuralnetworkException('Not impleneted', this)
	}

	/**
	 * Returns gradient values.
	 *
	 * @param {...(Matrix | Tensor)} bo
	 * @returns {Matrix | Tensor | Array<Matrix | Tensor>}
	 */
	grad(...bo) {
		throw new NeuralnetworkException('Not impleneted', this)
	}

	/**
	 * Update parameters.
	 *
	 * @param {{lr: number, delta: (function (string, Matrix): Matrix)}} optimizer
	 */
	update(optimizer) {}

	/**
	 * Returns object of this layer.
	 *
	 * @returns {object}
	 */
	toObject() {
		for (const name of Object.keys(layerClasses)) {
			if (this instanceof layerClasses[name]) {
				return { type: name }
			}
		}
		return {}
	}
}

/**
 * Base class for loss layer
 */
export class LossLayer extends Layer {
	calc(x) {
		return x
	}

	grad() {
		return new Matrix(1, 1, 1)
	}
}

/**
 * Base class for Flow-based generative model
 */
export class FlowLayer extends Layer {
	/**
	 * Returns inverse values.
	 *
	 * @param {...(Matrix | Tensor)} y
	 * @returns {Matrix | Tensor | Array<Matrix | Tensor>}
	 */
	inverse(...y) {
		throw new NeuralnetworkException('Not impleneted', this)
	}

	/**
	 * Returns determinant of the Jacobian.
	 *
	 * @returns {number}
	 */
	jacobianDeterminant() {
		throw new NeuralnetworkException('Not impleneted', this)
	}
}
