import { NeuralnetworkException } from '../neuralnetwork.js'
import Layer from './base.js'

import LinearLayer from './linear.js'
import NegativeLayer from './negative.js'
import SigmoidLayer from './sigmoid.js'
import TanhLayer from './tanh.js'
import SoftsignLayer from './softsign.js'
import SoftplusLayer from './softplus.js'
import AbsLayer from './abs.js'
import ReluLayer from './relu.js'
import LeakyReluLayer from './leaky_relu.js'
import ELULayer from './elu.js'
import PReLULayer from './prelu.js'
import RReluLayer from './rrelu.js'
import SoftmaxLayer from './softmax.js'
import LogLayer from './log.js'
import ExpLayer from './exp.js'
import SquareLayer from './square.js'
import SqrtLayer from './sqrt.js'
import PowerLayer from './power.js'
import GaussianLayer from './gaussian.js'

export default class ActivationLayer extends Layer {
	constructor({ activation, ...rest }) {
		super(rest)
		this._activation = activation
		switch (this._activation) {
			case 'linear':
				this._a = new LinearLayer(rest)
				break
			case 'negative':
				this._a = new NegativeLayer(rest)
				break
			case 'sigmoid':
				this._a = new SigmoidLayer(rest)
				break
			case 'tanh':
				this._a = new TanhLayer(rest)
				break
			case 'softsign':
				this._a = new SoftsignLayer(rest)
				break
			case 'softplus':
				this._a = new SoftplusLayer(rest)
				break
			case 'abs':
				this._a = new AbsLayer(rest)
				break
			case 'relu':
				this._a = new ReluLayer(rest)
				break
			case 'leaky_relu':
				this._a = new LeakyReluLayer(rest)
				break
			case 'elu':
				this._a = new ELULayer(rest)
				break
			case 'prelu':
				this._a = new PReLULayer(rest)
				break
			case 'rrelu':
				this._a = new RReluLayer(rest)
				break
			case 'softmax':
				this._a = new SoftmaxLayer(rest)
				break
			case 'log':
				this._a = new LogLayer(rest)
				break
			case 'exp':
				this._a = new ExpLayer(rest)
				break
			case 'square':
				this._a = new SquareLayer(rest)
				break
			case 'sqrt':
				this._a = new SqrtLayer(rest)
				break
			case 'power':
				this._a = new PowerLayer(rest)
				break
			case 'gaussian':
				this._a = new GaussianLayer(rest)
				break
			default:
				throw new NeuralnetworkException('Invalid activation method.')
		}
	}

	calc(x) {
		return this._a.calc(x)
	}

	grad(bo) {
		return this._a.grad(bo)
	}

	update() {
		this._a.update()
	}

	get_params() {
		return this._a.get_params()
	}

	set_params(param) {
		this._a.set_params(param)
	}
}
