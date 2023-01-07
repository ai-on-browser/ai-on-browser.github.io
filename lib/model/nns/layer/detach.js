import Layer from './base.js'

/**
 * Detach layer
 */
export default class DetachLayer extends Layer {
	calc(x) {
		return x
	}

	grad(bo) {
		const bi = bo.copy()
		bi.map(() => 0)
		return bi
	}
}

DetachLayer.registLayer()
