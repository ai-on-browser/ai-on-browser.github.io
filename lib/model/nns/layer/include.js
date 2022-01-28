import NeuralNetwork from '../../neuralnetwork.js'
import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

export default class IncludeLayer extends Layer {
	constructor({ net, input_to = null, train = true, ...rest }) {
		super(rest)
		this._model = net instanceof NeuralNetwork ? net : NeuralNetwork.fromObject(net)
		this._input_to = input_to
		this._train = train
		this._org_i = null
		this._org_t = null
	}

	bind({ input, supervisor }) {
		this._org_i = input
		this._org_t = supervisor
	}

	calc(x) {
		if (!(this._org_i instanceof Matrix) && this._input_to) {
			const org_x = x
			x = this._org_i
			x[this._input_to] = org_x
		}
		return this._model.calc(x)
	}

	grad(bo) {
		return this._model.grad(bo)
	}

	update(optimizer) {
		if (this._train) {
			this._model.update(optimizer.lr)
		}
	}

	toObject() {
		return {
			type: 'include',
			net: this._model.toObject(),
			input_to: this._input_to,
			train: this._train,
		}
	}
}

IncludeLayer.registLayer()
