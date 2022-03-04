import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

export default class DetachLayer extends Layer {
	calc(x) {
		return x
	}

	grad(bo) {
		const bi = Matrix.map(bo, v => 0)
		return bi
	}
}

DetachLayer.registLayer()
