import { NeuralnetworkException, NeuralnetworkLayers } from '../neuralnetwork.js'
import Layer from './base.js'
import { Tensor } from '../../util/math.js'

export default class ConvLayer extends Layer {
	constructor({
		kernel,
		channel = null,
		stride = null,
		padding = null,
		activation = null,
		l2_decay = 0,
		l1_decay = 0,
		...rest
	}) {
		super(rest)
		this._in_channel = null
		this._out_channel = channel
		this._kernel = kernel
		this._stride = stride || 1
		this._padding = padding || 0
		this._w = null
		if (activation) {
			this._activation_func = new NeuralnetworkLayers[activation](rest)
		}
		this._l2_decay = l2_decay
		this._l1_decay = l1_decay
	}

	calc(x) {
		if (!Array.isArray(this._kernel)) {
			this._kernel = Array(x.dimension - 2).fill(this._kernel)
		}
		if (x.dimension !== this._kernel.length + 2) {
			throw new NeuralnetworkException('Invalid kernel size', [this, x])
		}
		if (!this._w) {
			this._in_channel = x.sizes[x.dimension - 1]
			if (!this._out_channel) {
				this._out_channel = this._in_channel * 2
			}
			this._w = Tensor.randn([this._in_channel, ...this._kernel, this._out_channel])
		}
		this._i = x
		const outSize = [
			x.sizes[0],
			...this._kernel.map((k, d) => Math.ceil((x.sizes[d + 1] + this._padding * 2) / this._stride) + 1 - k),
			this._out_channel,
		]
		this._o = new Tensor(outSize)
		for (let i = 0; i < x.sizes[0]; i++) {
			for (let c = 0; c < this._in_channel; c++) {
				for (let b = 0; b < this._out_channel; b++) {
					if (this._kernel.length === 2) {
						for (let m = 0; m < outSize[1]; m++) {
							for (let n = 0; n < outSize[2]; n++) {
								let v = 0
								for (let s = 0; s < this._kernel[0]; s++) {
									if (m - this._padding + s < 0 || m - this._padding + s >= x.sizes[1]) {
										continue
									}
									for (let t = 0; t < this._kernel[1]; t++) {
										if (n - this._padding + t < 0 || n - this._padding + t >= x.sizes[2]) {
											continue
										}
										v +=
											x.at(i, m - this._padding + s, n - this._padding + t, c) *
											this._w.at(c, s, t, b)
									}
								}
								this._o.set([i, m, n, b], v)
							}
						}
					} else {
						throw new NeuralnetworkException('Invalid dimension.')
					}
				}
			}
		}
		if (this._activation_func) {
			return this._activation_func.calc(this._o)
		}
		return this._o
	}

	grad(bo) {
		this._bo = bo
		if (this._activation_func) {
			this._bo = this._activation_func.grad(bo)
		}
		this._bi = new Tensor(this._i.sizes)
		this._dw = new Tensor(this._w.sizes)
		for (let i = 0; i < this._i.sizes[0]; i++) {
			for (let c = 0; c < this._in_channel; c++) {
				for (let b = 0; b < this._out_channel; b++) {
					if (this._kernel.length === 2) {
						for (let m = 0; m < bo.sizes[1]; m++) {
							for (let n = 0; n < bo.sizes[2]; n++) {
								for (let s = 0; s < this._kernel[0]; s++) {
									const si = m - this._padding + s
									if (si < 0 || si >= this._i.sizes[1]) {
										continue
									}
									for (let t = 0; t < this._kernel[1]; t++) {
										const ti = n - this._padding + t
										if (ti < 0 || ti >= this._i.sizes[2]) {
											continue
										}
										const v = this._bi.at(i, si, ti, c)
										this._bi.set([i, si, ti, c], v + this._w.at(c, s, t, b) * bo.at(i, m, n, b))
										const wv = this._dw.at(c, s, t, b)
										this._dw.set(
											[c, s, t, b],
											wv + this._i.at(i, si, ti, c) * this._bo.at(i, m, n, b)
										)
									}
								}
							}
						}
					} else {
						throw new NeuralnetworkException('Invalid dimension.')
					}
				}
			}
		}
		return this._bi
	}

	update() {
		this._dw.reshape(this._dw.sizes[0], this._dw.length / this._dw.sizes[0])
		const d = this._opt.delta('w', this._dw.toMatrix())
		for (let i = 0; i < this._w.length; i++) {
			this._w.value[i] -= d.value[i]
		}
	}

	get_params() {
		return {
			w: this._w,
		}
	}

	set_params(param) {
		this._w = param.w.copy()
	}
}