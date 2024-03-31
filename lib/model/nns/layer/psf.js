import Layer from './base.js'

/**
 * Parametric sigmoid function layer
 */
export default class ParametricSigmoidFunctionLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number} [config.m] m
	 */
	constructor({ m = 2, ...rest }) {
		super(rest)
		this._m = m
	}

	calc(x) {
		this._s = x.copy()
		this._s.map(v => 1 / (1 + Math.exp(-v)))
		const o = this._s.copy()
		o.map(v => v ** this._m)
		return o
	}

	grad(bo) {
		const bi = bo.copy()
		bi.broadcastOperate(this._s, (a, b) => a * (this._m * b ** this._m * (1 - b)))
		return bi
	}

	toObject() {
		return {
			type: 'psf',
			m: this._m,
		}
	}
}

ParametricSigmoidFunctionLayer.registLayer('psf')
