import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

export default class MeanLayer extends Layer {
	constructor({ axis = -1, ...rest }) {
		super(rest)
		this._axis = axis
	}

	calc(x) {
		this._i = x
		if (this._axis < 0) {
			return new Matrix(1, 1, x.reduce((s, v) => s + v, 0) / x.length)
		}
		const o = x.reduce((s, v) => s + v, 0, this._axis, true)
		o.map(v => v / x.sizes[this._axis])
		return o
	}

	grad(bo) {
		if (this._axis < 0) {
			const bi = this._i.copy()
			bi.fill(bo.toScaler() / this._i.length)
			return bi
		}
		const bi = this._i.copy()
		bi.broadcastOperate(bo, (a, b) => b / this._i.sizes[this._axis])
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
