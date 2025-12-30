import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'
import Layer from './base.js'

/**
 * Readout layer
 */
export default class ReadoutLayer extends Layer {
	/**
	 * @param {object} config config
	 * @param {'sum' | 'mean'} [config.method] Aggregate method
	 */
	constructor({ method = 'mean', ...rest }) {
		super(rest)
		this._method = method
	}

	calc(x) {
		this._i = x
		const sizes = x.value[0].nodes[0].sizes.concat()
		while (sizes[0] === 1) {
			sizes.splice(0, 1)
		}
		const outsizes = [...x.sizes, ...sizes]
		if (outsizes.length === 2) {
			this._o = Matrix.zeros(...outsizes)
		} else {
			this._o = Tensor.zeros(outsizes)
		}
		const idx = Array(x.dimension).fill(0)
		do {
			const g = x.at(idx)
			let v = null
			for (let i = 0; i < g.order; i++) {
				if (!v) {
					v = g.nodes[i].copy()
				} else {
					v.broadcastOperate(g.nodes[i], (a, b) => a + b)
				}
			}
			v = Tensor.fromArray(v)
			v.reshape(...sizes)
			if (this._method === 'mean') {
				v.map(v => v / g.order)
			}

			const cidx = Array(sizes.length).fill(0)
			do {
				this._o.set([...idx, ...cidx], v.at(cidx))
				for (let k = 0; k < cidx.length; k++) {
					cidx[k]++
					if (cidx[k] < sizes[k]) {
						break
					}
					cidx[k] = 0
				}
			} while (cidx.some(v => v > 0))
			for (let k = 0; k < idx.length; k++) {
				idx[k]++
				if (idx[k] < x.sizes[k]) {
					break
				}
				idx[k] = 0
			}
		} while (idx.some(v => v > 0))
		return this._o
	}

	grad(bo) {
		bo = Tensor.fromArray(bo)
		const sizes = this._i.value[0].nodes[0].sizes
		this._bi = this._i.copy()
		const idx = Array(this._i.dimension).fill(0)
		do {
			const m = bo.index(idx)
			const g = this._i.at(idx).copy()
			for (let i = 0; i < g.order; i++) {
				g.nodes[i] = m.copy()
				if (this._method === 'mean') {
					g.nodes[i].map(v => v / g.order)
				}
				g.nodes[i].reshape(...sizes)
				if (sizes.length === 2) {
					g.nodes[i] = g.nodes[i].toMatrix()
				}
			}
			this._bi.set(idx, g)
			for (let k = 0; k < idx.length; k++) {
				idx[k]++
				if (idx[k] < this._i.sizes[k]) {
					break
				}
				idx[k] = 0
			}
		} while (idx.some(v => v > 0))
		return this._bi
	}

	toObject() {
		return {
			type: 'readout',
			method: this._method,
		}
	}
}

ReadoutLayer.registLayer()
