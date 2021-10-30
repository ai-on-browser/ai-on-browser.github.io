import Layer from './base.js'
import { Matrix } from '../../util/math.js'

export default class MeanLayer extends Layer {
	constructor({ axis = -1, ...rest }) {
		super(rest)
		this._axis = axis
	}

	calc(x) {
		this._i = x
		if (this._axis < 0) {
			return new Matrix(1, 1, x.mean())
		}
		return x.mean(this._axis)
	}

	grad(bo) {
		if (this._axis < 0) {
			return new Matrix(this._i.rows, this._i.cols, bo.value[0] / this._i.length)
		}
		const bi = bo.copyRepeat(this._i.sizes[this._axis], this._axis)
		bi.div(this._i.sizes[this._axis])
		return bi
	}

	toObject() {
		return {
			type: 'mean',
			axis: this._axis,
		}
	}
}

MeanLayer.registLayer()
