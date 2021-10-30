import { Tensor, Matrix } from '../util/math.js'
import Layer from './layer/base.js'

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
	 * Returns neuralnetwork.
	 * @param {Record<string, *>[]} layers
	 * @param {?string} loss
	 * @param {'sgd' | 'adam' | 'momentum' | 'rmsprop'} optimizer
	 * @returns {NeuralNetwork}
	 */
	static fromObject(layers, loss, optimizer = 'sgd') {
		const layer_list = []
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
		for (const cn of const_numbers) {
			const cl = new ConstLayer({ value: cn, input: [] })
			cl.name = `__const_number_${cn}`
			cl.parent = []
			layer_list.push(cl)
		}
		for (const l of layers) {
			const cl = Layer.fromObject(l)
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
					const tl = layer_list.filter(l => name === l.name)
					cl.parent.push({
						layer: tl[0],
						index: layer_list.indexOf(tl[0]),
						subscript: subscript,
					})
				}
			} else {
				const pid = layer_list.length - 1
				if (pid >= 0) {
					cl.parent.push({
						layer: layer_list[pid],
						index: pid,
						subscript: null,
					})
				}
			}
			layer_list.push(cl)
		}

		return new NeuralNetwork(layer_list, null, optimizer)
	}

	/**
	 * @param {Layer[]} layers
	 * @param {?string} loss
	 * @param {'sgd' | 'adam' | 'momentum' | 'rmsprop'} optimizer
	 */
	constructor(layers, loss, optimizer = 'sgd') {
		this._layers = layers
		if (loss) {
			const cl = Layer.fromObject({ type: loss })
			cl.parent = [
				{
					layer: this._layers[this._layers.length - 1],
					index: this._layers.length - 1,
					subscript: null,
				},
			]
			this._layers.push(cl)
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
		this._opt_managers = []
		for (let i = 0; i < this._layers.length; i++) {
			this._opt_managers.push(this._opt.manager())
		}
	}

	/**
	 * Returns a copy of this.
	 * @returns {NeuralNetwork}
	 */
	copy() {
		return NeuralNetwork.fromObject(this.toObject(), null, this._optimizer)
	}

	/**
	 * Returns object representation.
	 * @returns {object}
	 */
	toObject() {
		const s = []
		for (let i = 0; i < this._layers.length; i++) {
			const layer = this._layers[i]
			const obj = layer.toObject()
			if (layer.name) {
				obj.name = layer.name
			}
			if (layer.input) {
				obj.input = layer.input
			}
			s.push(obj)
		}
		return s
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
			if (!t && l instanceof OutputLayer) {
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
				if (l instanceof OutputLayer) {
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
			if (l instanceof InputLayer) {
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
			this._layers[i].update(this._opt_managers[i])
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

import InputLayer from './layer/input.js'
import OutputLayer from './layer/output.js'
import SupervisorLayer from './layer/supervisor.js'
import IncludeLayer from './layer/include.js'
import ConstLayer from './layer/const.js'
import RandomLayer from './layer/random.js'
import VariableLayer from './layer/variable.js'
import FullyConnected from './layer/full.js'
import LinearLayer from './layer/linear.js'
import NegativeLayer from './layer/negative.js'
import SigmoidLayer from './layer/sigmoid.js'
import TanhLayer from './layer/tanh.js'
import SoftsignLayer from './layer/softsign.js'
import SoftplusLayer from './layer/softplus.js'
import AbsLayer from './layer/abs.js'
import ReluLayer from './layer/relu.js'
import LeakyReluLayer from './layer/leaky_relu.js'
import ELULayer from './layer/elu.js'
import PReLULayer from './layer/prelu.js'
import RReluLayer from './layer/rrelu.js'
import SoftmaxLayer from './layer/softmax.js'
import SoftargmaxLayer from './layer/softargmax.js'
import LogLayer from './layer/log.js'
import ExpLayer from './layer/exp.js'
import SquareLayer from './layer/square.js'
import SqrtLayer from './layer/sqrt.js'
import PowerLayer from './layer/power.js'
import GaussianLayer from './layer/gaussian.js'
import BatchNormalizationLayer from './layer/batch_normalization.js'
import SparseLayer from './layer/sparse.js'
import DropoutLayer from './layer/dropout.js'
import DetachLayer from './layer/detach.js'
import ClipLayer from './layer/clip.js'
import AddLayer from './layer/add.js'
import SubLayer from './layer/sub.js'
import MultLayer from './layer/mult.js'
import DivLayer from './layer/div.js'
import MatmulLayer from './layer/matmul.js'
import ConvLayer from './layer/conv.js'
import RNNLayer from './layer/rnn.js'
import LSTMLayer from './layer/lstm.js'
import GRULayer from './layer/gru.js'
import SumLayer from './layer/sum.js'
import MeanLayer from './layer/mean.js'
import VarLayer from './layer/variance.js'
import ReshapeLayer from './layer/reshape.js'
import ReverseLayer from './layer/reverse.js'
import TransposeLayer from './layer/transpose.js'
import FlattenLayer from './layer/flatten.js'
import ConcatLayer from './layer/concat.js'
import SplitLayer from './layer/split.js'
import OnehotLayer from './layer/onehot.js'
import ArgmaxLayer from './layer/argmax.js'
import LessLayer from './layer/less.js'
import CondLayer from './layer/cond.js'
import MSELayer from './layer/mse.js'
import HuberLayer from './layer/huber.js'
