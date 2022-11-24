import Layer from './base.js'

export default class BimodalDerivativeAdaptiveActivationLayer extends Layer {
	constructor({ alpha = 1, ...rest }) {
		super(rest)
		this._alpha = alpha
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => (1 / (1 + Math.exp(-v)) - 1 / (1 + Math.exp(-v - this._alpha))) / 2)
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(
			this._i,
			(a, b) =>
				(a *
					(Math.exp(-b) / (1 + Math.exp(-b)) ** 2 -
						Math.exp(-b - this._alpha) / (1 + Math.exp(-b - this._alpha)) ** 2)) /
				2
		)
		return bi
	}

	update(optimizer) {
		let s = 0
		for (let i = 0; i < this._i.length; i++) {
			s +=
				(this._bo.value[i] *
					(-Math.exp(-this._i.value[i] - this._alpha) /
						(1 + Math.exp(-this._i.value[i] - this._alpha)) ** 2)) /
				2
		}
		this._alpha -= optimizer.delta('alpha', s / this._i.length)
	}

	toObject() {
		return {
			type: 'bdaa',
			alpha: this._alpha,
		}
	}
}

BimodalDerivativeAdaptiveActivationLayer.registLayer('bdaa')
