import Layer from './base.js'

export default class ESwishLayer extends Layer {
	constructor({ beta = 1, ...rest }) {
		super(rest)
		this._beta = beta
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => (this._beta * v) / (1 + Math.exp(-v)))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(
			this._i,
			(a, b) => (a * this._beta * (1 + (b * Math.exp(-b)) / (1 + Math.exp(-b)))) / (1 + Math.exp(-b))
		)
		return bi
	}

	update(optimizer) {
		let s = 0
		for (let i = 0; i < this._i.length; i++) {
			s += this._bo.value[i] * (this._i.value[i] / (1 + Math.exp(-this._i.value[i])))
		}
		this._beta -= optimizer.delta('beta', s / this._i.length)
	}

	toObject() {
		return {
			type: 'eswish',
			beta: this._beta,
		}
	}
}

ESwishLayer.registLayer('eswish')
