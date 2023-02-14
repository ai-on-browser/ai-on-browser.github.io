import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'

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
	 * @param {import("./index").PlainLayerObject} obj Object represented a layer
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
	 * @returns {import("./index").PlainLayerObject} Object represented this layer
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

const buildLayer = (name, calcFunc, gradFunc) => {
	class TempLayer extends Layer {
		calc(x) {
			this._i = x
			this._o = x.copy()
			this._o.map(calcFunc)
			return this._o
		}

		grad(bo) {
			const bi = bo.copy()
			for (let i = 0; i < bi.length; i++) {
				bi.value[i] *= gradFunc(this._i.value[i], this._o.value[i])
			}
			return bi
		}
	}
	Object.defineProperty(TempLayer, 'name', {
		value: name.split('_').reduce((s, nm) => s + nm[0].toUpperCase() + nm.substring(1).toLowerCase(), '') + 'Layer',
	})
	TempLayer.registLayer(name)
}

const simpleLayers = {
	abs: {
		calc: Math.abs,
		grad: i => (i < 0 ? -1 : 1),
	},
	acos: {
		calc: Math.acos,
		grad: i => -1 / (Math.sqrt(1 - i ** 2) + 1.0e-4),
	},
	acosh: {
		calc: Math.acosh,
		grad: i => 1 / (Math.sqrt(i ** 2 - 1) + 1.0e-4),
	},
	asin: {
		calc: Math.asin,
		grad: i => 1 / (Math.sqrt(1 - i ** 2) + 1.0e-4),
	},
	asinh: {
		calc: Math.asinh,
		grad: i => 1 / Math.sqrt(1 + i ** 2),
	},
	atan: {
		calc: Math.atan,
		grad: i => 1 / (1 + i ** 2),
	},
	atanh: {
		calc: Math.atanh,
		grad: i => 1 / (1 - i ** 2),
	},
	bent_identity: {
		calc: v => (Math.sqrt(v ** 2 + 1) - 1) / 2 + v,
		grad: i => i / (2 * Math.sqrt(i ** 2 + 1)) + 1,
	},
	bitwise_not: {
		calc: v => ~v,
		grad: () => 0,
	},
	ceil: {
		calc: Math.ceil,
		grad: () => 1,
	},
	cloglog: {
		calc: v => 1 - Math.exp(-Math.exp(v)),
		grad: (i, o) => Math.exp(i) * (1 - o),
	},
	cloglogm: {
		calc: v => 1 - 2 * Math.exp(-0.7 * Math.exp(v)),
		grad: i => 1.4 * Math.exp(i - 0.7 * Math.exp(i)),
	},
	cos: {
		calc: Math.cos,
		grad: i => -Math.sin(i),
	},
	cosh: {
		calc: Math.cosh,
		grad: i => Math.sinh(i),
	},
	elish: {
		calc: v => (v >= 0 ? v : Math.exp(v) - 1) / (1 + Math.exp(-v)),
		grad: (i, o) => ((i >= 0 ? 1 : Math.exp(i)) + o * Math.exp(-i)) / (1 + Math.exp(-i)),
	},
	elliott: {
		calc: v => v / (2 * (1 + Math.abs(v))) + 0.5,
		grad: i => 1 / (2 * (1 + Math.abs(i)) ** 2),
	},
	erf: {
		calc: v => {
			const p = 0.3275911
			const a1 = 0.254829592
			const a2 = -0.284496736
			const a3 = 1.421413741
			const a4 = -1.453152027
			const a5 = 1.061405429

			const sign = v < 0 ? -1 : 1
			const t = 1 / (1 + p * Math.abs(v))
			const erf = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-v * v)
			return sign * erf
		},
		grad: i => (2 * Math.exp(-(i ** 2))) / Math.sqrt(Math.PI),
	},
	exp: {
		calc: Math.exp,
		grad: (i, o) => o,
	},
	floor: {
		calc: Math.floor,
		grad: () => 1,
	},
	geru: {
		calc: v => {
			const erf = v => {
				const p = 0.3275911
				const a1 = 0.254829592
				const a2 = -0.284496736
				const a3 = 1.421413741
				const a4 = -1.453152027
				const a5 = 1.061405429

				const sign = v < 0 ? -1 : 1
				const t = 1 / (1 + p * Math.abs(v))
				const erf = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-v * v)
				return sign * erf
			}
			return (v * (1 + erf(v / Math.sqrt(2)))) / 2
		},
		grad: (i, o) => (i === 0 ? 0 : o / i) + (i * Math.exp(-((i / Math.sqrt(2)) ** 2))) / Math.sqrt(2 * Math.PI),
	},
	hard_elish: {
		calc: v => Math.max(0, Math.min(1, (v + 1) / 2)) * (v >= 0 ? v : Math.exp(v) - 1),
		grad: i => (i <= -1 ? 0 : i >= 1 ? (i >= 0 ? 1 : Math.exp(i)) : i >= 0 ? i : ((1 + i) * Math.exp(i)) / 2),
	},
	hard_swish: {
		calc: v => (v <= -3 ? 0 : 3 <= v ? v : (v * (v + 3)) / 6),
		grad: i => (i <= -3 ? 0 : 3 <= i ? 1 : (2 * i + 3) / 6),
	},
	is_inf: {
		calc: v => v === Infinity || v === -Infinity,
		grad: () => 0,
	},
	is_nan: {
		calc: v => Number.isNaN(v),
		grad: () => 0,
	},
	lisht: {
		calc: v => v * Math.tanh(v),
		grad: i => Math.tanh(i) + i * (1 - Math.tanh(i) ** 2),
	},
	log: {
		calc: Math.log,
		grad: i => 1 / i,
	},
	loglog: {
		calc: v => Math.exp(-Math.exp(-v)),
		grad: (i, o) => Math.exp(-i) * o,
	},
	logsigmoid: {
		calc: v => Math.log(1 / (1 + Math.exp(-v))),
		grad: i => 1 / (1 + Math.exp(i)),
	},
	mish: {
		calc: v => v * Math.tanh(Math.log(1 + Math.exp(v))),
		grad: i =>
			(Math.exp(i) * (4 * (i + 1) + 4 * Math.exp(2 * i) + Math.exp(3 * i) + Math.exp(i) * (4 * i + 6))) /
			(2 * Math.exp(i) + Math.exp(2 * i) + 2) ** 2,
	},
	negative: {
		calc: v => -v,
		grad: () => -1,
	},
	relu: {
		calc: v => (v > 0 ? v : 0),
		grad: i => (i > 0 ? 1 : 0),
	},
	resech: {
		calc: v => v / Math.cosh(v),
		grad: (i, o) => 1 / Math.cosh(i) - o * Math.tanh(i),
	},
	reu: {
		calc: v => (v > 0 ? v : v * Math.exp(v)),
		grad: (i, o) => (i > 0 ? 1 : Math.exp(i) + o),
	},
	rootsig: {
		calc: v => v / (1 + Math.sqrt(1 + v ** 2)),
		grad: i => 1 / (Math.sqrt(i ** 2 + 1) + i ** 2 + 1),
	},
	not: {
		calc: v => !v,
		grad: () => 0,
	},
	round: {
		calc: Math.round,
		grad: () => 1,
	},
	sign: {
		calc: Math.sign,
		grad: () => 1,
	},
	silu: {
		calc: v => v / (1 + Math.exp(-v)),
		grad: (i, o) => 1 / (1 + Math.exp(-i)) + o * (1 - o / i),
	},
	sin: {
		calc: Math.sin,
		grad: i => Math.cos(i),
	},
	sinh: {
		calc: Math.sinh,
		grad: i => Math.cosh(i),
	},
	softsign: {
		calc: v => v / (1 + Math.abs(v)),
		grad: i => 1 / (1 + Math.abs(i)) ** 2,
	},
	sqrt: {
		calc: Math.sqrt,
		grad: (i, o) => 1 / (2 * o),
	},
	square: {
		calc: v => v ** 2,
		grad: i => i * 2,
	},
	ssigmoid: {
		calc: v => 4 / (1 + Math.exp(-v)) - 2,
		grad: i => (4 * Math.exp(-i)) / (1 + Math.exp(-i)) ** 2,
	},
	tan: {
		calc: Math.tan,
		grad: i => 1 / Math.cos(i) ** 2,
	},
	tanh: {
		calc: Math.tanh,
		grad: (i, o) => 1 - o ** 2,
	},
	tanhexp: {
		calc: v => v * Math.tanh(Math.exp(v)),
		grad: i => Math.tanh(Math.exp(i)) - i * Math.exp(i) * (Math.tanh(Math.exp(i)) ** 2 - 1),
	},
	tanhshrink: {
		calc: v => v - Math.tanh(v),
		grad: i => Math.tanh(i) ** 2,
	},
}

for (const name of Object.keys(simpleLayers)) {
	buildLayer(name, simpleLayers[name].calc, simpleLayers[name].grad)
}
