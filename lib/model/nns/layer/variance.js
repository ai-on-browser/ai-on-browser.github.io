import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

export default class VarLayer extends Layer {
	constructor({ axis = -1, ...rest }) {
		super(rest)
		this._axis = axis
	}

	calc(x) {
		this._i = x
		if (this._axis < 0) {
			this._m = x.reduce((s, v) => s + v, 0, this._axis) / x.length
			return new Matrix(1, 1, x.reduce((s, v) => s + (v - this._m) ** 2, 0) / x.length)
		}
		this._m = x.reduce((s, v) => s + v, 0, this._axis, true)
		this._m.map(v => v / x.sizes[this._axis])
		const d = x.copy()
		d.broadcastOperate(this._m, (a, b) => a - b)
		const o = d.reduce((s, v) => s + v ** 2, 0, this._axis, true)
		o.map(v => v / x.sizes[this._axis])
		return o
	}

	grad(bo) {
		if (this._axis < 0) {
			const bi = this._i.copy()
			bi.map(v => (bo.toScaler() * (2 * (v - this._m))) / this._i.length)
			return bi
		}
		const bi = this._i.copy()
		bi.broadcastOperate(this._m, (a, b) => (2 * (a - b)) / this._i.sizes[this._axis])
		bi.broadcastOperate(bo, (a, b) => a * b)
		return bi
	}

	toObject() {
		return {
			type: 'variance',
			axis: this._axis,
		}
	}
}

VarLayer.registLayer('variance')
