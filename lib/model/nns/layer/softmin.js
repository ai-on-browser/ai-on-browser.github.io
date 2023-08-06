import Layer from './base.js'

/**
 * Softmin layer
 */
export default class SoftminLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} [config.axis] Axis
	 */
	constructor({ axis = -1, ...rest }) {
		super(rest)
		this._axis = axis
	}

	calc(x) {
		const axis = this._axis < 0 ? this._axis + x.dimension : this._axis
		this._o = x.copy()
		const m = this._o.reduce((s, v) => Math.min(s, v), Infinity, axis, true)
		this._o.broadcastOperate(m, (o, m) => m - o)
		this._o.map(Math.exp)
		const s = this._o.reduce((s, v) => s + v, 0, axis, true)
		this._o.broadcastOperate(s, (o, s) => o / s)
		return this._o
	}

	grad(bo) {
		this._bi = bo.copy()
		const axis = this._axis < 0 ? this._axis + bo.dimension : this._axis
		const idx = Array(bo.dimension).fill(0)
		do {
			for (let i = 0; i < bo.sizes[axis]; i++) {
				idx[axis] = i
				const oki = this._o.at(idx)
				let bki = 0

				const idx2 = idx.concat()
				for (let j = 0; j < bo.sizes[axis]; j++) {
					idx2[axis] = j
					const v = i === j ? oki - 1 : oki
					bki += this._o.at(idx2) * v * bo.at(idx2)
				}
				this._bi.set(idx, bki)
			}

			for (let i = 0; i < idx.length; i++) {
				if (i === axis) {
					idx[i] = 0
					continue
				}
				idx[i]++
				if (idx[i] < bo.sizes[i]) {
					break
				}
				idx[i] = 0
			}
		} while (idx.some(v => v > 0))
		return this._bi
	}

	toObject() {
		return {
			type: 'softmin',
			axis: this._axis,
		}
	}
}

SoftminLayer.registLayer()
