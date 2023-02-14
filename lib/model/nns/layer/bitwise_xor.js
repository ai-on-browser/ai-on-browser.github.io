import Layer from './base.js'

/**
 * Bitwise Xor layer
 */
export default class BitwiseXorLayer extends Layer {
	calc(...x) {
		this._i = x
		this._o = x[0].copy()
		this._o.broadcastOperate(x[1], (a, b) => a ^ b)
		return this._o
	}

	grad() {
		return this._i.map(v => {
			const bi = v.copy()
			bi.fill(0)
			return bi
		})
	}
}

BitwiseXorLayer.registLayer()
