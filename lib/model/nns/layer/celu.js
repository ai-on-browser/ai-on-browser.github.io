import Layer from './base.js'

export default class ContinuouslyDifferentiableELULayer extends Layer {
	constructor({ a = 1.0, ...rest }) {
		super(rest)
		this._a = a
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => (v > 0 ? v : this._a * (Math.exp(v / this._a) - 1)))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => a * (b > 0 ? 1 : Math.exp(b)))
		return bi
	}

	toObject() {
		return {
			type: 'celu',
			a: this._a,
		}
	}
}

ContinuouslyDifferentiableELULayer.registLayer('celu')
