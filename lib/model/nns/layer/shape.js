import Layer from './base.js'
import Tensor from '../../../util/tensor.js'
import Matrix from '../../../util/matrix.js'

/**
 * Shape layer
 */
export default class ShapeLayer extends Layer {
	calc(x) {
		this._i = x
		this._size = x.sizes.concat()
		return Tensor.fromArray(this._size)
	}

	grad() {
		if (this._size.length === 2) {
			return Matrix.zeros(this._size)
		}
		return Tensor.zeros(this._size)
	}
}

ShapeLayer.registLayer()
