import NeuralNetwork from '../../../../../lib/model/neuralnetwork.js'
import Matrix from '../../../../../lib/util/matrix.js'
import Graph from '../../../../../lib/util/graph.js'

import ReadoutLayer from '../../../../../lib/model/nns/layer/readout.js'
import Tensor from '../../../../../lib/util/tensor.js'

describe('layer', () => {
	test('construct', () => {
		const layer = new ReadoutLayer({})
		expect(layer).toBeDefined()
	})

	describe.each([
		[undefined, (v, n) => v / n],
		['mean', (v, n) => v / n],
		['sum', v => v],
	])('%s', (method, func) => {
		describe('calc', () => {
			test('matrix/matrix to tensor', () => {
				const layer = new ReadoutLayer({ method })

				const graphs = [Graph.fromName('butterfly'), Graph.fromName('diamond')]
				for (let i = 0; i < graphs.length; i++) {
					for (let k = 0; k < graphs[i].order; k++) {
						graphs[i].nodes[k] = Matrix.randn(1, 7)
					}
				}
				const x = new Matrix(1, 2, graphs)
				const y = layer.calc(x)
				expect(y.sizes).toEqual([1, 2, 7])
				for (let i = 0; i < x.rows; i++) {
					for (let j = 0; j < x.cols; j++) {
						const v = x.at(i, j).nodes[0].copy()
						for (let k = 1; k < x.at(i, j).order; k++) {
							v.add(x.at(i, j).nodes[k])
						}
						for (let k = 0; k < y.sizes[2]; k++) {
							expect(y.at(i, j, k)).toBeCloseTo(func(v.at(0, k), x.at(i, j).order))
						}
					}
				}
			})

			test('tensor/matrix to matrix', () => {
				const layer = new ReadoutLayer({ method })

				const graphs = [Graph.fromName('butterfly'), Graph.fromName('diamond')]
				for (let i = 0; i < graphs.length; i++) {
					for (let k = 0; k < graphs[i].order; k++) {
						graphs[i].nodes[k] = Matrix.randn(1, 7)
					}
				}
				const x = new Tensor([2], graphs)
				const y = layer.calc(x)
				expect(y.sizes).toEqual([2, 7])
				for (let i = 0; i < x.sizes[0]; i++) {
					const v = x.at(i).nodes[0].copy()
					for (let k = 1; k < x.at(i).order; k++) {
						v.add(x.at(i).nodes[k])
					}
					for (let j = 0; j < y.sizes[1]; j++) {
						expect(y.at(i, j)).toBeCloseTo(func(v.at(0, j), x.at(i).order))
					}
				}
			})

			test('tensor/tensor to matrix', () => {
				const layer = new ReadoutLayer({ method })

				const graphs = [Graph.fromName('butterfly'), Graph.fromName('diamond')]
				for (let i = 0; i < graphs.length; i++) {
					for (let k = 0; k < graphs[i].order; k++) {
						graphs[i].nodes[k] = Tensor.randn([7])
					}
				}
				const x = new Tensor([2], graphs)
				const y = layer.calc(x)
				expect(y.sizes).toEqual([2, 7])
				for (let i = 0; i < x.sizes[0]; i++) {
					const v = x.at(i).nodes[0].copy()
					for (let k = 1; k < x.at(i).order; k++) {
						v.broadcastOperate(x.at(i).nodes[k], (a, b) => a + b)
					}
					for (let j = 0; j < y.sizes[1]; j++) {
						expect(y.at(i, j)).toBeCloseTo(func(v.at(j), x.at(i).order))
					}
				}
			})
		})

		describe('grad', () => {
			test('matrix/matrix to tensor', () => {
				const layer = new ReadoutLayer({ method })

				const graphsIn = [Graph.fromName('butterfly'), Graph.fromName('diamond')]
				for (let i = 0; i < graphsIn.length; i++) {
					for (let k = 0; k < graphsIn[i].order; k++) {
						graphsIn[i].nodes[k] = Matrix.randn(1, 7)
					}
				}
				const x = new Matrix(1, 2, graphsIn)
				layer.calc(x)

				const bo = Tensor.ones([1, 2, 7])
				const bi = layer.grad(bo)
				expect(bi.sizes).toEqual([1, 2])
				for (let i = 0; i < x.rows; i++) {
					for (let j = 0; j < x.cols; j++) {
						expect(bi.at(i, j).order).toBe(x.at(i, j).order)
						for (let k = 0; k < x.at(i, j).order; k++) {
							expect(bi.at(i, j).nodes[k].sizes).toEqual([1, 7])
							for (let t = 0; t < 7; t++) {
								expect(bi.at(i, j).nodes[k].at(0, t)).toBeCloseTo(func(1, x.at(i, j).order))
							}
						}
					}
				}
			})

			test('tensor/matrix to matrix', () => {
				const layer = new ReadoutLayer({ method })

				const graphsIn = [Graph.fromName('butterfly'), Graph.fromName('diamond')]
				for (let i = 0; i < graphsIn.length; i++) {
					for (let k = 0; k < graphsIn[i].order; k++) {
						graphsIn[i].nodes[k] = Matrix.randn(1, 7)
					}
				}
				const x = new Tensor([2], graphsIn)
				layer.calc(x)

				const bo = Matrix.ones(2, 7)
				const bi = layer.grad(bo)
				expect(bi.sizes).toEqual([2])
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(j).order).toBe(x.at(j).order)
					for (let k = 0; k < x.at(j).order; k++) {
						expect(bi.at(j).nodes[k].sizes).toEqual([1, 7])
						for (let t = 0; t < 7; t++) {
							expect(bi.at(j).nodes[k].at(0, t)).toBeCloseTo(func(1, x.at(j).order))
						}
					}
				}
			})

			test('tensor/tensor to matrix', () => {
				const layer = new ReadoutLayer({ method })

				const graphs = [Graph.fromName('butterfly'), Graph.fromName('diamond')]
				for (let i = 0; i < graphs.length; i++) {
					for (let k = 0; k < graphs[i].order; k++) {
						graphs[i].nodes[k] = Tensor.randn([7])
					}
				}
				const x = new Tensor([2], graphs)
				layer.calc(x)

				const bo = Matrix.ones(2, 7)
				const bi = layer.grad(bo)
				expect(bi.sizes).toEqual([2])
				for (let j = 0; j < x.cols; j++) {
					expect(bi.at(j).order).toBe(x.at(j).order)
					for (let k = 0; k < x.at(j).order; k++) {
						expect(bi.at(j).nodes[k].sizes).toEqual([7])
						for (let t = 0; t < 7; t++) {
							expect(bi.at(j).nodes[k].at(t)).toBeCloseTo(func(1, x.at(j).order))
						}
					}
				}
			})
		})
	})

	test('toObject', () => {
		const layer = new ReadoutLayer({})

		const obj = layer.toObject()
		expect(obj).toEqual({ type: 'readout', method: 'mean' })
	})

	test('fromObject', () => {
		const orglayer = new ReadoutLayer({})
		const layer = ReadoutLayer.fromObject(orglayer.toObject())
		expect(layer).toBeInstanceOf(ReadoutLayer)
	})
})

describe('nn', () => {
	test('calc', () => {
		const net = NeuralNetwork.fromObject([{ type: 'input' }, { type: 'readout' }])
		const graphs = [Graph.fromName('butterfly'), Graph.fromName('diamond')]
		for (let i = 0; i < graphs.length; i++) {
			for (let k = 0; k < graphs[i].order; k++) {
				graphs[i].nodes[k] = Matrix.randn(1, 7)
			}
		}
		const x = new Matrix(1, 2, graphs)

		const y = net.calc(x)
		expect(y.sizes).toEqual([1, 2, 7])
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				const v = x.at(i, j).nodes[0].copy()
				for (let k = 1; k < x.at(i, j).order; k++) {
					v.add(x.at(i, j).nodes[k])
				}
				for (let k = 0; k < y.sizes[2]; k++) {
					expect(y.at(i, j, k)).toBeCloseTo(v.at(0, k) / x.at(i, j).order)
				}
			}
		}
	})
})
