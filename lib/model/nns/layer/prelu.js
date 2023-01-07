import Layer from './base.js'

/**
 * Parametric ReLU layer
 */
export default class ParametricReLULayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number} [config.a=0.25] a
	 */
	constructor({ a = 0.25, ...rest }) {
		super(rest)
		this._a = a
		this._da = 0
	}

	calc(x) {
		this._i = x
		this._o = x.copy()
		this._o.map(v => (v > 0 ? v : this._a * v))
		return this._o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => a * (b > 0 ? 1 : this._a))
		return bi
	}

	update(optimizer) {
		let s = 0
		for (let i = 0; i < this._i.length; i++) {
			if (this._i.value[i] < 0) {
				s += this._bo.value[i] * this._i.value[i]
			}
		}
		const myu = 0.1
		this._da = myu * this._da + (optimizer.lr * s) / this._i.length
		this._a -= this._da
	}

	toObject() {
		return {
			type: 'prelu',
			a: this._a,
		}
	}
}

ParametricReLULayer.registLayer('prelu')
