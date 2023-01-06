import Layer from './base.js'

/**
 * Matrix multiply layer
 */
export default class MatmulLayer extends Layer {
	calc(...x) {
		this._i = x
		let o = x[0]
		for (let i = 1; i < x.length; i++) {
			o = o.dot(x[i])
		}
		return o
	}

	grad(bo) {
		const bi = []
		for (let i = 0; i < this._i.length; i++) {
			let m = null
			if (i === 0) {
				m = bo
			} else {
				m = this._i[0]
				for (let k = 1; k < i; k++) {
					m = m.dot(this._i[k])
				}
				m = m.tDot(bo)
			}
			for (let k = this._i.length - 1; k > i; k--) {
				m = m.dot(this._i[k].t)
			}
			bi.push(m)
		}
		return bi
	}
}

MatmulLayer.registLayer()
