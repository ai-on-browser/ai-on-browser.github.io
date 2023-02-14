import Layer from './base.js'

/**
 * Min layer
 */
export default class MinLayer extends Layer {
	calc(...x) {
		this._i = x
		const m = x[0].copy()
		for (let i = 1; i < x.length; i++) {
			m.broadcastOperate(x[i], (a, b) => Math.min(a, b))
		}
		return m
	}

	grad(bo) {
		const bi = this._i.map(x => {
			const m = x.copy()
			m.fill(0)
			return m
		})
		const idx = Array(bo.sizes.length).fill(0)
		do {
			let min_v = Infinity
			let min_p = null
			let min_k = -1
			for (let k = 0; k < bi.length; k++) {
				const p = idx.map((v, i) => v % this._i[k].sizes[i])
				const v = this._i[k].at(p)
				if (min_v > v) {
					min_v = v
					min_p = p
					min_k = k
				}
			}
			bi[min_k].operateAt(min_p, v => v + bo.at(idx))
			for (let i = 0; i < idx.length; i++) {
				idx[i]++
				if (idx[i] < bo.sizes[i]) {
					break
				}
				idx[i] = 0
			}
		} while (idx.some(v => v > 0))
		return bi
	}
}

MinLayer.registLayer()
