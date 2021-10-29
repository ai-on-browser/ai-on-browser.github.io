import Layer from './base.js'
import { Matrix } from '../../util/math.js'

export default class SubLayer extends Layer {
	calc(...x) {
		this._sizes = x.map(m => m.sizes)
		let m = x[0].copy()
		for (let i = 1; i < x.length; i++) {
			m.sub(x[i])
		}
		return m
	}

	grad(bo) {
		const boNeg = bo.copyMap(v => -v)
		return this._sizes.map((s, k) => {
			const t = k === 0 ? bo : boNeg
			const repeats = t.sizes.map((ts, i) => ts / s[i])
			if (repeats.every(r => r === 1)) {
				return t
			}
			const m = Matrix.zeros(s[0], s[1])
			for (let i = 0; i < t.sizes[0]; i++) {
				for (let j = 0; j < t.sizes[1]; j++) {
					m.addAt(i % s[0], j % s[1], t.at(i, j))
				}
			}
			return m
		})
	}
}

SubLayer.registLayer()
