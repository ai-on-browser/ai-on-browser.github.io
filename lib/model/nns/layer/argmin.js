import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'
import Layer from './base.js'

/**
 * Argmin layer
 */
export default class ArgminLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} [config.axis] Axis
	 * @param {boolean} [config.keepdims] Keep dimensions
	 */
	constructor({ axis = -1, keepdims = true, ...rest }) {
		super(rest)
		this._axis = axis
		this._keepdims = keepdims
	}

	calc(x) {
		if (!this._keepdims && x instanceof Matrix) {
			x = Tensor.fromArray(x)
		}
		this._i = x
		const axis = this._axis < 0 ? this._axis + x.dimension : this._axis
		this._o = this._i.reduce((s, v, i) => (s[0] > v ? [v, i[axis]] : s), [Infinity, -1], axis, this._keepdims)
		this._o.map(v => v[1])
		return this._o
	}

	grad(bo) {
		const axis = this._axis < 0 ? this._axis + this._i.dimension : this._axis
		this._bo = bo.copy()
		if (this._bo.dimension !== this._i.dimension) {
			const newsize = this._bo.sizes.concat()
			newsize.splice(axis, 0, 1)
			this._bo.reshape(...newsize)
		}
		this._bo.repeat(this._i.sizes[axis], axis)
		const msize = Array(this._i.dimension).fill(1)
		msize[axis] = this._i.sizes[axis]
		const ma = new Tensor(
			msize,
			Array.from({ length: this._i.sizes[axis] }, (_, k) => k)
		)
		this._bo.broadcastOperate(ma, (a, b) => a * b)

		const o = this._i.copy()
		const m = o.reduce((s, v) => Math.max(s, v), -Infinity, axis, true)
		o.broadcastOperate(m, (o, m) => m - o)
		o.map(Math.exp)
		const s = o.reduce((s, v) => s + v, 0, axis, true)
		o.broadcastOperate(s, (o, s) => o / s)

		this._bi = this._bo.copy()
		const idx = Array(this._i.dimension).fill(0)
		do {
			for (let i = 0; i < this._i.sizes[axis]; i++) {
				idx[axis] = i
				const oki = o.at(idx)
				let bki = 0

				const idx2 = idx.concat()
				for (let j = 0; j < this._i.sizes[axis]; j++) {
					idx2[axis] = j
					const v = i === j ? oki - 1 : oki
					bki += o.at(idx2) * v * this._bo.at(idx2)
				}
				this._bi.set(idx, bki)
			}

			for (let i = 0; i < idx.length; i++) {
				if (i === axis) {
					idx[i] = 0
					continue
				}
				idx[i]++
				if (idx[i] < this._i.sizes[i]) {
					break
				}
				idx[i] = 0
			}
		} while (idx.some(v => v > 0))
		return this._bi
	}

	toObject() {
		return {
			type: 'argmin',
			axis: this._axis,
			keepdims: this._keepdims,
		}
	}
}

ArgminLayer.registLayer()
