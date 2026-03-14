import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'
import Layer, { NeuralnetworkLayerException } from './base.js'

/**
 * Leaky integrate-and-fire layer
 */
export default class SpikeLIFLayer extends Layer {
	// https://snn.hirlab.net/
	/**
	 * @param {object} config object
	 * @param {number} config.size Size of output
	 * @param {number[][] | Matrix | string} [config.w] Weight
	 * @param {number} [config.th] Firing threshold
	 * @param {number} [config.spike_train_dim] Dimension of the spike train
	 */
	constructor({ size, w = null, th = -40, spike_train_dim = -1, ...rest }) {
		super(rest)
		this._size = size
		this._spike_train_dim = spike_train_dim
		this._rest = -65
		this._ref = 3
		this._th = th
		this._tc = 20
		this._peak = 20

		this._w = null
		if (typeof w === 'string') {
			this._wname = w
		} else if (w) {
			this._w = Matrix.fromArray(w)
		}
		this._spike_train_dim = spike_train_dim
		if (this._spike_train_dim !== -1) {
			throw new NeuralnetworkLayerException('Invalid spike train dimension.')
		}
		this._dt = 1
		this._tci = 10

		this._update_method = 'stdp'
		this._a_ltp = 0.1
		this._a_ltd = -0.1
		this._tc_ltp = 20
		this._tc_ltd = 20
	}

	calc(x) {
		const n = x.sizes[0]
		const m = x.sizes[1]
		const T = x.sizes[2]
		if (this._wname) {
			this._w = this.graph.getNode(this._wname).outputValue
		}
		if (!this._w) {
			this._w = Matrix.random(m, this._size, 0, 1)
		}
		this._i = x
		this._m = Tensor.zeros([n, this._size, T])
		this._o = Tensor.zeros([n, this._size, T])
		for (let s = 0; s < n; s++) {
			for (let k = 0; k < this._size; k++) {
				let i = 0
				let v = this._rest
				let tlast = 0
				for (let t = 0; t < T; t++) {
					const di = this._dt * t > tlast + this._ref ? -i : 0
					i += (di * this._dt) / this._tci
					for (let j = 0; j < m; j++) {
						i += x.at(s, j, t) * this._w.at(j, k)
					}
					const dv = this._dt * t > tlast + this._ref ? -v + this._rest + i : 0
					v += (dv * this._dt) / this._tc
					this._m.set([s, k, t], v)
					if (v >= this._th) {
						this._m.set([s, k, t], this._peak)
						this._o.set([s, k, t], 1)
						tlast = this._dt * t
						v = this._rest
					}
				}
			}
		}
		return this._o
	}

	grad() {
		const n = this._i.sizes[0]
		const T = this._i.sizes[2]
		const bi = this._i.copy()
		bi.fill(0)
		if (this._update_method === 'stdp') {
			const fire_pre = this._i.copy()
			const fire_post = this._o.copy()
			for (let s = 0; s < n; s++) {
				for (let k = 0; k < fire_pre.sizes[1]; k++) {
					let tlast = -1
					for (let t = 0; t < T; t++) {
						if (fire_pre.at(s, k, t) === 1) {
							tlast = T
						} else if (tlast >= 0) {
							const v = Math.exp(((tlast - t) * this._dt) / this._tc_ltp)
							fire_pre.set([s, k, t], v)
						}
					}
				}
				for (let k = 0; k < fire_post.sizes[1]; k++) {
					let tlast = -1
					for (let t = 0; t < T; t++) {
						if (fire_post.at(s, k, t) > 0) {
							tlast = T
						} else if (tlast >= 0) {
							const v = Math.exp(((tlast - t) * this._dt) / this._tc_ltd)
							fire_post.set([s, k, t], v)
						}
					}
				}
			}

			this._dw = Matrix.zeros(this._i.sizes[1], this._size)
			for (let i = 0; i < fire_pre.sizes[1]; i++) {
				for (let j = 0; j < fire_post.sizes[1]; j++) {
					let dw = 0
					for (let s = 0; s < n; s++) {
						for (let t = 0; t < T; t++) {
							const iv = this._i.at(s, i, t)
							const ov = this._o.at(s, j, t)
							if (iv !== 1 || ov !== 1) {
								dw += this._a_ltd * iv * fire_post.at(s, j, t)
							}
							dw += this._a_ltp * ov * fire_pre.at(s, i, t)
						}
					}
					this._dw.set(i, j, -dw / (n * T))
				}
			}
			if (this._wname) {
				return [bi, { [this._wname]: this._dw }]
			}
		}
		return bi
	}

	update(optimizer) {
		if (this._update_method === 'stdp') {
			if (!this._wname) {
				this._w.sub(optimizer.delta('w', this._dw))
			}
		}
	}

	toObject() {
		return {
			type: 'spike_lif',
			size: this._size,
			w: this._wname || this._w?.toArray(),
			th: this._th,
			spike_train_dim: this._spike_train_dim,
		}
	}
}

SpikeLIFLayer.registLayer('spike_lif')
