import Layer from './base.js'

/**
 * Shifted ReLU layer
 */
export default class ShiftedReLULayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number} [config.d] d
	 */
	constructor({ d = 0, ...rest }) {
		super(rest)
		this._d = d
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => (v > this._d ? v : this._d))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => (b > this._d ? a : 0))
		return bi
	}

	update(optimizer) {
		let s = 0
		for (let i = 0; i < this._i.length; i++) {
			if (this._i.value[i] > 0) {
				continue
			}
			s += this._bo.value[i]
		}
		this._d -= optimizer.delta('delta', s)
	}

	toObject() {
		return {
			type: 'srelu',
			d: this._d,
		}
	}
}

ShiftedReLULayer.registLayer('srelu')
