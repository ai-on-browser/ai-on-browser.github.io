import Layer from './base.js'

/**
 * Output layer
 */
export default class OutputLayer extends Layer {
	calc(x) {
		return x
	}

	grad(bo) {
		return bo
	}
}

OutputLayer.registLayer()
