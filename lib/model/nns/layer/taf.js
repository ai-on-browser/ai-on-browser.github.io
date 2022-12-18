import Layer from './base.js'

export default class TrainableAFLayer extends Layer {
	constructor({ a = 0, b = 0, ...rest }) {
		super(rest)
		this._a = a
		this._b = b
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => Math.sqrt((v - this._a) ** 2 + this._b ** 2))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => (a * (b - this._a)) / Math.sqrt((b - this._a) ** 2 + this._b ** 2))
		return bi
	}

	update(optimizer) {
		let sa = 0
		let sb = 0
		for (let i = 0; i < this._i.length; i++) {
			sa +=
				this._bo.value[i] *
				((this._a - this._i.value[i]) / Math.sqrt((this._i.value[i] - this._a) ** 2 + this._b ** 2))
			sb += this._bo.value[i] * (this._b / Math.sqrt((this._i.value[i] - this._a) ** 2 + this._b ** 2))
		}
		this._a -= optimizer.delta('a', sa / this._i.length)
		this._b -= optimizer.delta('b', sb / this._i.length)
	}

	toObject() {
		return {
			type: 'taf',
			a: this._a,
			b: this._b,
		}
	}
}

TrainableAFLayer.registLayer('taf')
