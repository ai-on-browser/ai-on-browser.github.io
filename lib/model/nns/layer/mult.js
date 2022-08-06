import Layer from './base.js'

export default class MultLayer extends Layer {
	calc(...x) {
		this._i = x
		let m = x[0].copy()
		for (let i = 1; i < x.length; i++) {
			m.broadcastOperate(x[i], (a, b) => a * b)
		}
		return m
	}

	grad(bo) {
		return this._i.map((x, k) => {
			const s = x.sizes
			const t = bo.copy()
			for (let j = 0; j < this._i.length; j++) {
				if (k === j) continue
				t.broadcastOperate(this._i[j], (a, b) => a * b)
			}
			const repeats = t.sizes.map((ts, i) => ts / s[i])
			if (repeats.every(r => r === 1)) {
				return t
			}

			const m = x.copy()
			m.fill(0)
			const idx = Array(t.sizes.length).fill(0)
			do {
				const p = idx.map((v, i) => v % s[i])
				m.operateAt(p, v => v + t.at(idx))
				for (let i = 0; i < idx.length; i++) {
					idx[i]++
					if (idx[i] < t.sizes[i]) {
						break
					}
					idx[i] = 0
				}
			} while (idx.some(v => v > 0))
			return m
		})
	}
}

MultLayer.registLayer()
