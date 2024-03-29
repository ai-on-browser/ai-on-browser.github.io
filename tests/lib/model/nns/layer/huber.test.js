import Matrix from '../../../../../lib/util/matrix.js'

import HuberLayer from '../../../../../lib/model/nns/layer/huber.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new HuberLayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('1d array', () => {
			const layer = new HuberLayer({})

			const x = Tensor.randn([100])
			const t = Matrix.randn(100, 1).value
			layer.bind({ supervisor: t })
			const y = layer.calc(x)
			expect(y.sizes).toEqual([1, 1])
			expect(y.at(0, 0)).toBeCloseTo(
				t.map((v, i) => Math.abs(v - x.at(i))).reduce((s, v) => s + (v < 1 ? v ** 2 / 2 : v - 0.5), 0)
			)
		})

		test('2d array', () => {
			const layer = new HuberLayer({})

			const x = Matrix.randn(100, 10)
			const t = Matrix.randn(100, 10)
			layer.bind({ supervisor: t.toArray() })
			const y = layer.calc(x)
			x.broadcastOperate(t, (a, b) => Math.abs(a - b))
			x.map(v => (v < 1 ? v ** 2 / 2 : v - 0.5))
			expect(y.sizes).toEqual([1, 1])
			expect(y.at(0, 0)).toBeCloseTo(x.sum())
		})

		test('matrix', () => {
			const layer = new HuberLayer({})

			const x = Matrix.randn(100, 10)
			const t = Matrix.randn(100, 10)
			layer.bind({ supervisor: t })
			const y = layer.calc(x)
			x.broadcastOperate(t, (a, b) => Math.abs(a - b))
			x.map(v => (v < 1 ? v ** 2 / 2 : v - 0.5))
			expect(y.sizes).toEqual([1, 1])
			expect(y.at(0, 0)).toBeCloseTo(x.sum())
		})

		test('tensor', () => {
			const layer = new HuberLayer({})

			const x = Tensor.randn([15, 10, 7])
			const t = Tensor.randn([15, 10, 7])
			layer.bind({ supervisor: t })
			const y = layer.calc(x)
			x.broadcastOperate(t, (a, b) => Math.abs(a - b))
			x.map(v => (v < 1 ? v ** 2 / 2 : v - 0.5))
			expect(y.sizes).toEqual([1, 1])
			expect(y.at(0, 0)).toBeCloseTo(x.reduce((s, v) => s + v, 0))
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new HuberLayer({})

			const x = Matrix.randn(100, 10)
			const t = Matrix.randn(100, 10)
			layer.bind({ supervisor: t })
			layer.calc(x)

			const bo = Matrix.ones(1, 1)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([100, 10])
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					const d = x.at(i, j) - t.at(i, j)
					expect(bi.at(i, j)).toBe(Math.abs(d) < 1 ? d : Math.sign(d))
				}
			}
		})

		test('tensor', () => {
			const layer = new HuberLayer({})

			const x = Tensor.randn([15, 10, 7])
			const t = Tensor.randn([15, 10, 7])
			layer.bind({ supervisor: t })
			layer.calc(x)

			const bo = Matrix.ones(1, 1)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([15, 10, 7])
			for (let i = 0; i < x.sizes[0]; i++) {
				for (let j = 0; j < x.sizes[1]; j++) {
					for (let k = 0; k < x.sizes[2]; k++) {
						const d = x.at(i, j, k) - t.at(i, j, k)
						expect(bi.at(i, j, k)).toBe(Math.abs(d) < 1 ? d : Math.sign(d))
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new HuberLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'huber' })
	})

	test('fromObject', () => {
		const layer = HuberLayer.fromObject({ type: 'huber' })
		expect(layer).toBeInstanceOf(HuberLayer)
	})
})
