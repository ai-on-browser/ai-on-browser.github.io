import Layer from './base.js'
import Tensor from '../../../util/tensor.js'
import Matrix from '../../../util/matrix.js'

/**
 * Flatten layer
 */
export default class FlattenLayer extends Layer {
	calc(x) {
		this._in_size = x.sizes.concat()
		if (x instanceof Matrix) {
			return x
		}
		const c = x.copy()
		c.reshape(c.sizes[0], c.length / c.sizes[0])
		return c.toMatrix()
	}

	grad(bo) {
		if (this._in_size.length === 2) {
			return bo
		}
		const bi = Tensor.fromArray(bo.copy())
		bi.reshape(...this._in_size)
		return bi
	}
}

FlattenLayer.registLayer()
