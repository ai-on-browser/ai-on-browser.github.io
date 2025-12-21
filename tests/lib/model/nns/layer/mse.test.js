import MSELayer from '../../../../../lib/model/nns/layer/mse.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new MSELayer({})
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('1d array', () => {
			const layer = new MSELayer({})

			const x = Tensor.randn([100])
			const t = Matrix.randn(100, 1).value
			layer.bind({ supervisor: t })
			const y = layer.calc(x)
			expect(y.sizes).toEqual([1, 1])
			expect(y.at(0, 0)).toBeCloseTo(t.reduce((s, v, i) => s + (v - x.at(i)) ** 2, 0) / t.length)
		})

		test('2d array', () => {
			const layer = new MSELayer({})

			const x = Matrix.randn(100, 10)
			const t = Matrix.randn(100, 10)
			layer.bind({ supervisor: t.toArray() })
			const y = layer.calc(x)
			x.sub(t)
			x.mult(x)
			expect(y.sizes).toEqual([1, 1])
			expect(y.at(0, 0)).toBeCloseTo(x.mean())
		})

		test('matrix', () => {
			const layer = new MSELayer({})

			const x = Matrix.randn(100, 10)
			const t = Matrix.randn(100, 10)
			layer.bind({ supervisor: t })
			const y = layer.calc(x)
			x.sub(t)
			x.mult(x)
			expect(y.sizes).toEqual([1, 1])
			expect(y.at(0, 0)).toBeCloseTo(x.mean())
		})

		test('tensor', () => {
			const layer = new MSELayer({})

			const x = Tensor.randn([15, 10, 7])
			const t = Tensor.randn([15, 10, 7])
			layer.bind({ supervisor: t })
			const y = layer.calc(x)
			x.broadcastOperate(t, (a, b) => (a - b) ** 2)
			expect(y.sizes).toEqual([1, 1])
			expect(y.at(0, 0)).toBeCloseTo(x.reduce((s, v) => s + v, 0) / x.length)
		})
	})

	describe('grad', () => {
		test('matrix', () => {
			const layer = new MSELayer({})

			const x = Matrix.randn(100, 10)
			const t = Matrix.randn(100, 10)
			layer.bind({ supervisor: t })
			layer.calc(x)

			const bo = Matrix.ones(1, 1)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([100, 10])
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(i, j)).toBe((x.at(i, j) - t.at(i, j)) / 2)
				}
			}
		})

		test('tensor', () => {
			const layer = new MSELayer({})

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
						expect(bi.at(i, j, k)).toBe((x.at(i, j, k) - t.at(i, j, k)) / 2)
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new MSELayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'mse' })
	})

	test('fromObject', () => {
		const layer = MSELayer.fromObject({ type: 'mse' })
		expect(layer).toBeInstanceOf(MSELayer)
	})
})
