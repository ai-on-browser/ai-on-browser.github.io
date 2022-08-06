import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

export default class StdLayer extends Layer {
	constructor({ axis = -1, ...rest }) {
		super(rest)
		this._axis = axis
	}

	calc(x) {
		this._i = x
		if (this._axis < 0) {
			this._m = x.reduce((s, v) => s + v, 0, this._axis) / x.length
			this._o = Math.sqrt(x.reduce((s, v) => s + (v - this._m) ** 2, 0) / x.length)
			return new Matrix(1, 1, this._o)
		}
		this._m = x.reduce((s, v) => s + v, 0, this._axis, true)
		this._m.map(v => v / x.sizes[this._axis])
		const d = x.copy()
		d.broadcastOperate(this._m, (a, b) => a - b)
		this._o = d.reduce((s, v) => s + v ** 2, 0, this._axis, true)
		this._o.map(v => Math.sqrt(v / x.sizes[this._axis]))
		return this._o
	}

	grad(bo) {
		if (this._axis < 0) {
			const bi = this._i.copy()
			bi.map(v => (bo.toScaler() * (v - this._m)) / (this._o * this._i.length))
			return bi
		}
		const bi = this._i.copy()
		bi.broadcastOperate(this._m, (a, b) => (a - b) / this._i.sizes[this._axis])
		bi.broadcastOperate(this._o, (a, b) => a / b)
		bi.broadcastOperate(bo, (a, b) => a * b)
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
