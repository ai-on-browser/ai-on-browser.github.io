import Layer from './base.js'
import { Matrix } from '../../util/math.js'

export default class MultLayer extends Layer {
	calc(...x) {
		this._i = x
		let m = x[0].copy()
		for (let i = 1; i < x.length; i++) {
			m.mult(x[i])
		}
		return m
	}

	grad(bo) {
		return this._i.map((x, k) => {
			const s = x.sizes
			const t = bo.copy()
			for (let j = 0; j < this._i.length; j++) {
				if (k === j) continue
				t.mult(this._i[j])
			}
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
