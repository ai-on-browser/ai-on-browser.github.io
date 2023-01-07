import Layer from './base.js'

/**
 * Linear layer
 */
export default class LinearLayer extends Layer {
	calc(x) {
		return x
	}

	grad(bo) {
		return bo
	}
}

LinearLayer.registLayer()
