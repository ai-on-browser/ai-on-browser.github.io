import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import GRULayer from '../../../../../lib/model/nns/layer/gru.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('layer', () => {
	describe('construct', () => {
		test('default', () => {
			const layer = new GRULayer({ size: 4 })
			expect(layer).toBeDefined()
		})

		test('invalid sequence', () => {
			expect(() => new GRULayer({ size: 4, sequence_dim: 2 })).toThrow('Invalid sequence dimension')
		})
	})

	test('dependentLayers', () => {
		const layer = new GRULayer({
			size: 4,
			w_z: 'w_z',
			w_h: 'w_h',
			w_r: 'w_r',
			u_z: 'u_z',
			u_h: 'u_h',
			u_r: 'u_r',
			b_z: 'b_z',
			b_h: 'b_h',
			b_r: 'b_r',
		})
		const dl = layer.dependentLayers
		expect(dl.sort()).toEqual(['w_z', 'w_h', 'w_r', 'u_z', 'u_h', 'u_r', 'b_z', 'b_h', 'b_r'].sort())
	})

	describe('calc', () => {
		test('matrix', () => {
			const layer = new GRULayer({ size: 4 })

			const x = Matrix.randn(10, 3)
			expect(() => layer.calc(x)).toThrow()
		})

		test('tensor', () => {
			const layer = new GRULayer({ size: 4 })

			const x = Tensor.randn([10, 7, 5])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 4])
		})

		test('tensor return sequence', () => {
			const layer = new GRULayer({ size: 4, return_sequences: true })

			const x = Tensor.randn([10, 7, 5])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 7, 4])
		})

		test('tensor sequence_dim: 0', () => {
			const layer = new GRULayer({ size: 4, sequence_dim: 0 })

			const x = Tensor.randn([7, 10, 5])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([10, 4])
		})

		test('tensor return sequence sequence_dim: 0', () => {
			const layer = new GRULayer({ size: 4, return_sequences: true, sequence_dim: 0 })

			const x = Tensor.randn([7, 10, 5])
			const y = layer.calc(x)
			expect(y.sizes).toEqual([7, 10, 4])
		})
	})

	describe('grad', () => {
		test('no sequence', () => {
			const layer = new GRULayer({ size: 4 })

			const x = Tensor.randn([10, 7, 5])
			layer.calc(x)

			const bo = Matrix.ones(10, 4)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([10, 7, 5])
		})

		test('sequence', () => {
			const layer = new GRULayer({ size: 4, return_sequences: true })

			const x = Tensor.randn([10, 7, 5])
			layer.calc(x)

			const bo = Tensor.ones([10, 7, 4])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([10, 7, 5])
		})

		test('sequence_dim: 0', () => {
			const layer = new GRULayer({ size: 4, sequence_dim: 0 })

			const x = Tensor.randn([7, 10, 5])
			layer.calc(x)

			const bo = Matrix.ones(10, 4)
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([7, 10, 5])
		})

		test('return_sequences sequence_dim: 0', () => {
			const layer = new GRULayer({ size: 4, return_sequences: true, sequence_dim: 0 })

			const x = Tensor.randn([7, 10, 5])
			layer.calc(x)

			const bo = Tensor.ones([7, 10, 4])
			const bi = layer.grad(bo)
			expect(bi.sizes).toEqual([7, 10, 5])
		})
	})

	describe('toObject', () => {
		test('default', () => {
			const layer = new GRULayer({ size: 4 })

			const obj = layer.toObject()
			expect(obj.type).toBe('gru')
			expect(obj.return_sequences).toBeFalsy()
			expect(obj.size).toBe(4)
		})

		test('string parameters', () => {
			const layer = new GRULayer({ size: 4, w_z: 'w_z' })

			const obj = layer.toObject()
			expect(obj.type).toBe('gru')
			expect(obj.return_sequences).toBeFalsy()
			expect(obj.size).toBe(4)
			expect(obj.w_z).toBe('w_z')
		})
	})

	test('fromObject', () => {
		const orglayer = new GRULayer({ size: 4 })
		orglayer.calc(Tensor.randn([10, 7, 5]))
		const layer = GRULayer.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(GRULayer)
	})
})

describe('nn', () => {
	test('update', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'gru', size: 4 }], 'mse', 'adam')
		const x = Tensor.random([1, 7, 5], -0.1, 0.1)
		const t = Matrix.random(1, 4, -0.8, 0.8)

		for (let i = 0; i < 1000; i++) {
			const loss = net.fit(x, t, 100, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})

	test('string parameters', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'in' },
				{ type: 'variable', value: Matrix.randn(5, 3), name: 'w_r' },
				{ type: 'variable', value: Matrix.randn(5, 3), name: 'w_z' },
				{ type: 'variable', value: Matrix.randn(5, 3), name: 'w_h' },
				{ type: 'variable', value: Matrix.randn(3, 3), name: 'u_r' },
				{ type: 'variable', value: Matrix.randn(3, 3), name: 'u_z' },
				{ type: 'variable', value: Matrix.randn(3, 3), name: 'u_h' },
				{ type: 'variable', value: Matrix.randn(1, 3), name: 'b_r' },
				{ type: 'variable', value: Matrix.randn(1, 3), name: 'b_z' },
				{ type: 'variable', value: Matrix.randn(1, 3), name: 'b_h' },
				{
					type: 'gru',
					size: 3,
					w_r: 'w_r',
					w_z: 'w_z',
					w_h: 'w_h',
					u_r: 'u_r',
					u_z: 'u_z',
					u_h: 'u_h',
					b_r: 'b_r',
					b_z: 'b_z',
					b_h: 'b_h',
					input: 'in',
				},
			],
			'mse',
			'adam'
		)
		const x = Tensor.random([1, 4, 5], -0.1, 0.1)
		const t = Matrix.random(1, 3, -0.8, 0.8)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 100, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.cols; i++) {
			expect(y.at(0, i)).toBeCloseTo(t.at(0, i))
		}
	})
})
