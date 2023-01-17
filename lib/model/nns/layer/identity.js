import Layer from './base.js'

/**
 * Identity layer
 */
export default class IdentityLayer extends Layer {
	calc(x) {
		return x
	}

	grad(bo) {
		return bo
	}
}

IdentityLayer.registLayer()
