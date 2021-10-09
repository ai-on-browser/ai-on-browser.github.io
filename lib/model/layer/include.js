import Layer from './base.js'
import { Matrix } from '../../util/math.js'

export default class IncludeLayer extends Layer {
	constructor({ id = null, net = null, input_to = null, train = true, ...rest }) {
		super(rest)
		this._id = id
		this._input_to = input_to
		this._model = net || self.model[id]
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

	update() {
		if (this._train) {
			this._model.update(this._opt.lr)
		}
	}
}
