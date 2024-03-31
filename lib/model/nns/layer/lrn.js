import Layer, { NeuralnetworkLayerException } from './base.js'

/**
 * LRN layer
 */
export default class LRNLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number} [config.alpha] alpha
	 * @param {number} [config.beta] beta
	 * @param {number} [config.k] k
	 * @param {number} config.n n
	 * @param {number} [config.channel_dim] Dimension of the channel
	 */
	constructor({ alpha = 0.0001, beta = 0.75, k = 2, n, channel_dim = -1, ...rest }) {
		super(rest)
		this._alpha = alpha
		this._beta = beta
		this._k = k
		this._n = n
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
		const channels = this._channel_dim === -1 ? x.sizes[x.dimension - 1] : x.sizes[1]
		const offs = [Math.floor((this._n - 1) / 2), Math.ceil((this._n - 1) / 2)]

		this._s = x.copy()
		const koff = this._channel_dim === -1 ? 1 : 2
		for (let i = 0; i < x.sizes[0]; i++) {
			const idx = Array(x.dimension - 2).fill(0)
			do {
				for (let c = 0; c < channels; c++) {
					let s = 0
					for (let ci = Math.max(0, c - offs[0]); ci < Math.min(channels, c + offs[1] + 1); ci++) {
						s += x.at(this._index(i, ci, idx)) ** 2
					}
					this._s.set(this._index(i, c, idx), this._k + this._alpha * s)
				}
				for (let k = 0; k < idx.length; k++) {
					idx[k]++
					if (idx[k] < x.sizes[k + koff]) {
						break
					}
					idx[k] = 0
				}
			} while (idx.some(v => v > 0))
		}
		const o = this._s.copy()
		o.broadcastOperate(x, (a, b) => b / a ** this._beta)
		return o
	}

	grad(bo) {
		const bi = this._i.copy()
		bi.broadcastOperate(
			this._s,
			(a, b) => b ** -this._beta - 2 * this._beta * a ** 2 * b ** (-this._beta - 1) * this._alpha
		)
		bi.broadcastOperate(bo, (a, b) => a * b)
		return bi
	}

	toObject() {
		return {
			type: 'lrn',
			alpha: this._alpha,
			beta: this._beta,
			k: this._k,
			n: this._n,
			channel_dim: this._channel_dim,
		}
	}
}

LRNLayer.registLayer('lrn')
