import Layer from './base.js'

export default class OutputLayer extends Layer {
	calc(x) {
		return x
	}

	grad(bo) {
		return bo
	}
}

OutputLayer.registLayer()
