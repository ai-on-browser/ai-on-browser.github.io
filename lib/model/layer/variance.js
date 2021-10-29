import Layer from './base.js'
import { Matrix } from '../../util/math.js'

export default class VarLayer extends Layer {
	constructor({ axis = -1, ...rest }) {
		super(rest)
		this._axis = axis
	}

	calc(x) {
		this._i = x
		this._m = x.mean(this._axis)
		if (this._axis < 0) {
			return new Matrix(1, 1, x.variance())
		}
		return x.variance(this._axis)
	}

	grad(bo) {
		if (this._axis < 0) {
			return this._i.copyMap(v => (bo.value[0] * (2 * (v - this._m))) / this._i.length)
		}
		const bi = this._i.copySub(this._m)
		bi.mult(2 / this._i.sizes[this._axis])
		bi.mult(bo)
		return bi
	}
}

VarLayer.registLayer('variance')
