import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'
import Layer from './base.js'

/**
 * Embedding layer
 */
export default class EmbeddingLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} [config.size=512] size
	 * @param {object} [config.embeddings] embedding vectors
	 */
	constructor({ size = 512, embeddings = {}, ...rest }) {
		super(rest)
		this._size = size
		this._v = embeddings
	}

	calc(x) {
		this._i = x
		const size = [...x.sizes, this._size]
		const o = size.length === 2 ? new Matrix(...size) : new Tensor(size)
		for (let i = 0; i < x.length; i++) {
			if (!this._v[x.value[i]]) {
				this._v[x.value[i]] = Matrix.randn(1, this._size)
			}
			for (let k = 0; k < this._size; k++) {
				o.value[i * this._size + k] = this._v[x.value[i]].at(0, k)
			}
		}
		return o
	}

	grad(bo) {
		this._dw = {}
		for (let i = 0; i < this._i.length; i++) {
			for (let k = 0; k < this._size; k++) {
				if (!this._dw[this._i.value[i]]) {
					this._dw[this._i.value[i]] = Matrix.zeros(1, this._size)
				}
				this._dw[this._i.value[i]].add(
					new Matrix(1, this._size, bo.value.slice(i * this._size, (i + 1) * this._size))
				)
			}
		}
		const bi = this._i.copy()
		bi.fill(0)
		return bi
	}

	update(optimizer) {
		for (const w of Object.keys(this._dw)) {
			this._v[w].sub(optimizer.delta(w, this._dw[w]))
		}
	}

	toObject() {
		return {
			type: 'embedding',
			size: this._size,
			embeddings: this._v,
		}
	}
}

EmbeddingLayer.registLayer()
