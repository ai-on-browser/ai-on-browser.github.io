import Layer from './base.js'

export default class ActivationLayer extends Layer {
	constructor({ activation, ...rest }) {
		super(rest)
		this._activation = activation
		this._a = Layer.fromObject({ ...rest, type: activation })
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

	toObject() {
		return {
			...this._a.toObject(),
			type: 'activation',
			activation: this._activation,
		}
	}
}

ActivationLayer.registLayer()
