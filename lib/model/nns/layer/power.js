import Layer from './base.js'

export default class PowerLayer extends Layer {
	constructor({ n, ...rest }) {
		super(rest)
		this._n = n
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => v ** this._n)
		return o
	}

	grad(bo) {
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => a * this._n * b ** (this._n - 1))
		return bi
	}

	toObject() {
		return {
			type: 'power',
			n: this._n,
		}
	}
}

PowerLayer.registLayer()
