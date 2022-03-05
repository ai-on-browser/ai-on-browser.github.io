import Layer from './base.js'
import Matrix from '../../../util/matrix.js'

export default class DivLayer extends Layer {
	calc(...x) {
		this._i = x
		this._den = x[1].copy()
		for (let i = 2; i < x.length; i++) {
			this._den.mult(x[i])
		}
		return Matrix.div(x[0], this._den)
	}

	grad(bo) {
		const nNeg = Matrix.mult(this._i[0], -1)
		nNeg.div(this._den)
		nNeg.div(this._den)
		nNeg.mult(bo)
		return this._i.map((x, k) => {
			const s = x.sizes
			let t
			if (k === 0) {
				t = Matrix.div(bo, this._den)
			} else {
				t = nNeg.copy()
				for (let j = 1; j < this._i.length; j++) {
					if (k === j) continue
					t.mult(this._i[j])
				}
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

DivLayer.registLayer()
