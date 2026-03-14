import { correlation } from '../../../../../lib/evaluate/regression.js'
import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import SpikeEncodingLayer from '../../../../../lib/model/nns/layer/spike_encoding.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new SpikeEncodingLayer({ size: 300 })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new SpikeEncodingLayer({ size: 300 })

			const x = Matrix.random(2, 10)
			const y = layer.calc(x)
			expect(y.sizes).toEqual([2, 10, 300])
			for (let i = 0; i < y.sizes[0]; i++) {
				for (let j = 0; j < y.sizes[1]; j++) {
					for (let k = 0; k < y.sizes[2]; k++) {
						expect([0, 1]).toContain(y.at(i, j, k))
					}
				}
			}

			const ysum = y.reduce((s, v) => s + v, 0, 2)
			expect(correlation(x.value, ysum.value)).toBeGreaterThan(0.95)
		})

		test('tensor 1d', () => {
			const layer = new SpikeEncodingLayer({ size: 300 })

			const x = Tensor.random([2])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([2, 300])
			for (let i = 0; i < y.sizes[0]; i++) {
				for (let j = 0; j < y.sizes[1]; j++) {
					expect([0, 1]).toContain(y.at(i, j))
				}
			}

			const ysum = y.reduce((s, v) => s + v, 0, 1)
			expect(correlation(x.value, ysum.value)).toBeGreaterThan(0.95)
		})

		test('tensor 3d', () => {
			const layer = new SpikeEncodingLayer({ size: 300 })

			const x = Tensor.random([2, 2, 3])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([2, 2, 3, 300])
			for (let i = 0; i < y.sizes[0]; i++) {
				for (let j = 0; j < y.sizes[1]; j++) {
					for (let k = 0; k < y.sizes[2]; k++) {
						for (let l = 0; l < y.sizes[3]; l++) {
							expect([0, 1]).toContain(y.at(i, j, k, l))
						}
					}
				}
			}

			const ysum = y.reduce((s, v) => s + v, 0, 3)
			expect(correlation(x.value, ysum.value)).toBeGreaterThan(0.95)
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new SpikeEncodingLayer({ size: 300 })

			const x = Matrix.random(2, 10)
			layer.calc(x)

			const bo = Matrix.ones(2, 10, 300)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([2, 10])
		})

		test('tensor', () => {
			const layer = new SpikeEncodingLayer({ size: 300 })

			const x = Tensor.random([2, 2, 3])
			layer.calc(x)

			const bo = Tensor.ones([2, 2, 3, 300])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([2, 2, 3])
		})
	})

	test('toObject', () => {
		const layer = new SpikeEncodingLayer({ size: 300 })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'spike_encoding', size: 300, method: 'poisson', max_freq: 128, dt: 0.5 })
	})

	test('fromObject', () => {
		const orglayer = new SpikeEncodingLayer({ size: 300 })
		const layer = SpikeEncodingLayer.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(SpikeEncodingLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'spike_encoding', size: 300 }])
		const x = Matrix.randn(2, 10)

		const y = net.calc(x)
		expect(y.sizes).toEqual([2, 10, 300])

		const ysum = y.reduce((s, v) => s + v, 0, 2)
		expect(correlation(x.value, ysum.value)).toBeGreaterThan(0.95)
	})
})
