import { randIndex } from '../../../../../lib/evaluate/clustering.js'
import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import SpikeLIFLayer from '../../../../../lib/model/nns/layer/spike_lif.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

class KMeans {
	constructor(x, k) {
		this._x = x
		this._k = k

		const n = this._x.length
		const idx = []
		for (let i = 0; i < this._k; i++) {
			idx.push(Math.floor(Math.random() * (n - i)))
		}
		for (let i = idx.length - 1; i >= 0; i--) {
			for (let j = idx.length - 1; j > i; j--) {
				if (idx[i] <= idx[j]) {
					idx[j]++
				}
			}
		}
		this._c = idx.map(v => this._x[v])

		this._d = (a, b) => Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0))
	}

	fit() {
		const p = this.predict()

		const c = this._c.map(p => Array.from(p, () => 0))
		const count = Array(this._k).fill(0)
		const n = this._x.length
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < this._x[i].length; j++) {
				c[p[i]][j] += this._x[i][j]
			}
			count[p[i]]++
		}
		let d = 0
		for (let k = 0; k < this._k; k++) {
			const mc = c[k].map(v => v / count[k])
			d += this._c[k].reduce((s, v, j) => s + (v - mc[j]) ** 2, 0)
			this._c[k] = c[k].map(v => v / count[k])
		}
		return d
	}

	predict() {
		const p = []
		const n = this._x.length
		for (let i = 0; i < n; i++) {
			let min_d = Infinity
			p[i] = -1
			for (let k = 0; k < this._k; k++) {
				const d = this._d(this._x[i], this._c[k])
				if (d < min_d) {
					min_d = d
					p[i] = k
				}
			}
		}
		return p
	}
}

describe('layer', () => {
	describe('construct', () => {
		test('default', () => {
			const layer = new SpikeLIFLayer({ size: 3 })
			expect(layer).toBeDefined()
		})

		test('invalid sequence', () => {
			expect(() => new SpikeLIFLayer({ size: 3, spike_train_dim: 1 })).toThrow('Invalid spike train dimension')
		})
	})

	describe('calc', () => {
		test('tensor 3d', () => {
			const layer = new SpikeLIFLayer({ size: 3, th: -60 })

			const x = Tensor.random([2, 2, 300])
			x.map(v => (v <= 0.5 ? 1 : 0))
			const y = layer.calc(x)
			expect(y.sizes).toEqual([2, 3, 300])
			for (let i = 0; i < y.sizes[0]; i++) {
				for (let j = 0; j < y.sizes[1]; j++) {
					for (let k = 0; k < y.sizes[2]; k++) {
						for (let l = 0; l < y.sizes[3]; l++) {
							expect([0, 1]).toContain(y.at(i, j, k, l))
						}
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('tensor', () => {
			const layer = new SpikeLIFLayer({ size: 3, th: -60 })

			const x = Tensor.random([2, 2, 300])
			x.map(v => (v <= 0.5 ? 1 : 0))
			layer.calc(x)

			const bo = Tensor.ones([2, 3, 300])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([2, 2, 300])
		})
	})

	test('toObject', () => {
		const layer = new SpikeLIFLayer({ size: 3 })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'spike_lif', size: 3, th: -40, spike_train_dim: -1 })
	})

	test('fromObject', () => {
		const orglayer = new SpikeLIFLayer({ size: 3 })
		const layer = SpikeLIFLayer.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(SpikeLIFLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'spike_lif', size: 3, th: -60 }])
		const x = Tensor.random([2, 2, 300])
		x.map(v => (v <= 0.5 ? 1 : 0))

		const y = net.calc(x)
		expect(y.sizes).toEqual([2, 3, 300])
	})

	test.each([
		[[{ type: 'input' }, { type: 'spike_lif', size: 3, th: -64 }]],
		[[{ type: 'input' }, { type: 'spike_lif', size: 3, th: -64, w: Matrix.random(2, 3, 0, 1) }]],
		[
			[
				{ type: 'input', name: 'in' },
				{ type: 'variable', value: Matrix.random(2, 3, 0, 1), name: 'w' },
				{ type: 'spike_lif', size: 3, th: -64, input: 'in', w: 'w' },
			],
		],
	])('grad %j', { retry: 5 }, layers => {
		const net = NeuralNetwork.fromObject(layers, 'mse', 'sgd')
		const x = Tensor.random([12, 2, 100])
		x.map((v, idx) => {
			const i = idx[0] + idx[1]
			return v <= (i % 3 === 0 ? 0.1 : i % 3 === 1 ? 0.5 : 0.9) ? 1 : 0
		})

		for (let i = 0; i < 10; i++) {
			net.fit(x, Tensor.zeros([1]), 1, 0.001)
		}

		const y = net.calc(x)
		const ys = y.reduce((s, v) => s + v, 0, 2)
		expect(y.sizes).toEqual([12, 3, 100])

		const model = new KMeans(ys.toArray(), 3)
		for (let i = 0; i < 10; i++) {
			model.fit()
		}
		const p = model.predict()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i % 3)
		}
		const ri = randIndex(p, t)
		expect(ri).toBeGreaterThan(0.95)
	})
})
