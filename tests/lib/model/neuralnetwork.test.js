import fs from 'fs'
import path from 'path'
import url from 'url'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

import Matrix from '../../../lib/util/matrix.js'
import Tensor from '../../../lib/util/tensor.js'
import NeuralNetwork, { ComputationalGraph, NeuralnetworkException } from '../../../lib/model/neuralnetwork.js'

describe('neuralnetwork', () => {
	describe('constructor', () => {
		test('optimizer default', () => {
			const graph = ComputationalGraph.fromObject([{ type: 'input' }])
			const net = new NeuralNetwork(graph)
			expect(net._optimizer).toBe('sgd')
			expect(net._opt.constructor.name).toBe('SGDOptimizer')
		})

		test.each([
			[null, 'SGDOptimizer'],
			['sgd', 'SGDOptimizer'],
			['adam', 'AdamOptimizer'],
			['momentum', 'MomentumOptimizer'],
			['rmsprop', 'RMSPropOptimizer'],
			['adagrad', 'AdaGradOptimizer'],
			['adadelta', 'AdaDeltaOptimizer'],
			['rmspropgraves', 'RMSPropGravesOptimizer'],
			['smorms3', 'SMORMS3Optimizer'],
			['adamax', 'AdaMaxOptimizer'],
			['nadam', 'NadamOptimizer'],
		])('optimizer %s', (optimizer, className) => {
			const graph = ComputationalGraph.fromObject([{ type: 'input' }])
			const net = new NeuralNetwork(graph, optimizer)
			expect(net._optimizer).toBe(optimizer)
			expect(net._opt.constructor.name).toBe(className)
		})
	})

	describe('fromObject', () => {
		test('layer', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }])

			expect(net._graph.nodes).toHaveLength(2)
			expect(net._graph.nodes[0].layer.constructor.name).toBe('InputLayer')
			expect(net._graph.nodes[1].layer.constructor.name).toBe('OutputLayer')
			expect(net._optimizer).toBe('sgd')
			expect(net._opt.constructor.name).toBe('SGDOptimizer')

			const x = [
				[1, 2],
				[3, 4],
			]
			const y = net.calc(x).toArray()
			expect(y).toEqual(x)
		})

		test('output', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'output' }])

			expect(net._graph.nodes).toHaveLength(2)
			expect(net._graph.nodes[0].layer.constructor.name).toBe('InputLayer')
			expect(net._graph.nodes[1].layer.constructor.name).toBe('OutputLayer')
			expect(net._optimizer).toBe('sgd')
			expect(net._opt.constructor.name).toBe('SGDOptimizer')

			const x = [
				[1, 2],
				[3, 4],
			]
			const y = net.calc(x).toArray()
			expect(y).toEqual(x)
		})

		test('loss', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }], 'mse')

			expect(net._graph.nodes).toHaveLength(3)
			expect(net._graph.nodes[0].layer.constructor.name).toBe('InputLayer')
			expect(net._graph.nodes[1].layer.constructor.name).toBe('OutputLayer')
			expect(net._graph.nodes[2].layer.constructor.name).toBe('MSELayer')

			const x = [
				[1, 2],
				[3, 4],
			]
			const y = net.calc(x).toArray()
			expect(y).toEqual(x)
		})

		test('const', () => {
			const net = NeuralNetwork.fromObject([
				{ type: 'input', name: 'in' },
				{ type: 'add', input: [1, 'in'] },
			])

			expect(net._graph.nodes).toHaveLength(3)
			expect(net._graph.nodes[0].layer.constructor.name).toBe('InputLayer')
			expect(net._graph.nodes[1].layer.constructor.name).toBe('AddLayer')
			expect(net._graph.nodes[2].layer.constructor.name).toBe('OutputLayer')

			const x = [
				[1, 2],
				[3, 4],
			]
			const y = net.calc(x).toArray()
			expect(y).toEqual([
				[2, 3],
				[4, 5],
			])
		})

		describe('optimizer', () => {
			test('sgd', () => {
				const net = NeuralNetwork.fromObject([{ type: 'input' }], null, 'sgd')
				expect(net._optimizer).toBe('sgd')
				expect(net._opt.constructor.name).toBe('SGDOptimizer')
			})

			test('adam', () => {
				const net = NeuralNetwork.fromObject([{ type: 'input' }], null, 'adam')
				expect(net._optimizer).toBe('adam')
				expect(net._opt.constructor.name).toBe('AdamOptimizer')
			})

			test('momentum', () => {
				const net = NeuralNetwork.fromObject([{ type: 'input' }], null, 'momentum')
				expect(net._optimizer).toBe('momentum')
				expect(net._opt.constructor.name).toBe('MomentumOptimizer')
			})

			test('rmsprop', () => {
				const net = NeuralNetwork.fromObject([{ type: 'input' }], null, 'rmsprop')
				expect(net._optimizer).toBe('rmsprop')
				expect(net._opt.constructor.name).toBe('RMSPropOptimizer')
			})
		})
	})

	describe('fromONNX', () => {
		test('import', async () => {
			const buf = await fs.promises.readFile(`${filepath}/nns/onnx/test_pytorch.onnx`)
			const net = await NeuralNetwork.fromONNX(buf)
			const y = net.calc([[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]).toArray()
			expect(y).toHaveLength(1)
			expect(y[0]).toHaveLength(2)
		})
	})

	test('copy', () => {
		const org = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'output' }])

		const net = org.copy()
		expect(net._graph.nodes).toHaveLength(2)
		expect(net._graph.nodes[0].layer.constructor.name).toBe('InputLayer')
		expect(net._graph.nodes[1].layer.constructor.name).toBe('OutputLayer')
		expect(net._optimizer).toBe('sgd')
		const x = [
			[1, 2],
			[3, 4],
		]
		const y = net.calc(x).toArray()
		expect(y).toEqual(x)
	})

	test('toObject', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'output' }])

		const obj = net.toObject()
		expect(obj).toEqual([{ type: 'input', name: null }, { type: 'output' }])
	})

	describe('calc', () => {
		test('1d array', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }])

			const x = [1, 2]
			const y = net.calc(x).toArray()
			expect(y).toEqual([1, 2])
		})

		test('2d array', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }])

			const x = [
				[1, 2],
				[3, 4],
			]
			const y = net.calc(x).toArray()
			expect(y).toEqual([
				[1, 2],
				[3, 4],
			])
		})

		test('matrix', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }])

			const x = Matrix.fromArray([
				[1, 2],
				[3, 4],
			])
			const y = net.calc(x).toArray()
			expect(y).toEqual([
				[1, 2],
				[3, 4],
			])
		})

		test('tensor', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }])

			const x = Tensor.fromArray([1, 2])
			const y = net.calc(x).toArray()
			expect(y).toEqual([1, 2])
		})

		test('object array', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input', name: 'in' }])

			const x = { in: [1, 2] }
			const y = net.calc(x).toArray()
			expect(y).toEqual([1, 2])
		})

		test('object matrix', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input', name: 'in' }])

			const x = {
				in: Matrix.fromArray([
					[1, 2],
					[3, 4],
				]),
			}
			const y = net.calc(x).toArray()
			expect(y).toEqual([
				[1, 2],
				[3, 4],
			])
		})

		test('object tensor', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input', name: 'in' }])

			const x = { in: Tensor.fromArray([1, 2]) }
			const y = net.calc(x).toArray()
			expect(y).toEqual([1, 2])
		})

		test('object with scalar', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input', name: 'in' }])

			const x = { in: 1 }
			const y = net.calc(x).toArray()
			expect(y).toEqual([[1]])
		})

		test('specify out', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input', name: 'in' }])

			const x = [1, 2]
			const y = net.calc(x, undefined, ['in'])
			expect(y.in.toArray()).toEqual([1, 2])
		})

		test('specify supervised', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input', name: 'in' }])

			const x = [1, 2]
			const y = net.calc(x, [2, 3]).toArray()
			expect(y).toEqual([1, 2])
		})
	})

	describe('grad', () => {
		test('with error', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }])
			const e = Matrix.fromArray([[1, 2]])
			const g = net.grad(e).toArray()
			expect(g).toEqual([[1, 2]])
		})

		test('without error', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }])
			const g = net.grad().toArray()
			expect(g).toEqual([[1]])
		})
	})

	test('update', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'full', out_size: 1 }, { type: 'mse' }])
		const x = [[1, 2]]
		const t = Matrix.fromArray([[0]])
		const l1 = net.calc(x, t).toScaler()
		net.grad()
		net.update(0.1)
		const l2 = net.calc(x, t).toScaler()
		expect(l2).toBeLessThan(l1)
	})

	describe('fit', () => {
		test('no batch size', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'full', out_size: 1 }, { type: 'mse' }])
			const x = [[1, 2]]
			const t = [[0]]
			const l1 = net.calc(x, t).toScaler()
			net.fit(x, t)
			const l2 = net.calc(x, t).toScaler()
			expect(l2).toBeLessThan(l1)
		})

		test('array with batch size', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'full', out_size: 1 }, { type: 'mse' }])
			const x = [[1, 2]]
			const t = [[0]]
			const l1 = net.calc(x, t).toScaler()
			net.fit(x, t, 10, 0.1, 10)
			const l2 = net.calc(x, t).toScaler()
			expect(l2).toBeLessThan(l1)
		})

		test('matrix with batch size', () => {
			const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'full', out_size: 1 }, { type: 'mse' }])
			const x = Matrix.fromArray([[1, 2]])
			const t = [[0]]
			const l1 = net.calc(x, t).toScaler()
			net.fit(x, t, 10, 0.1, 10)
			const l2 = net.calc(x, t).toScaler()
			expect(l2).toBeLessThan(l1)
		})

		test('tensor with batch size', () => {
			const net = NeuralNetwork.fromObject([
				{ type: 'input' },
				{ type: 'reshape', size: [2] },
				{ type: 'full', out_size: 1 },
				{ type: 'mse' },
			])
			const x = Tensor.fromArray([[1, 2]])
			const t = [[0]]
			const l1 = net.calc(x, t).toScaler()
			net.fit(x, t, 10, 0.1, 10)
			const l2 = net.calc(x, t).toScaler()
			expect(l2).toBeLessThan(l1)
		})

		test('object array with batch size', () => {
			const net = NeuralNetwork.fromObject([
				{ type: 'input', name: 'in' },
				{ type: 'full', out_size: 1 },
				{ type: 'mse' },
			])
			const x = {
				in: [
					[1, 2],
					[2, 3],
				],
				a: [1],
				b: null,
			}
			const t = [[0], [1]]
			const l1 = net.calc(x, t).toScaler()
			net.fit(x, t, 10, 0.1, 10)
			const l2 = net.calc(x, t).toScaler()
			expect(l2).toBeLessThan(l1)
		})

		test('object matrix with batch size', () => {
			const net = NeuralNetwork.fromObject([
				{ type: 'input', name: 'in' },
				{ type: 'full', out_size: 1 },
				{ type: 'mse' },
			])
			const x = { in: Matrix.fromArray([[1, 2]]) }
			const t = [[0]]
			const l1 = net.calc(x, t).toScaler()
			net.fit(x, t, 10, 0.1, 10)
			const l2 = net.calc(x, t).toScaler()
			expect(l2).toBeLessThan(l1)
		})
	})

	test('predict', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }])

		const x = [1, 2]
		const y = net.predict(x)
		expect(y).toEqual([1, 2])
	})
})

describe('neuralnetwork exception', () => {
	test('constructor', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }])
		const e = new NeuralnetworkException('hoge', net)
		expect(e.message).toBe('hoge')
		expect(e.value).toBe(net)
	})
})
