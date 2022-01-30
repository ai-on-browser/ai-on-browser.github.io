import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

export default class StdLayer extends Layer {
	constructor({ axis = -1, ...rest }) {
		super(rest)
		this._axis = axis
	}

	calc(x) {
		this._i = x
		this._m = x.mean(this._axis)
		if (this._axis < 0) {
			this._o = x.std()
			return new Matrix(1, 1, this._o)
		}
		this._o = x.std(this._axis)
		return this._o
	}

	grad(bo) {
		if (this._axis < 0) {
			return this._i.copyMap(v => (bo.toScaler() * (v - this._m)) / (this._o * this._i.length))
		}
		const bi = this._i.copySub(this._m)
		bi.sub(this._m)
		bi.mult(1 / this._i.sizes[this._axis])
		bi.mult(this._o.copyMap(v => 1 / v))
		bi.mult(bo)
		return bi
	}

	toObject() {
		return {
			type: 'std',
			axis: this._axis,
		}
	}
}

StdLayer.registLayer('std')
