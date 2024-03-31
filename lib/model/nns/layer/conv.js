import Layer, { NeuralnetworkLayerException } from './base.js'
import Tensor from '../../../util/tensor.js'

/**
 * Convolutional layer
 */
export default class ConvLayer extends Layer {
	/**
	 * @param {object} config object
	 * @param {number | number[]} config.kernel Size of kernel
	 * @param {number} [config.channel] Number of output channel
	 * @param {number | number[]} [config.stride] Step of stride
	 * @param {number | number[]} [config.padding] size of padding
	 * @param {number[][] | Tensor | string} [config.w] Weight of kernel
	 * @param {string | object} [config.activation] Name of activation or activation layer object
	 * @param {number} [config.l2_decay] L2 decay
	 * @param {number} [config.l1_decay] L1 decay
	 * @param {number} [config.channel_dim] Dimension of the channel
	 */
	constructor({
		kernel,
		channel = null,
		stride = null,
		padding = null,
		w = null,
		activation = null,
		l2_decay = 0,
		l1_decay = 0,
		channel_dim = -1,
		...rest
	}) {
		super(rest)
		this._in_channel = null
		this._out_channel = channel
		this._kernel = kernel
		this._stride = stride || 1
		this._padding = padding || 0
		this._channel_dim = channel_dim
		if (this._channel_dim !== -1 && this._channel_dim !== 1) {
			throw new NeuralnetworkLayerException('Invalid channel dimension.')
		}
		this._w = null
		this._wname = null
		if (typeof w === 'string') {
			this._wname = w
		} else if (w) {
			this._w = Tensor.fromArray(w)
			this._in_channel = this._w.sizes[1]
			if (!this._out_channel) {
				this._out_channel = this._w.sizes[0]
			}
		}
		if (typeof activation === 'string') {
			this._activation = Layer.fromObject({ type: activation })
		} else if (activation) {
			this._activation = Layer.fromObject(activation)
		}
		this._l2_decay = l2_decay
		this._l1_decay = l1_decay
	}

	_index(i, c, k) {
		return this._channel_dim === -1 ? [i, ...k, c] : [i, c, ...k]
	}

	calc(x) {
		if (x.dimension <= 2) {
			throw new NeuralnetworkLayerException('Invalid input.')
		}
		if (!Array.isArray(this._kernel)) {
			this._kernel = Array(x.dimension - 2).fill(this._kernel)
		}
		if (x.dimension !== this._kernel.length + 2) {
			throw new NeuralnetworkLayerException('Invalid kernel size', [this, x])
		}
		if (!Array.isArray(this._stride)) {
			this._stride = Array(x.dimension - 2).fill(this._stride)
		}
		if (x.dimension !== this._stride.length + 2) {
			throw new NeuralnetworkLayerException('Invalid stride size', [this, x])
		}
		if (!Array.isArray(this._padding)) {
			this._padding = Array.from({ length: x.dimension - 2 }, () => [this._padding, this._padding])
		} else if (!Array.isArray(this._padding[0])) {
			this._padding = this._padding.map(p => [p, p])
		}
		if (x.dimension !== this._padding.length + 2) {
			throw new NeuralnetworkLayerException('Invalid padding size', [this, x])
		}
		if (this._wname) {
			this._w = this.graph.getNode(this._wname).outputValue
			if (!this._in_channel) {
				this._in_channel = this._w.sizes[1]
			}
			if (!this._out_channel) {
				this._out_channel = this._w.sizes[0]
			}
		}
		if (!this._w) {
			this._in_channel = x.sizes[this._channel_dim === -1 ? x.dimension - 1 : 1]
			if (!this._out_channel) {
				this._out_channel = this._in_channel * 2
			}
			this._w = Tensor.randn([this._out_channel, this._in_channel, ...this._kernel])
		}
		this._i = x
		const koff = this._channel_dim === -1 ? 1 : 2
		const outSize = [
			x.sizes[0],
			...this._kernel.map(
				(k, d) =>
					Math.ceil(
						Math.max(0, x.sizes[d + koff] + this._padding[d][0] + this._padding[d][1] - k) / this._stride[d]
					) + 1
			),
		]
		if (this._channel_dim === -1) {
			outSize.push(this._out_channel)
		} else if (this._channel_dim === 1) {
			outSize.splice(1, 0, this._out_channel)
		}
		this._o = new Tensor(outSize)
		for (let i = 0; i < x.sizes[0]; i++) {
			for (let b = 0; b < this._out_channel; b++) {
				const idx = Array(this._kernel.length).fill(0)
				do {
					let v = 0
					const p = Array(this._kernel.length).fill(0)
					do {
						const pi = p.map((t, k) => idx[k] * this._stride[k] - this._padding[k][0] + t)
						if (pi.every((t, k) => 0 <= t && t < x.sizes[k + koff])) {
							for (let c = 0; c < this._in_channel; c++) {
								v += x.at(this._index(i, c, pi)) * this._w.at(b, c, ...p)
							}
						}
						for (let k = 0; k < p.length; k++) {
							p[k]++
							if (p[k] < this._kernel[k]) {
								break
							}
							p[k] = 0
						}
					} while (p.some(v => v > 0))
					this._o.set(this._index(i, b, idx), v)
					for (let k = 0; k < idx.length; k++) {
						idx[k]++
						if (idx[k] < outSize[k + koff]) {
							break
						}
						idx[k] = 0
					}
				} while (idx.some(v => v > 0))
			}
		}
		if (this._activation) {
			return this._activation.calc(this._o)
		}
		return this._o
	}

	grad(bo) {
		this._bo = bo
		if (this._activation) {
			this._bo = this._activation.grad(bo)
		}
		this._bi = new Tensor(this._i.sizes)
		this._dw = new Tensor(this._w.sizes)
		const koff = this._channel_dim === -1 ? 1 : 2
		for (let i = 0; i < this._i.sizes[0]; i++) {
			for (let b = 0; b < this._out_channel; b++) {
				const idx = Array(this._kernel.length).fill(0)
				do {
					const p = Array(this._kernel.length).fill(0)
					do {
						const pi = p.map((t, k) => idx[k] * this._stride[k] - this._padding[k][0] + t)
						if (pi.every((t, k) => 0 <= t && t < this._i.sizes[k + koff])) {
							for (let c = 0; c < this._in_channel; c++) {
								this._bi.operateAt(
									this._index(i, c, pi),
									v => v + this._w.at(b, c, ...p) * this._bo.at(this._index(i, b, idx))
								)
								this._dw.operateAt(
									[b, c, ...p],
									v => v + this._i.at(this._index(i, c, pi)) * this._bo.at(this._index(i, b, idx))
								)
							}
						}
						for (let k = 0; k < p.length; k++) {
							p[k]++
							if (p[k] < this._kernel[k]) {
								break
							}
							p[k] = 0
						}
					} while (p.some(v => v > 0))
					for (let k = 0; k < idx.length; k++) {
						idx[k]++
						if (idx[k] < this._o.sizes[k + koff]) {
							break
						}
						idx[k] = 0
					}
				} while (idx.some(v => v > 0))
			}
		}
		if (this._wname) {
			return [this._bi, { [this._wname]: this._dw }]
		}
		return this._bi
	}

	update(optimizer) {
		if (this._wname) {
			return
		}
		this._w.broadcastOperate(optimizer.delta('w', this._dw), (a, b) => a - b)
	}

	toObject() {
		return {
			type: 'conv',
			w: this._wname || this._w?.toArray(),
			channel: this._out_channel,
			kernel: this._kernel,
			stride: this._stride,
			padding: this._padding,
			activation: this._activation?.toObject(),
			l2_decay: this._l2_decay,
			l1_decay: this._l1_decay,
			channel_dim: this._channel_dim,
		}
	}
}

ConvLayer.registLayer()
