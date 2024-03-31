import Layer from './base.js'

/**
 * Rectified power unit layer
 */
export default class RectifiedPowerUnitLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {number} [config.s] s
	 */
	constructor({ s = 2, ...rest }) {
		super(rest)
		this._s = s
	}

	calc(x) {
		this._i = x
		const o = x.copy()
		o.map(v => (v >= 0 ? v ** this._s : 0))
		return o
	}

	grad(bo) {
		this._bo = bo
		const bi = bo.copy()
		bi.broadcastOperate(this._i, (a, b) => a * (b >= 0 ? this._s * b ** (this._s - 1) : 0))
		return bi
	}

	toObject() {
		return {
			type: 'repu',
			s: this._s,
		}
	}
}

RectifiedPowerUnitLayer.registLayer('repu')
