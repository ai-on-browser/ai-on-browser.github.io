import Layer from './base.js'

/**
 * Power layer
 */
export default class PowerLayer extends Layer {
	calc(x, p) {
		this._i = x
		this._p = p
		const o = x.copy()
		o.broadcastOperate(p, (a, b) => a ** b)
		return o
	}

	grad(bo) {
		const idx = Array(bo.sizes.length).fill(0)
		const xbi = this._i.copy()
		xbi.fill(0)
		const pbi = this._p.copy()
		pbi.fill(0)
		const xdimdiff = bo.dimension - this._i.dimension
		const pdimdiff = bo.dimension - this._p.dimension
		do {
			const xp = idx.slice(xdimdiff).map((v, i) => v % this._i.sizes[i])
			const xv = this._i.at(xp)
			const pp = idx.slice(pdimdiff).map((v, i) => v % this._p.sizes[i])
			const pv = this._p.at(pp)
			const bov = bo.at(idx)
			xbi.operateAt(xp, v => v + pv * xv ** (pv - 1) * bov)
			pbi.operateAt(pp, v => v + xv ** pv * Math.log(xv) * bov)
			for (let i = 0; i < idx.length; i++) {
				idx[i]++
				if (idx[i] < bo.sizes[i]) {
					break
				}
				idx[i] = 0
			}
		} while (idx.some(v => v > 0))
		return [xbi, pbi]
	}
}

PowerLayer.registLayer()
