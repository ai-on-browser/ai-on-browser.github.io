import Matrix from '../../../util/matrix.js'
import Tensor from '../../../util/tensor.js'
import Layer from './base.js'

const random_poisson = l => {
	const L = Math.exp(-l)
	let k = 0
	let p = 1
	while (p > L) {
		k++
		p *= Math.random()
	}
	return k - 1
}

/**
 * Spike encoding layer
 */
export default class SpikeEncodingLayer extends Layer {
	// https://snn.hirlab.net/
	/**
	 * @param {object} config object
	 * @param {number} config.size Size of spike train
	 * @param {string} [config.method] Encoding method
	 * @param {number} [config.max_freq] Max spike frequency
	 * @param {number} [config.dt] Time resolution
	 */
	constructor({ size, method = 'poisson', max_freq = 128, dt = 0.5, ...rest }) {
		super(rest)
		this._size = size
		this._method = method
		this._max_freq = max_freq
		this._data_range = [Infinity, -Infinity]
		this._dt = dt
	}

	calc(x) {
		this._i = x
		for (let i = 0; i < x.length; i++) {
			this._data_range[0] = Math.min(this._data_range[0], x.value[i])
			this._data_range[1] = Math.max(this._data_range[1], x.value[i])
		}
		const size = [...x.sizes, this._size]
		const o = size.length === 2 ? new Matrix(...size) : new Tensor(size)
		for (let i = 0; i < x.length; i++) {
			const f =
				(this._max_freq * (x.value[i] - this._data_range[0])) / (this._data_range[1] - this._data_range[0])
			const t = 1000 / f
			let k = 0
			while (Math.round(k) < this._size) {
				k += random_poisson(t) * this._dt
				o.value[i * this._size + Math.round(k)] = 1
			}
		}
		return o
	}

	grad() {
		const bi = this._i.copy()
		bi.fill(0)
		return bi
	}

	toObject() {
		return {
			type: 'spike_encoding',
			size: this._size,
			method: this._method,
			max_freq: this._max_freq,
			dt: this._dt,
		}
	}
}

SpikeEncodingLayer.registLayer()
