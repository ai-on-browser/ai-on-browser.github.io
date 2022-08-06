import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'

import ConstLayer from '../../../../../lib/model/nns/layer/const.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new ConstLayer({ value: 1 })
		expect(layer).toBeDefined()
	})

	describe('calc', () => {
		test('scalar', () => {
			const layer = new ConstLayer({ value: 1 })

			const y = layer.calc()
			expect(y.sizes).toEqual([1, 1])
			expect(y.at(0, 0)).toBe(1)
		})

		test('2d', () => {
			const layer = new ConstLayer({
				value: [
					[0, 1],
					[2, 3],
					[4, 5],
				],
			})

			const y = layer.calc()
			expect(y.sizes).toEqual([3, 2])
			for (let i = 0, c = 0; i < 3; i++) {
				for (let j = 0; j < 2; j++, c++) {
					expect(y.at(i, j)).toBe(c)
				}
			}
		})

		test('3d', () => {
			const layer = new ConstLayer({
				value: [
					[
						[0, 1],
						[2, 3],
						[4, 5],
					],
					[
						[6, 7],
						[8, 9],
						[10, 11],
					],
				],
			})

			const y = layer.calc()
			expect(y.sizes).toEqual([2, 3, 2])
			for (let i = 0, c = 0; i < 2; i++) {
				for (let j = 0; j < 3; j++) {
					for (let k = 0; k < 2; k++, c++) {
						expect(y.at(i, j, k)).toBe(c)
					}
				}
			}
		})
	})

	test('grad', () => {
		const layer = new ConstLayer({ value: 1 })

		layer.calc()

		const bo = Matrix.ones(1, 1)
		const bi = layer.grad(bo)
		expect(bi).toBeUndefined()
	})

	test('toObject', () => {
		const layer = new ConstLayer({ value: 1 })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'const', value: 1 })
	})

	test('fromObject', () => {
		const layer = ConstLayer.fromObject({ type: 'const', value: 1 })
		expect(layer).toBeInstanceOf(ConstLayer)
	})
})

describe('nn', () => {
	test('scalar', () => {
		const net = NeuralNetwork.fromObject([{ type: 'const', value: 1 }])
		const y = net.calc([])
		expect(y.sizes).toEqual([1, 1])
		expect(y.at(0, 0)).toBeCloseTo(1)
	})
})
