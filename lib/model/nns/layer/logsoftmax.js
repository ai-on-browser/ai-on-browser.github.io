import Layer from './base.js'

/**
 * Log softmax layer
 */
export default class LogSoftmaxLayer extends Layer {
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
		this._s = x.copy()
		const m = this._s.reduce((s, v) => Math.max(s, v), -Infinity, axis, true)
		this._s.broadcastOperate(m, (o, m) => o - m)
		this._s.map(Math.exp)
		const s = this._s.reduce((s, v) => s + v, 0, axis, true)
		this._s.broadcastOperate(s, (o, s) => o / s)

		this._o = this._s.copy()
		this._o.map(Math.log)
		return this._o
	}

	grad(bo) {
		this._bi = bo.copy()
		const axis = this._axis < 0 ? this._axis + bo.dimension : this._axis
		const idx = Array(bo.dimension).fill(0)
		do {
			for (let i = 0; i < bo.sizes[axis]; i++) {
				idx[axis] = i
				const oki = this._s.at(idx)
				let bki = 0

				const idx2 = idx.concat()
				for (let j = 0; j < bo.sizes[axis]; j++) {
					idx2[axis] = j
					const v = i === j ? 1 - oki : -oki
					bki += v * bo.at(idx2)
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
			type: 'log_softmax',
			axis: this._axis,
		}
	}
}

LogSoftmaxLayer.registLayer()
