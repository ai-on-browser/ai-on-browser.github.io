import Layer from './base.js'
import Tensor from '../../../util/tensor.js'
import Matrix from '../../../util/matrix.js'

export default class ReshapeLayer extends Layer {
	constructor({ size, ...rest }) {
		super(rest)
		this._size = size
	}

	calc(x) {
		this._in_size = x.sizes.concat()
		if (typeof this._size === 'string') {
			const sizes = this.graph.getNode(this._size).lastOutputSize
			this._out_size = sizes
		} else {
			this._out_size = this._size
		}
		if (
			this._out_size.length === 1 ||
			this._in_size.slice(1).reduce((s, v) => s * v, 1) === this._out_size.reduce((s, v) => s * v, 1)
		) {
			this._out_size = [x.sizes[0], ...this._out_size]
		}
		const o = this._out_size.length === 2 ? x.copy() : Tensor.fromArray(x.copy())
		o.reshape(...this._out_size)
		if (o instanceof Tensor && o.dimension === 2) {
			return o.toMatrix()
		}
		return o
	}

	grad(bo) {
		let bi = bo.copy()
		if (bi instanceof Matrix && this._in_size.length > 2) {
			bi = Tensor.fromArray(bi)
		}
		bi.reshape(...this._in_size)
		if (bi instanceof Tensor && this._in_size.length === 2) {
			bi = bi.toMatrix()
		}
		return bi
	}

	toObject() {
		return {
			type: 'reshape',
			size: this._size,
		}
	}
}

ReshapeLayer.registLayer()
