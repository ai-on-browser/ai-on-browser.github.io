import Layer from './base.js'

export default class NegativeLayer extends Layer {
	calc(x) {
		return x.copyMult(-1)
	}

	grad(bo) {
		return bo.copyMult(-1)
	}
}

NegativeLayer.registLayer()
