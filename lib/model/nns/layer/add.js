import Layer from './base.js'

/**
 * Add layer
 */
export default class AddLayer extends Layer {
	calc(...x) {
		this._i = x
		const m = x[0].copy()
		for (let i = 1; i < x.length; i++) {
			m.broadcastOperate(x[i], (a, b) => a + b)
		}
		return m
	}

	grad(bo) {
		return this._i.map(x => {
			const s = x.sizes
			const repeats = bo.sizes.map((bs, i) => bs / s[i])
			if (repeats.every(r => r === 1)) {
				return bo
			}

			const m = x.copy()
			m.fill(0)
			const idx = Array(bo.sizes.length).fill(0)
			do {
				const p = idx.map((v, i) => v % s[i])
				m.operateAt(p, v => v + bo.at(idx))
				for (let i = 0; i < idx.length; i++) {
					idx[i]++
					if (idx[i] < bo.sizes[i]) {
						break
					}
					idx[i] = 0
				}
			} while (idx.some(v => v > 0))
			return m
		})
	}
}

AddLayer.registLayer()
