import Matrix from '../../../util/matrix.js'

const layerClasses = {}

/**
 * Exception for neuralnetwork layer class
 */
export class NeuralnetworkLayerException extends Error {
	/**
	 * @param {string} message Error message
	 * @param {*} value Some value
	 */
	constructor(message, value) {
		super(message)
		this.value = value
		this.name = 'NeuralnetworkLayerException'
	}
}

/**
 * Neuralnetwork layer
 */
export default class Layer {
	/**
	 * @param {object} obj Config
	 */
	constructor({}) {}

	/**
	 * Returns layer from JSON.
	 *
	 * @param {object} obj Object represented a layer
	 * @returns {Layer} Layer
	 */
	static fromObject(obj) {
		const cls = layerClasses[obj.type]
		if (!cls) {
			throw new NeuralnetworkLayerException(`Invalid layer type: ${obj.type}`)
		}
		return new cls(obj)
	}

	/**
	 * Regist layer class.
	 *
	 * @param {string} [name] Name of the layer
	 * @param {Layer} [cls] Layer class
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
			throw new NeuralnetworkLayerException(`Layer name '${name}' already exists.`)
		}
		layerClasses[name] = cls
	}

	/**
	 * Bind pre-condition values.
	 *
	 * @param {object} values Binding object
	 * @param {Matrix | Tensor | Object<string, Matrix | Tensor>} values.input Input data for neuralnetwork
	 * @param {Matrix} [values.supervisor] Supervisor data
	 * @param {number} values.n Data count
	 * @param {*} values.rest Some other values
	 */
	bind(values) {}

	/**
	 * Returns calculated values.
	 *
	 * @param {...(Matrix | Tensor)} x Input values
	 * @returns {Matrix | Tensor | Array<Matrix | Tensor>} Output values
	 */
	calc(...x) {
		throw new NeuralnetworkLayerException('Not impleneted', this)
	}

	/**
	 * Returns gradient values.
	 *
	 * @param {...(Matrix | Tensor)} bo Input value of backpropagation
	 * @returns {Matrix | Tensor | Array<Matrix | Tensor>} Output value of backpropagation
	 */
	grad(...bo) {
		throw new NeuralnetworkLayerException('Not impleneted', this)
	}

	/**
	 * Update parameters.
	 *
	 * @param {{lr: number, delta: (function (string, Matrix): Matrix)}} optimizer Optimizer for this layer
	 */
	update(optimizer) {}

	/**
	 * Returns object of this layer.
	 *
	 * @returns {object} Object represented this layer
	 */
	toObject() {
		for (const name of Object.keys(layerClasses)) {
			if (this.constructor === layerClasses[name]) {
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
layerClasses.loss = LossLayer

/**
 * Base class for Flow-based generative model
 */
export class FlowLayer extends Layer {
	/**
	 * Returns inverse values.
	 *
	 * @param {...(Matrix | Tensor)} y Input value of inverse calculation
	 * @returns {Matrix | Tensor | Array<Matrix | Tensor>} Output value of inverse calculation
	 */
	inverse(...y) {
		throw new NeuralnetworkLayerException('Not impleneted', this)
	}

	/**
	 * Returns determinant of the Jacobian.
	 *
	 * @returns {number} Determinant of the Jacobian
	 */
	jacobianDeterminant() {
		throw new NeuralnetworkLayerException('Not impleneted', this)
	}
}
