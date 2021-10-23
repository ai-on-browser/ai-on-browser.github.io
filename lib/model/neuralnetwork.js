import { Tensor, Matrix } from '../util/math.js'

export function NeuralnetworkException(message, value) {
	this.message = message
	this.value = value
	this.name = NeuralnetworkException
}

/**
 * Neuralnetwork
 */
export default class NeuralNetwork {
	/**
	 * @param {Record<string, *>[]} layers
	 * @param {?string} loss
	 * @param {'sgd' | 'adam' | 'momentum' | 'rmsprop'} optimizer
	 */
	constructor(layers, loss, optimizer = 'sgd') {
		this._request_layer = layers
		this._layers = []
		if (layers.filter(l => l.type === 'output').length === 0) {
			layers.push({ type: 'output' })
		}
		if (loss) {
			layers.push({ type: loss })
		}
		const const_numbers = new Set()
		for (const l of layers) {
			if (l.input && Array.isArray(l.input)) {
				for (let i = 0; i < l.input.length; i++) {
					if (typeof l.input[i] === 'number') {
						const_numbers.add(l.input[i])
						l.input[i] = `__const_number_${l.input[i]}`
					}
				}
			}
		}
		if (const_numbers.size) {
			layers[0].input = []
		}
		this._optimizer = optimizer
		if (optimizer === 'adam') {
			this._opt = new AdamOptimizer()
		} else if (optimizer === 'momentum') {
			this._opt = new MomentumOptimizer()
		} else if (optimizer === 'rmsprop') {
			this._opt = new RMSPropOptimizer()
		} else {
			this._opt = new SGDOptimizer()
		}
		for (const cn of const_numbers) {
			const cl = new NeuralnetworkLayers.const({ value: cn, size: 1, input: [], network: this })
			cl.name = `__const_number_${cn}`
			cl.parent = []
			this._layers.push(cl)
		}
		for (const l of layers) {
			if (!NeuralnetworkLayers[l.type]) {
				throw `Invalid layer type ${l.type}.`
			}
			const cl = new NeuralnetworkLayers[l.type]({ ...l, optimizer: this._opt.manager(), network: this })
			cl.name = l.name
			cl.parent = []
			cl.input = l.input
			if (l.input) {
				if (typeof l.input === 'string') {
					l.input = [l.input]
				}
				for (const i of l.input) {
					const subscriptRegexp = /\[([0-9]+)\]$/
					const m = i && i.match(subscriptRegexp)
					const subscript = m ? +m[1] : null
					const name = m ? i.slice(0, -m[0].length) : i
					const tl = this._layers.filter(l => name === l.name)
					cl.parent.push({
						layer: tl[0],
						index: this._layers.indexOf(tl[0]),
						subscript: subscript,
					})
				}
			} else {
				const pid = this._layers.length - 1
				if (pid >= 0) {
					cl.parent.push({
						layer: this._layers[pid],
						index: pid,
						subscript: null,
					})
				}
			}
			this._layers.push(cl)
		}
	}

	/**
	 * Returns Layer class from a name.
	 * @param {string} name
	 * @param {object} args
	 * @returns {?Layer}
	 */
	getLayerFromName(name, args = {}) {
		return new NeuralnetworkLayers[name](args)
	}

	/**
	 * Returns a copy of this.
	 * @returns {NeuralNetwork}
	 */
	copy() {
		const cp = new NeuralNetwork(this._request_layer, null, this._optimizer)
		for (let i = 0; i < this._layers.length; i++) {
			cp._layers[i].set_params(this._layers[i].get_params())
		}
		return cp
	}

	/**
	 * Returns calculated values.
	 * @param {Array<Array<number | Array<number>>> | Matrix | Tensor | Record<string, Array<Array<number | Array<number>>> | Matrix | Tensor>} x
	 * @param {?Matrix} t
	 * @param {?(string[])} out
	 * @param {object} options
	 * @returns {Matrix | Record<string, Matrix>}
	 */
	calc(x, t, out, options = {}) {
		let data_size = 0
		if (Array.isArray(x)) {
			x = Tensor.fromArray(x)
			if (x.dimension === 2) {
				x = x.toMatrix()
			}
			data_size = x.sizes[0]
		} else if (!(x instanceof Matrix || x instanceof Tensor)) {
			for (const k of Object.keys(x)) {
				x[k] = Tensor.fromArray(x[k])
				if (x[k].dimension === 2) {
					x[k] = x[k].toMatrix()
				}
				data_size = x[k].sizes[0]
			}
		} else {
			data_size = x.sizes[0]
		}

		for (const l of this._layers) {
			l.bind({ input: x, supervisor: t, n: data_size, ...options })
		}
		const o = []
		const r = {}
		for (let i = 0; i < this._layers.length; i++) {
			const l = this._layers[i]
			o[i] = l.calc(...l.parent.map(p => (p.subscript !== null ? o[p.index][p.subscript] : o[p.index])))
			if (out && out.indexOf(l.name) >= 0) {
				r[l.name] = o[i]
				if (Object.keys(r).length === out.length) {
					return r
				}
			}
			if (!t && l instanceof NeuralnetworkLayers.output) {
				if (out) return r
				return o[i]
			}
		}
		if (out) return r
		return o[o.length - 1]
	}

	/**
	 * Returns gradient values.
	 * @param {?Matrix} e
	 * @returns {Matrix}
	 */
	grad(e) {
		const bi = []
		let bi_input = null
		for (let i = 0; i < this._layers.length; bi[i++] = []);
		bi[bi.length - 1] = [new Matrix(1, 1, 1)]
		for (let i = this._layers.length - 1; i >= 0; i--) {
			const l = this._layers[i]
			if (e) {
				if (l instanceof NeuralnetworkLayers.output) {
					bi[i] = [e]
					e = null
				} else {
					continue
				}
			}
			if (bi[i].length === 0) continue
			for (let k = 0; k < bi[i].length; k++) {
				if (bi[i][k] === undefined) {
					bi[i][k] = null
				}
			}
			let bo = l.grad(...bi[i])
			if (!Array.isArray(bo)) {
				bo = Array(l.parent.length).fill(bo)
			}
			l.parent.forEach((p, k) => {
				if (!bo[k]) return
				const subidx = p.subscript || 0
				if (!bi[p.index][subidx]) {
					bi[p.index][subidx] = bo[k].copy()
				} else {
					bi[p.index][subidx].add(bo[k])
				}
			})
			if (l instanceof NeuralnetworkLayers.input) {
				bi_input = bi[i][0]
			}
		}
		return bi_input
	}

	/**
	 * Update model parameters.
	 * @param {number} learning_rate
	 */
	update(learning_rate) {
		this._opt.learningRate = learning_rate
		for (let i = 0; i < this._layers.length; i++) {
			this._layers[i].update()
		}
	}

	/**
	 * Fit model.
	 * @param {Array<Array<number | Array<number>>> | Matrix | Tensor | Record<string, Array<Array<number | Array<number>>> | Matrix | Tensor>} x
	 * @param {Array<Array<number>> | Matrix} t
	 * @param {number} epoch
	 * @param {number} learning_rate
	 * @param {number} batch_size
	 * @param {object} options
	 * @returns {number[]} Loss value
	 */
	fit(x, t, epoch = 1, learning_rate = 0.1, batch_size = null, options = {}) {
		if (Array.isArray(x)) {
			x = Tensor.fromArray(x)
			if (x.dimension === 2) {
				x = x.toMatrix()
			}
		} else if (!(x instanceof Matrix || x instanceof Tensor)) {
			for (const k of Object.keys(x)) {
				x[k] = Tensor.fromArray(x[k])
				if (x[k].dimension === 2) {
					x[k] = x[k].toMatrix()
				}
			}
		}
		t = Matrix.fromArray(t)

		let e
		while (epoch-- > 0) {
			if (batch_size) {
				for (let i = 0; i < t.rows; i += batch_size) {
					const last = Math.min(t.rows, i + batch_size)
					let xi
					if (x instanceof Matrix || x instanceof Tensor) {
						xi = x instanceof Matrix ? x.sliceRow(i, last) : x.slice(i, last)
					} else {
						xi = {}
						for (const k of Object.keys(x)) {
							xi[k] = x[k] instanceof Matrix ? x[k].sliceRow(i, last) : x[k].slice(i, last)
						}
					}
					e = this.calc(xi, t.sliceRow(i, last), null, options)
					this.grad()
					this.update(learning_rate)
				}
			} else {
				e = this.calc(x, t, null, options)
				this.grad()
				this.update(learning_rate)
			}
		}
		return e.toArray().flat()
	}
}

class SGDOptimizer {
	constructor(lr) {
		this._learningrate = lr
	}

	set learningRate(value) {
		this._learningrate = value
	}

	manager() {
		const this_ = this
		return {
			get lr() {
				return this_._learningrate
			},
			delta(key, value) {
				return value.copyMult(this.lr)
			},
		}
	}
}

class MomentumOptimizer {
	constructor(lr, beta = 0.9) {
		this._learningrate = lr
		this._beta = beta
	}

	set learningRate(value) {
		this._learningrate = value
	}

	manager() {
		const this_ = this
		return {
			get lr() {
				return this_._learningrate
			},
			params: {},
			delta(key, value) {
				if (!this.params[key]) {
					this.params[key] = value
					return value.copyMult(this.lr)
				}
				const v = this.params[key].copyMult(this_._beta)
				v.add(value.copyMult(1 - this_._beta))
				this.params[key] = v
				return v.copyMult(this.lr)
			},
		}
	}
}

class RMSPropOptimizer {
	constructor(lr, beta = 0.999) {
		this._learningrate = lr
		this._beta = beta
	}

	set learningRate(value) {
		this._learningrate = value
	}

	manager() {
		const this_ = this
		return {
			get lr() {
				return this_._learningrate
			},
			params: {},
			delta(key, value) {
				if (!this.params[key]) {
					this.params[key] = value.copyMult(value)
					return value.copyMult(this.lr)
				}
				const v = this.params[key].copyMult(this_._beta)
				v.add(value.copyMap(x => (1 - this_._beta) * x * x))
				this.params[key] = v
				return value.copyMult(v.copyMap(x => this.lr / Math.sqrt(x + 1.0e-12)))
			},
		}
	}
}

class AdamOptimizer {
	constructor(lr = 0.001, beta1 = 0.9, beta2 = 0.999) {
		this._learningrate = lr
		this._beta1 = beta1
		this._beta2 = beta2
	}

	set learningRate(value) {
		this._learningrate = value
	}

	manager() {
		const this_ = this
		return {
			get lr() {
				return this_._learningrate
			},
			params: {},
			delta(key, value) {
				if (!this.params[key]) {
					this.params[key] = {
						v: value,
						s: value.copyMult(value),
					}
					return value.copyMult(this.lr)
				}
				const v = this.params[key].v.copyMult(this_._beta1)
				v.add(value.copyMult(1 - this_._beta1))
				const s = this.params[key].s.copyMult(this_._beta2)
				s.add(value.copyMap(x => (1 - this_._beta2) * x * x))
				this.params[key] = { v, s }
				return v.copyMult(s.copyMap(x => this.lr / Math.sqrt(x + 1.0e-12)))
			},
		}
	}
}

const NeuralnetworkLayers = {}

import InputLayer from './layer/input.js'
NeuralnetworkLayers.input = InputLayer

import OutputLayer from './layer/output.js'
NeuralnetworkLayers.output = OutputLayer

import SupervisorLayer from './layer/supervisor.js'
NeuralnetworkLayers.supervisor = SupervisorLayer

import IncludeLayer from './layer/include.js'
NeuralnetworkLayers.include = IncludeLayer

import ConstLayer from './layer/const.js'
NeuralnetworkLayers.const = ConstLayer

import RandomLayer from './layer/random.js'
NeuralnetworkLayers.random = RandomLayer

import VariableLayer from './layer/variable.js'
NeuralnetworkLayers.variable = VariableLayer

import FullyConnected from './layer/full.js'
NeuralnetworkLayers.full = FullyConnected

import LinearLayer from './layer/linear.js'
NeuralnetworkLayers.linear = LinearLayer

import NegativeLayer from './layer/negative.js'
NeuralnetworkLayers.negative = NegativeLayer

import SigmoidLayer from './layer/sigmoid.js'
NeuralnetworkLayers.sigmoid = SigmoidLayer

import TanhLayer from './layer/tanh.js'
NeuralnetworkLayers.tanh = TanhLayer

import SoftsignLayer from './layer/softsign.js'
NeuralnetworkLayers.softsign = SoftsignLayer

import SoftplusLayer from './layer/softplus.js'
NeuralnetworkLayers.softplus = SoftplusLayer

import AbsLayer from './layer/abs.js'
NeuralnetworkLayers.abs = AbsLayer

import ReluLayer from './layer/relu.js'
NeuralnetworkLayers.relu = ReluLayer

import LeakyReluLayer from './layer/leaky_relu.js'
NeuralnetworkLayers.leaky_relu = LeakyReluLayer

import ELULayer from './layer/elu.js'
NeuralnetworkLayers.elu = ELULayer

import PReLULayer from './layer/prelu.js'
NeuralnetworkLayers.prelu = PReLULayer

import RReluLayer from './layer/rrelu.js'
NeuralnetworkLayers.rrelu = RReluLayer

import SoftmaxLayer from './layer/softmax.js'
NeuralnetworkLayers.softmax = SoftmaxLayer

import SoftargmaxLayer from './layer/softargmax.js'
NeuralnetworkLayers.softargmax = SoftargmaxLayer

import LogLayer from './layer/log.js'
NeuralnetworkLayers.log = LogLayer

import ExpLayer from './layer/exp.js'
NeuralnetworkLayers.exp = ExpLayer

import SquareLayer from './layer/square.js'
NeuralnetworkLayers.square = SquareLayer

import SqrtLayer from './layer/sqrt.js'
NeuralnetworkLayers.sqrt = SqrtLayer

import PowerLayer from './layer/power.js'
NeuralnetworkLayers.power = PowerLayer

import GaussianLayer from './layer/gaussian.js'
NeuralnetworkLayers.gaussian = GaussianLayer

import BatchNormalizationLayer from './layer/batch_normalization.js'
NeuralnetworkLayers.batch_normalization = BatchNormalizationLayer

import SparseLayer from './layer/sparse.js'
NeuralnetworkLayers.sparsity = SparseLayer

import DropoutLayer from './layer/dropout.js'
NeuralnetworkLayers.dropout = DropoutLayer

import DetachLayer from './layer/detach.js'
NeuralnetworkLayers.detach = DetachLayer

import ClipLayer from './layer/clip.js'
NeuralnetworkLayers.clip = ClipLayer

import AddLayer from './layer/add.js'
NeuralnetworkLayers.add = AddLayer

import SubLayer from './layer/sub.js'
NeuralnetworkLayers.sub = SubLayer

import MultLayer from './layer/mult.js'
NeuralnetworkLayers.mult = MultLayer

import DivLayer from './layer/div.js'
NeuralnetworkLayers.div = DivLayer

import MatmulLayer from './layer/matmul.js'
NeuralnetworkLayers.matmul = MatmulLayer

import ConvLayer from './layer/conv.js'
NeuralnetworkLayers.conv = ConvLayer

import RNNLayer from './layer/rnn.js'
NeuralnetworkLayers.rnn = RNNLayer

import LSTMLayer from './layer/lstm.js'
NeuralnetworkLayers.lstm = LSTMLayer

import GRULayer from './layer/gru.js'
NeuralnetworkLayers.gru = GRULayer

import SumLayer from './layer/sum.js'
NeuralnetworkLayers.sum = SumLayer

import MeanLayer from './layer/mean.js'
NeuralnetworkLayers.mean = MeanLayer

import VarLayer from './layer/variance.js'
NeuralnetworkLayers.variance = VarLayer

import ReshapeLayer from './layer/reshape.js'
NeuralnetworkLayers.reshape = ReshapeLayer

import ReverseLayer from './layer/reverse.js'
NeuralnetworkLayers.reverse = ReverseLayer

import TransposeLayer from './layer/transpose.js'
NeuralnetworkLayers.transpose = TransposeLayer

import FlattenLayer from './layer/flatten.js'
NeuralnetworkLayers.flatten = FlattenLayer

import ConcatLayer from './layer/concat.js'
NeuralnetworkLayers.concat = ConcatLayer

import SplitLayer from './layer/split.js'
NeuralnetworkLayers.split = SplitLayer

import OnehotLayer from './layer/onehot.js'
NeuralnetworkLayers.onehot = OnehotLayer

import ArgmaxLayer from './layer/argmax.js'
NeuralnetworkLayers.argmax = ArgmaxLayer

import LessLayer from './layer/less.js'
NeuralnetworkLayers.less = LessLayer

import CondLayer from './layer/cond.js'
NeuralnetworkLayers.cond = CondLayer

import MSELayer from './layer/mse.js'
NeuralnetworkLayers.mse = MSELayer

import HuberLayer from './layer/huber.js'
NeuralnetworkLayers.huber = HuberLayer
