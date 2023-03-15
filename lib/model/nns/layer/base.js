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

const buildUnaryLayer = (name, calcFunc, gradFunc) => {
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

const unaryLayers = {
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
	not: {
		calc: v => !v,
		grad: () => 0,
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

for (const name of Object.keys(unaryLayers)) {
	buildUnaryLayer(name, unaryLayers[name].calc, unaryLayers[name].grad)
}

const buildBinaryLayer = (name, calcFunc, gradFunc) => {
	class TempLayer extends Layer {
		calc(...x) {
			this._i = x
			this._o = x[0].copy()
			for (let i = 1; i < x.length; i++) {
				this._o.broadcastOperate(x[i], calcFunc)
			}
			return this._o
		}

		grad(bo) {
			const idx = Array(bo.dimension).fill(0)
			const bi = this._i.map(x => {
				const bi = x.copy()
				bi.fill(0)
				return bi
			})
			const dimdiff = this._i.map(x => bo.dimension - x.dimension)
			do {
				const p = this._i.map((x, k) => idx.slice(dimdiff[k]).map((v, i) => v % x.sizes[i]))
				const val = this._i.map((x, k) => x.at(p[k]))
				const bov = bo.at(idx)
				const ov = this._o.at(idx)
				bi.forEach((xb, k) => {
					xb.operateAt(p[k], v => v + gradFunc(k, val, ov) * bov)
				})
				for (let i = 0; i < idx.length; i++) {
					idx[i]++
					if (idx[i] < bo.sizes[i]) {
						break
					}
					idx[i] = 0
				}
			} while (idx.some(v => v > 0))
			return bi
		}
	}
	Object.defineProperty(TempLayer, 'name', {
		value: name.split('_').reduce((s, nm) => s + nm[0].toUpperCase() + nm.substring(1).toLowerCase(), '') + 'Layer',
	})
	TempLayer.registLayer(name)
}

const binaryLayers = {
	add: {
		calc: (x1, x2) => x1 + x2,
		gradFunc: () => 1,
	},
	and: {
		calc: (x1, x2) => x1 && x2,
		gradFunc: () => 0,
	},
	bitwise_and: {
		calc: (x1, x2) => x1 & x2,
		gradFunc: () => 0,
	},
	bitwise_or: {
		calc: (x1, x2) => x1 | x2,
		gradFunc: () => 0,
	},
	bitwise_xor: {
		calc: (x1, x2) => x1 ^ x2,
		gradFunc: () => 0,
	},
	div: {
		calc: (x1, x2) => x1 / x2,
		gradFunc: (k, x) => {
			const den = x.slice(1).reduce((s, v) => s * v, 1)
			if (k === 0) {
				return 1 / den
			}
			let v = -x[0] / den ** 2
			for (let i = 1; i < x.length; i++) {
				if (i === k) continue
				v *= x[i]
			}
			return v
		},
	},
	equal: {
		calc: (x1, x2) => x1 === x2,
		gradFunc: () => 0,
	},
	greater: {
		calc: (x1, x2) => x1 > x2,
		gradFunc: () => 0,
	},
	greater_or_equal: {
		calc: (x1, x2) => x1 >= x2,
		gradFunc: () => 0,
	},
	left_bitshift: {
		calc: (x1, x2) => x1 << x2,
		gradFunc: () => 0,
	},
	less: {
		calc: (x1, x2) => x1 < x2,
		gradFunc: () => 0,
	},
	less_or_equal: {
		calc: (x1, x2) => x1 <= x2,
		gradFunc: () => 0,
	},
	max: {
		calc: Math.max,
		gradFunc: (k, x) => {
			let max_v = -Infinity
			let max_k = -1
			for (let i = 0; i < x.length; i++) {
				if (max_v < x[i]) {
					max_v = x[i]
					max_k = i
				}
			}
			return max_k === k ? 1 : 0
		},
	},
	min: {
		calc: Math.min,
		gradFunc: (k, x) => {
			let min_v = -Infinity
			let min_k = -1
			for (let i = 0; i < x.length; i++) {
				if (min_v < x[i]) {
					min_v = x[i]
					min_k = i
				}
			}
			return min_k === k ? 1 : 0
		},
	},
	mod: {
		calc: (x1, x2) => x1 % x2,
		gradFunc: () => 0,
	},
	mult: {
		calc: (x1, x2) => x1 * x2,
		gradFunc: (k, x) => {
			let v = 1
			for (let i = 0; i < x.length; i++) {
				if (i === k) continue
				v *= x[i]
			}
			return v
		},
	},
	or: {
		calc: (x1, x2) => x1 || x2,
		gradFunc: () => 0,
	},
	power: {
		calc: (x1, x2) => x1 ** x2,
		gradFunc: (k, [x1, x2]) => {
			return k === 0 ? x2 * x1 ** (x2 - 1) : x1 ** x2 * Math.log(x1)
		},
	},
	right_bitshift: {
		calc: (x1, x2) => x1 >> x2,
		gradFunc: () => 0,
	},
	sub: {
		calc: (x1, x2) => x1 - x2,
		gradFunc: k => (k === 0 ? 1 : -1),
	},
	xor: {
		calc: (x1, x2) => (x1 || x2) && !(x1 && x2),
		gradFunc: () => 0,
	},
}

for (const name of Object.keys(binaryLayers)) {
	buildBinaryLayer(name, binaryLayers[name].calc, binaryLayers[name].gradFunc)
}
