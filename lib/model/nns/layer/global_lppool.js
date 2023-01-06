import Layer, { NeuralnetworkLayerException } from './base.js'
import Tensor from '../../../util/tensor.js'

/**
 * Global Lp pool layer
 */
export default class GlobalLpPoolLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} [config.p=2] p
	 * @param {number} [config.channel_dim=-1] Dimension of the channel
	 */
	constructor({ p = 2, channel_dim = -1, ...rest }) {
		super(rest)
		this._p = p
		this._channel_dim = channel_dim
		if (this._channel_dim !== -1 && this._channel_dim !== 1) {
			throw new NeuralnetworkLayerException('Invalid channel dimension.')
		}
	}

	_index(i, c, k) {
		return this._channel_dim === -1 ? [i, ...k, c] : [i, c, ...k]
	}

	calc(x) {
		this._i = x
		const traceSize = x.sizes.slice(1)
		const outSize = Array(x.sizes.length).fill(1)
		outSize[0] = x.sizes[0]
		if (this._channel_dim === -1) {
			outSize[x.dimension - 1] = x.sizes[x.dimension - 1]
			traceSize.pop()
		} else if (this._channel_dim === 1) {
			outSize[1] = x.sizes[1]
			traceSize.splice(0, 1)
		}
		const channels = this._channel_dim === -1 ? x.sizes[x.dimension - 1] : x.sizes[1]
		this._sp = new Tensor(outSize)
		for (let i = 0; i < x.sizes[0]; i++) {
			for (let c = 0; c < channels; c++) {
				const idx = Array(x.dimension - 2).fill(0)
				let sumval = 0
				do {
					sumval += x.at(this._index(i, c, idx)) ** this._p
					for (let k = 0; k < idx.length; k++) {
						idx[k]++
						if (idx[k] < traceSize[k]) {
							break
						}
						idx[k] = 0
					}
				} while (idx.some(v => v > 0))
				this._sp.set(this._index(i, c, Array(x.dimension - 2).fill(0)), sumval)
			}
		}
		this._o = this._sp.copy()
		this._o.map(v => v ** (1 / this._p))
		return this._o
	}

	grad(bo) {
		this._bo = bo
		this._bi = new Tensor(this._i.sizes)
		const traceSize = this._i.sizes.slice(1)
		if (this._channel_dim === -1) {
			traceSize.pop()
		} else if (this._channel_dim === 1) {
			traceSize.splice(0, 1)
		}
		const channels = this._channel_dim === -1 ? this._i.sizes[this._i.dimension - 1] : this._i.sizes[1]
		for (let i = 0; i < this._i.sizes[0]; i++) {
			for (let c = 0; c < channels; c++) {
				const idx = Array(this._i.dimension - 2).fill(0)
				do {
					const iidx = this._index(i, c, idx)
					const oidx = this._index(i, c, Array(this._i.dimension - 2).fill(0))
					this._bi.set(
						iidx,
						this._bo.at(oidx) * this._sp.at(oidx) ** (1 / this._p - 1) * this._i.at(iidx) ** (this._p - 1)
					)
					for (let k = 0; k < idx.length; k++) {
						idx[k]++
						if (idx[k] < traceSize[k]) {
							break
						}
						idx[k] = 0
					}
				} while (idx.some(v => v > 0))
			}
		}
		return this._bi
	}

	toObject() {
		return {
			type: 'global_lp_pool',
			p: this._p,
			channel_dim: this._channel_dim,
		}
	}
}

GlobalLpPoolLayer.registLayer()
