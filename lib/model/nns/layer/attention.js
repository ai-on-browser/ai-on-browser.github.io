import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'
import Layer from './base.js'

/**
 * Attention layer
 */
export default class AttentionLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} [config.dk] Inner depth size
	 * @param {number} [config.dv] Output depth size
	 * @param {number[][] | Matrix | string} [config.wq] Weight of q
	 * @param {number[][] | Matrix | string} [config.wk] Weight of k
	 * @param {number[][] | Matrix | string} [config.wv] Weight of v
	 */
	constructor({ dk = null, dv = null, wq = null, wk = null, wv = null, ...rest }) {
		super(rest)
		this._dk = dk
		this._dv = dv
		this._wq = null
		if (typeof wq === 'string') {
			this._wqname = wq
		} else if (wq) {
			this._wq = Matrix.fromArray(wq)
		}
		this._wk = null
		if (typeof wk === 'string') {
			this._wkname = wk
		} else if (wk) {
			this._wk = Matrix.fromArray(wk)
		}
		this._wv = null
		if (typeof wv === 'string') {
			this._wvname = wv
		} else if (wv) {
			this._wv = Matrix.fromArray(wv)
		}
	}

	get dependentLayers() {
		const layers = []
		if (this._wqname) {
			layers.push(this._wqname)
		}
		if (this._wkname) {
			layers.push(this._wkname)
		}
		if (this._wvname) {
			layers.push(this._wvname)
		}
		return layers
	}

	calc(x, memory) {
		this._selfattention = !memory
		if (!memory) {
			memory = x
		}
		this._dk ??= x.sizes.at(-1)
		if (this._wqname) {
			this._wq = this.graph.getNode(this._wqname).outputValue
		}
		if (!this._wq) {
			this._wq = Matrix.randn(x.sizes[2], this._dk)
		}
		if (this._wkname) {
			this._wk = this.graph.getNode(this._wkname).outputValue
		}
		if (!this._wk) {
			this._wk = Matrix.randn(memory.sizes[2], this._dk)
		}
		this._dv ??= x.sizes.at(-1)
		if (this._wvname) {
			this._wv = this.graph.getNode(this._wvname).outputValue
		}
		if (!this._wv) {
			this._wv = Matrix.randn(memory.sizes[2], this._dv)
		}
		this._i = x
		this._m = memory
		this._q = x.dot(this._wq)
		this._k = memory.dot(this._wk)
		this._v = memory.dot(this._wv)

		const qkt = this._matmul(this._q, this._k, false, true)
		this._atn = qkt.copy()
		for (let i = 0; i < qkt.sizes[0]; i++) {
			for (let j = 0; j < qkt.sizes[1]; j++) {
				const tmp = []
				for (let k = 0; k < qkt.sizes[2]; k++) {
					tmp[k] = qkt.at(i, j, k) / Math.sqrt(this._dk)
				}
				const m = tmp.reduce((s, v) => Math.max(s, v), -Infinity)
				let s = 0
				for (let k = 0; k < qkt.sizes[2]; k++) {
					tmp[k] = Math.exp(tmp[k] - m)
					s += tmp[k]
				}
				for (let k = 0; k < qkt.sizes[2]; k++) {
					this._atn.set([i, j, k], tmp[k] / s)
				}
			}
		}

		const o = this._matmul(this._atn, this._v)
		return o
	}

	_matmul(a, b, transpose_a = false, transpose_b = false) {
		const sizes = [a.sizes[0], transpose_a ? a.sizes[2] : a.sizes[1], transpose_b ? b.sizes[1] : b.sizes[2]]
		const d = transpose_a ? a.sizes[1] : a.sizes[2]
		const t = new Tensor(sizes)
		for (let i = 0; i < sizes[0]; i++) {
			for (let j = 0; j < sizes[1]; j++) {
				for (let k = 0; k < sizes[2]; k++) {
					let v = 0
					for (let s = 0; s < d; s++) {
						v +=
							(transpose_a ? a.at(i, s, j) : a.at(i, j, s)) *
							(transpose_b ? b.at(i, k, s) : b.at(i, s, k))
					}
					t.set([i, j, k], v)
				}
			}
		}
		return t
	}

	grad(bo) {
		const n = bo.sizes[0]
		const bv = this._matmul(this._atn, bo, true)
		const dwv = this._matmul(this._m, bv, true)
		this._dwv = dwv.reduce((a, b) => a + b, 0, 0).toMatrix()
		this._dwv.map(v => v / n)

		const batn = this._matmul(bo, this._v, false, true)
		const blog = batn.copy()
		for (let t = 0; t < batn.sizes[0]; t++) {
			for (let i = 0; i < batn.sizes[1]; i++) {
				for (let j = 0; j < batn.sizes[2]; j++) {
					const vtij = batn.at(t, i, j)
					let b = 0
					for (let k = 0; k < batn.sizes[2]; k++) {
						const v = j === k ? 1 - vtij : -vtij
						b += this._atn.at(t, i, k) * v * batn.at(t, i, k)
					}
					blog.set([t, i, j], b / Math.sqrt(this._dk))
				}
			}
		}

		const bq = this._matmul(blog, this._k)
		const dwq = this._matmul(this._i, bq, true)
		this._dwq = dwq.reduce((a, b) => a + b, 0, 0).toMatrix()
		this._dwq.map(v => v / n)
		const bi = bq.dot(this._wq.t)

		const bk = this._matmul(blog, this._q, true)
		const dwk = this._matmul(this._m, bk, true)
		this._dwk = dwk.reduce((a, b) => a + b, 0, 0).toMatrix()
		this._dwk.map(v => v / n)

		const bm = bk.dot(this._wk.t)
		bm.broadcastOperate(bv.dot(this._wv.t), (a, b) => a + b)

		if (this._selfattention) {
			bi.broadcastOperate(bm, (a, b) => a + b)
		}

		if (this._wqname || this._wkname || this._wvname) {
			const gp = {}
			if (this._wqname) {
				gp[this._wqname] = this._dwq
			}
			if (this._wkname) {
				gp[this._wkname] = this._dwk
			}
			if (this._wvname) {
				gp[this._wvname] = this._dwv
			}
			return this._selfattention ? [bi, gp] : [bi, bm, gp]
		}

		return this._selfattention ? bi : [bi, bm]
	}

	update(optimizer) {
		if (!this._wqname) {
			this._wq.sub(optimizer.delta('wq', this._dwq))
		}
		if (!this._wkname) {
			this._wk.sub(optimizer.delta('wk', this._dwk))
		}
		if (!this._wvname) {
			this._wv.sub(optimizer.delta('wv', this._dwv))
		}
	}

	toObject() {
		return {
			type: 'attention',
			dk: this._dk,
			dv: this._dv,
			wq: this._wqname || this._wq?.toArray(),
			wk: this._wkname || this._wk?.toArray(),
			wv: this._wvname || this._wv?.toArray(),
		}
	}
}

AttentionLayer.registLayer()
