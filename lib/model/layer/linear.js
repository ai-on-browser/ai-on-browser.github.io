import Layer from './base.js'

export default class LinearLayer extends Layer {
	calc(x) {
		return x
	}

	grad(bo) {
		return bo
	}
}
