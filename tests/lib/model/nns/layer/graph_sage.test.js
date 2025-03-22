import { jest } from '@jest/globals'
jest.retryTimes(3)

import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Graph from '../../../../../lib/util/graph.js'

import GraphSAGELayer from '../../../../../lib/model/nns/layer/graph_sage.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new GraphSAGELayer({ out_size: 5 })
		expect(layer).toBeDefined()
	})

	test('dependentLayers', () => {
		const layer = new GraphSAGELayer({ w: 'w', b: 'b', activation: { type: 'clip', min: 'min' } })
		const dl = layer.dependentLayers
		expect(dl.sort()).toEqual(['w', 'b', 'min'].sort())
	})

	describe('calc', () => {
		test('graph', () => {
			const layer = new GraphSAGELayer({ out_size: 5 })

			const graphs = [Graph.fromName('butterfly'), Graph.fromName('diamond')]
			for (let i = 0; i < graphs.length; i++) {
				for (let k = 0; k < graphs[i].order; k++) {
					graphs[i].nodes[k] = Matrix.randn(1, 7)
				}
			}
			const x = new Matrix(1, 2, graphs)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					for (let k = 0; k < x.at(i, j).order; k++) {
						expect(y.at(i, j).nodes[k].sizes).toEqual([1, 5])
					}
				}
			}
		})

		test('string activation', () => {
			const layer = new GraphSAGELayer({ out_size: 5, activation: 'sigmoid' })

			const graphs = [Graph.fromName('butterfly'), Graph.fromName('diamond')]
			for (let i = 0; i < graphs.length; i++) {
				for (let k = 0; k < graphs[i].order; k++) {
					graphs[i].nodes[k] = Matrix.randn(1, 7)
				}
			}
			const x = new Matrix(1, 2, graphs)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					for (let k = 0; k < x.at(i, j).order; k++) {
						expect(y.at(i, j).nodes[k].sizes).toEqual([1, 5])
						for (let m = 0; m < 5; m++) {
							expect(y.at(i, j).nodes[k].at(0, m)).toBeGreaterThanOrEqual(0)
							expect(y.at(i, j).nodes[k].at(0, m)).toBeLessThanOrEqual(1)
						}
					}
				}
			}
		})

		test('object activation', () => {
			const layer = new GraphSAGELayer({ out_size: 5, activation: { type: 'sigmoid' } })

			const graphs = [Graph.fromName('butterfly'), Graph.fromName('diamond')]
			for (let i = 0; i < graphs.length; i++) {
				for (let k = 0; k < graphs[i].order; k++) {
					graphs[i].nodes[k] = Matrix.randn(1, 7)
				}
			}
			const x = new Matrix(1, 2, graphs)
			const y = layer.calc(x)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					for (let k = 0; k < x.at(i, j).order; k++) {
						expect(y.at(i, j).nodes[k].sizes).toEqual([1, 5])
						for (let m = 0; m < 5; m++) {
							expect(y.at(i, j).nodes[k].at(0, m)).toBeGreaterThanOrEqual(0)
							expect(y.at(i, j).nodes[k].at(0, m)).toBeLessThanOrEqual(1)
						}
					}
				}
			}
		})
	})

	describe('grad', () => {
		test('graph', () => {
			const layer = new GraphSAGELayer({ out_size: 5 })

			const graphsIn = [Graph.fromName('butterfly'), Graph.fromName('diamond')]
			const graphsBo = [Graph.fromName('butterfly'), Graph.fromName('diamond')]
			for (let i = 0; i < graphsIn.length; i++) {
				for (let k = 0; k < graphsIn[i].order; k++) {
					graphsIn[i].nodes[k] = Matrix.randn(1, 7)
					graphsBo[i].nodes[k] = Matrix.ones(1, 5)
				}
			}
			const x = new Matrix(1, 2, graphsIn)
			layer.calc(x)

			const bo = new Matrix(1, 2, graphsBo)
			const bi = layer.grad(bo)
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					for (let k = 0; k < x.at(i, j).order; k++) {
						expect(bi.at(i, j).nodes[k].sizes).toEqual([1, 7])
					}
				}
			}
		})
	})

	test('toObject', () => {
		const layer = new GraphSAGELayer({ out_size: 5 })

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'graph_sage', aggregate: 'mean', l1_decay: 0, l2_decay: 0, out_size: 5 })
	})

	test('fromObject', () => {
		const orglayer = new GraphSAGELayer({})
		const layer = GraphSAGELayer.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(GraphSAGELayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'graph_sage', out_size: 5 }])
		const graphs = [Graph.fromName('butterfly'), Graph.fromName('diamond')]
		for (let i = 0; i < graphs.length; i++) {
			for (let k = 0; k < graphs[i].order; k++) {
				graphs[i].nodes[k] = Matrix.randn(1, 7)
			}
		}
		const x = new Matrix(1, 2, graphs)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				for (let k = 0; k < x.at(i, j).order; k++) {
					expect(y.at(i, j).nodes[k].sizes).toEqual([1, 5])
				}
			}
		}
	})

	test('grad', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'graph_sage', out_size: 2 }, { type: 'readout' }],
			'mse',
			'adam'
		)
		const graphs = [Graph.fromName('butterfly'), Graph.fromName('diamond')]
		for (let i = 0; i < graphs.length; i++) {
			for (let k = 0; k < graphs[i].order; k++) {
				graphs[i].nodes[k] = Matrix.randn(1, 7)
			}
		}
		const x = new Matrix(2, 1, graphs)
		const t = new Tensor([2, 1, 2], [0, 1, 1, 0])

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.sizes[1]; i++) {
			for (let j = 0; j < t.sizes[2]; j++) {
				expect(y.at(0, i, j)).toBeCloseTo(t.at(0, i, j))
			}
		}
	})

	test('activation', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input' },
				{
					type: 'graph_sage',
					out_size: 2,
					w: Matrix.random(10, 2, -0.1, 0.1).toArray(),
					b: Matrix.zeros(1, 2).toArray(),
					activation: 'tanh',
				},
				{ type: 'readout' },
			],
			'mse',
			'adam'
		)
		const graphs = [Graph.fromName('butterfly'), Graph.fromName('diamond')]
		for (let i = 0; i < graphs.length; i++) {
			for (let k = 0; k < graphs[i].order; k++) {
				graphs[i].nodes[k] = Matrix.random(1, 5, -0.1, 0.1)
			}
		}
		const x = new Matrix(2, 1, graphs)
		const t = new Tensor([2, 1, 2], [0, 1, 1, 0])

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.1)
			if (loss[0] < 1.0e-4) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.sizes[1]; i++) {
			for (let j = 0; j < t.sizes[2]; j++) {
				expect(y.at(0, i, j)).toBeCloseTo(t.at(0, i, j), 1)
			}
		}
	})

	test('string parameters', () => {
		const net = NeuralNetwork.fromObject(
			[
				{ type: 'input', name: 'in' },
				{ type: 'variable', value: Matrix.randn(14, 2), name: 'w' },
				{ type: 'variable', value: Matrix.randn(1, 2), name: 'b' },
				{ type: 'graph_sage', input: 'in', w: 'w', b: 'b' },
				{ type: 'readout' },
			],
			'mse',
			'adam'
		)
		const graphs = [Graph.fromName('butterfly'), Graph.fromName('diamond')]
		for (let i = 0; i < graphs.length; i++) {
			for (let k = 0; k < graphs[i].order; k++) {
				graphs[i].nodes[k] = Matrix.randn(1, 7)
			}
		}
		const x = new Matrix(2, 1, graphs)
		const t = new Tensor([2, 1, 2], [0, 1, 1, 0])

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.01)
			if (loss[0] < 1.0e-8) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.sizes[1]; i++) {
			for (let j = 0; j < t.sizes[2]; j++) {
				expect(y.at(0, i, j)).toBeCloseTo(t.at(0, i, j))
			}
		}
	})

	test('grad decay', () => {
		const net = NeuralNetwork.fromObject(
			[{ type: 'input' }, { type: 'graph_sage', out_size: 3, l2_decay: 0.001 }, { type: 'readout' }],
			'mse',
			'adam'
		)
		const graphs = [Graph.fromName('butterfly'), Graph.fromName('diamond')]
		for (let i = 0; i < graphs.length; i++) {
			for (let k = 0; k < graphs[i].order; k++) {
				graphs[i].nodes[k] = Matrix.randn(1, 4)
			}
		}
		const x = new Matrix(1, 2, graphs)
		const t = Tensor.random([1, 2, 3], -0.8, 0.8)

		for (let i = 0; i < 100; i++) {
			const loss = net.fit(x, t, 1000, 0.1)
			if (loss[0] < 1.0e-4) {
				break
			}
		}

		const y = net.calc(x)
		for (let i = 0; i < t.sizes[1]; i++) {
			for (let j = 0; j < t.sizes[2]; j++) {
				expect(y.at(0, i, j)).toBeCloseTo(t.at(0, i, j), 1)
			}
		}
	})
})
