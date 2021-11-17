import Layer from './base.js'
import { Matrix } from '../../util/math.js'

export default class SumLayer extends Layer {
	constructor({ axis = -1, ...rest }) {
		super(rest)
		this._axis = axis
	}

	calc(x) {
		this._i = x
		if (this._axis < 0) {
			return new Matrix(1, 1, x.sum())
		}
		return x.sum(this._axis)
	}

	grad(bo) {
		if (this._axis < 0) {
			return new Matrix(this._i.rows, this._i.cols, bo.toScaler())
		}
		return bo.copyRepeat(this._i.sizes[this._axis], this._axis)
	}

	toObject() {
		return {
			type: 'sum',
			axis: this._axis,
		}
	}
}

SumLayer.registLayer()
