import Layer from './base.js'
import { Matrix } from '../../util/math.js'

export default class RandomLayer extends Layer {
	constructor({ size, ...rest }) {
		super(rest)
		this._size = size
		this._rows = 1
	}

	bind({ n }) {
		this._rows = n
	}

	calc() {
		return Matrix.randn(this._rows, this._size)
	}

	grad(bo) {}
}
