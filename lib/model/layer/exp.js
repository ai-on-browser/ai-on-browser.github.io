import Layer from './base.js'

export default class ExpLayer extends Layer {
	calc(x) {
		this._o = x.copyMap(Math.exp)
		return this._o
	}

	grad(bo) {
		return this._o.copyMult(bo)
	}
}

ExpLayer.registLayer()
