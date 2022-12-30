import Layer from './base.js'

export default class DivLayer extends Layer {
	calc(...x) {
		this._i = x
		this._den = x[1].copy()
		for (let i = 2; i < x.length; i++) {
			this._den.broadcastOperate(x[i], (a, b) => a * b)
		}
		const o = x[0].copy()
		o.broadcastOperate(this._den, (a, b) => a / b)
		return o
	}

	grad(bo) {
		const nNeg = this._i[0].copy()
		nNeg.map(v => -v)
		nNeg.broadcastOperate(this._den, (a, b) => a / b ** 2)
		nNeg.broadcastOperate(bo, (a, b) => a * b)
		return this._i.map((x, k) => {
			const s = x.sizes
			let t
			if (k === 0) {
				t = bo.copy()
				t.broadcastOperate(this._den, (a, b) => a / b)
			} else {
				t = nNeg.copy()
				for (let j = 1; j < this._i.length; j++) {
					if (k === j) continue
					t.broadcastOperate(this._i[j], (a, b) => a * b)
				}
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

DivLayer.registLayer()
