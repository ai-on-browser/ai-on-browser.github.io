import NeuralNetwork from '../../../lib/model/neuralnetwork.js'

describe('neuralnetwork', () => {
	describe('constructor', () => {
		test('layer', () => {
			const net = new NeuralNetwork([{ type: 'input' }])

			expect(net._layers).toHaveLength(2)
			expect(net._layers[0].constructor.name).toBe('InputLayer')
			expect(net._layers[1].constructor.name).toBe('OutputLayer')
			expect(net._request_layer).toEqual([{ type: 'input' }, { type: 'output' }])
			expect(net._optimizer).toBe('sgd')
			expect(net._opt.constructor.name).toBe('SGDOptimizer')

			const y = net
				.calc([
					[1, 2],
					[3, 4],
				])
				.toArray()
			expect(y).toEqual([
				[1, 2],
				[3, 4],
			])
		})

		test('loss', () => {
			const net = new NeuralNetwork([{ type: 'input' }], 'mse')

			expect(net._layers).toHaveLength(3)
			expect(net._layers[0].constructor.name).toBe('InputLayer')
			expect(net._layers[1].constructor.name).toBe('OutputLayer')
			expect(net._layers[2].constructor.name).toBe('MSELayer')
			expect(net._request_layer).toEqual([{ type: 'input' }, { type: 'output' }, { type: 'mse' }])

			const y = net
				.calc([
					[1, 2],
					[3, 4],
				])
				.toArray()
			expect(y).toEqual([
				[1, 2],
				[3, 4],
			])
		})

		test('const', () => {
			const net = new NeuralNetwork([
				{ type: 'input', name: 'in' },
				{ type: 'add', input: [1, 'in'] },
			])

			expect(net._layers).toHaveLength(4)
			expect(net._layers[0].constructor.name).toBe('ConstLayer')
			expect(net._layers[0]._value).toBe(1)
			expect(net._layers[1].constructor.name).toBe('InputLayer')
			expect(net._layers[2].constructor.name).toBe('AddLayer')
			expect(net._layers[3].constructor.name).toBe('OutputLayer')
			expect(net._request_layer).toEqual([
				{ type: 'input', name: 'in', input: [] },
				{ type: 'add', input: ['__const_number_1', 'in'] },
				{ type: 'output' },
			])

			const y = net
				.calc([
					[1, 2],
					[3, 4],
				])
				.toArray()
			expect(y).toEqual([
				[2, 3],
				[4, 5],
			])
		})

		describe('optimizer', () => {
			test('sgd', () => {
				const net = new NeuralNetwork([{ type: 'input' }], null, 'sgd')
				expect(net._optimizer).toBe('sgd')
				expect(net._opt.constructor.name).toBe('SGDOptimizer')
			})

			test('adam', () => {
				const net = new NeuralNetwork([{ type: 'input' }], null, 'adam')
				expect(net._optimizer).toBe('adam')
				expect(net._opt.constructor.name).toBe('AdamOptimizer')
			})

			test('momentum', () => {
				const net = new NeuralNetwork([{ type: 'input' }], null, 'momentum')
				expect(net._optimizer).toBe('momentum')
				expect(net._opt.constructor.name).toBe('MomentumOptimizer')
			})

			test('rmsprop', () => {
				const net = new NeuralNetwork([{ type: 'input' }], null, 'rmsprop')
				expect(net._optimizer).toBe('rmsprop')
				expect(net._opt.constructor.name).toBe('RMSPropOptimizer')
			})
		})
	})

	test.todo('calc')

	test.todo('grad')

	test.todo('update')

	test.todo('fit')
})
