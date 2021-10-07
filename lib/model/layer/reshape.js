import Layer from './base.js'

export default class ReshapeLayer extends Layer {
	constructor({ size, ...rest }) {
		super(rest)
		this._size = size
	}

	calc(x) {
		this._in_size = x.sizes.concat()
		this._out_size = [x.sizes[0], ...this._size]
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
		return bi
	}
}
