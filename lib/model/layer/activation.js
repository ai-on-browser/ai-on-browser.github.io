import Layer from './base.js'

export default class ActivationLayer extends Layer {
	constructor({ activation, ...rest }) {
		super(rest)
		this._activation = activation
		this._a = Layer.fromJSON({...rest, type: activation})
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

ActivationLayer.registLayer()
