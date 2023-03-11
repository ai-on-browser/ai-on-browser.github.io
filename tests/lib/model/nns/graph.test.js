import fs from 'fs'
import path from 'path'
import url from 'url'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

import Matrix from '../../../../lib/util/matrix.js'

import ComputationalGraph from '../../../../lib/model/nns/graph.js'

import Layer from '../../../../lib/model/nns/layer/base.js'

describe('Computational Graph', () => {
	test('constructor', () => {
		const graph = new ComputationalGraph()
		expect(graph.size).toBe(0)
	})

	describe('fromObject', () => {
		test('tanh', () => {
			const graph = ComputationalGraph.fromObject([{ type: 'input' }, { type: 'tanh' }])
			const x = Matrix.randn(100, 3)
			graph.bind({ input: x })
			graph.calc()
			const y = graph.nodes[1].outputValue
			expect(y.sizes).toEqual([100, 3])
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBe(Math.tanh(x.at(i, j)))
				}
			}
		})

		test('add', () => {
			const graph = ComputationalGraph.fromObject([
				{ type: 'input', name: 'in' },
				{ type: 'const', value: 2, name: 'c' },
				{ type: 'add', input: ['in', 'c'] },
			])
			const x = Matrix.randn(100, 3)
			graph.bind({ input: x })
			graph.calc()
			const y = graph.nodes[2].outputValue
			expect(y.sizes).toEqual([100, 3])
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBe(x.at(i, j) + 2)
				}
			}
		})

		test('string input', () => {
			const graph = ComputationalGraph.fromObject([
				{ type: 'input', name: 'in' },
				{ type: 'identity', input: 'in' },
			])
			const x = Matrix.randn(100, 3)
			graph.bind({ input: x })
			graph.calc()
			const y = graph.nodes[1].outputValue
			expect(y.sizes).toEqual([100, 3])
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBe(x.at(i, j))
				}
			}
		})
	})

	describe('fromONNX', () => {
		test('import', async () => {
			const buf = await fs.promises.readFile(`${filepath}/onnx/test_pytorch.onnx`)
			const net = await ComputationalGraph.fromONNX(buf)
			net.bind({ input: Matrix.fromArray([[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]) })
			net.calc()
			const y = net.nodes.at(-1).outputValue.toArray()
			expect(y).toHaveLength(1)
			expect(y[0]).toHaveLength(2)
		})
	})

	describe('toObject', () => {
		test('tanh', () => {
			const graph = new ComputationalGraph()
			graph.add(Layer.fromObject({ type: 'input' }))
			graph.add(Layer.fromObject({ type: 'tanh' }))
			const obj = graph.toObject()
			expect(obj).toHaveLength(2)

			const fo = ComputationalGraph.fromObject(obj)
			const x = Matrix.randn(100, 3)
			fo.bind({ input: x })
			fo.calc()
			const y = fo.nodes[1].outputValue
			expect(y.sizes).toEqual([100, 3])
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBe(Math.tanh(x.at(i, j)))
				}
			}
		})

		test('add', () => {
			const graph = new ComputationalGraph()
			graph.add(Layer.fromObject({ type: 'input' }), 'in')
			graph.add(Layer.fromObject({ type: 'const', value: 2 }), 'c')
			graph.add(Layer.fromObject({ type: 'add' }), 'op', ['in', 'c'])
			const obj = graph.toObject()
			expect(obj).toHaveLength(3)

			const fo = ComputationalGraph.fromObject(obj)
			const x = Matrix.randn(100, 3)
			fo.bind({ input: x })
			fo.calc()
			const y = fo.nodes[2].outputValue
			expect(y.sizes).toEqual([100, 3])
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBe(x.at(i, j) + 2)
				}
			}
		})
	})

	test('toDot', () => {
		const graph = new ComputationalGraph()
		graph.add(Layer.fromObject({ type: 'input' }))
		graph.add(Layer.fromObject({ type: 'tanh' }))
		expect(graph.toDot()).toBe(
			'digraph g {\n  l0 [label="InputLayer\\nundefined"];\n  l1 [label="TanhLayer\\nundefined"];\n  l0 -> l1;\n}'
		)
	})

	describe('add', () => {
		test('string input', () => {
			const graph = new ComputationalGraph()
			graph.add(Layer.fromObject({ type: 'input' }), 'in')
			graph.add(Layer.fromObject({ type: 'tanh' }), undefined, 'in')

			expect(graph.nodes[1].parents).toHaveLength(1)
			expect(graph.nodes[1].parents[0].index).toBe(0)
			expect(graph.nodes[1].parents[0].subscript).toBeNull()
		})

		test('subscript input', () => {
			const graph = new ComputationalGraph()
			graph.add(Layer.fromObject({ type: 'input' }), 'in')
			graph.add(Layer.fromObject({ type: 'tanh' }), undefined, 'in[0]')

			expect(graph.nodes[1].parents).toHaveLength(1)
			expect(graph.nodes[1].parents[0].index).toBe(0)
			expect(graph.nodes[1].parents[0].subscript).toBe(0)
		})

		test('invalid input name', () => {
			const graph = new ComputationalGraph()
			graph.add(Layer.fromObject({ type: 'input' }), 'in0')
			expect(() => graph.add(Layer.fromObject({ type: 'tanh' }), undefined, 'in1')).toThrow(
				"Unknown input name 'in1'."
			)
		})

		test('duplicate name', () => {
			const graph = new ComputationalGraph()
			graph.add(Layer.fromObject({ type: 'input' }), 'in')
			expect(() => graph.add(Layer.fromObject({ type: 'tanh' }), 'in')).toThrow('Duplicate layer name in')
		})
	})

	test.todo('bind')

	describe('calc', () => {
		test('tanh', () => {
			const graph = new ComputationalGraph()
			graph.add(Layer.fromObject({ type: 'input' }))
			graph.add(Layer.fromObject({ type: 'tanh' }))

			const x = Matrix.randn(100, 3)
			graph.bind({ input: x })
			graph.calc()
			const y = graph.nodes[1].outputValue
			expect(y.sizes).toEqual([100, 3])
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBe(Math.tanh(x.at(i, j)))
				}
			}
		})

		test('add', () => {
			const graph = new ComputationalGraph()
			graph.add(Layer.fromObject({ type: 'input' }), 'in')
			graph.add(Layer.fromObject({ type: 'const', value: 2 }), 'c')
			graph.add(Layer.fromObject({ type: 'add' }), 'op', ['in', 'c'])

			const x = Matrix.randn(100, 3)
			graph.bind({ input: x })
			graph.calc()
			const y = graph.nodes[2].outputValue
			expect(y.sizes).toEqual([100, 3])
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBe(x.at(i, j) + 2)
				}
			}
		})

		test('require', () => {
			const graph = new ComputationalGraph()
			graph.add(Layer.fromObject({ type: 'input' }), 'l0')
			graph.add(Layer.fromObject({ type: 'sin' }), 'l1')
			graph.add(Layer.fromObject({ type: 'tanh' }), 'l2')

			const x = Matrix.randn(100, 3)
			graph.bind({ input: x })
			graph.calc(['l1'])
			expect(graph.nodes[1].outputValue).toBeDefined()
			expect(graph.nodes[2].outputValue).toBeNull()
		})

		test('require number', () => {
			const graph = new ComputationalGraph()
			graph.add(Layer.fromObject({ type: 'input' }), 'l0')
			graph.add(Layer.fromObject({ type: 'sin' }), 'l1')
			graph.add(Layer.fromObject({ type: 'tanh' }), 'l2')

			const x = Matrix.randn(100, 3)
			graph.bind({ input: x })
			graph.calc([1])
			expect(graph.nodes[1].outputValue).toBeDefined()
			expect(graph.nodes[2].outputValue).toBeNull()
		})

		test('subscript input', () => {
			const graph = new ComputationalGraph()
			graph.add(Layer.fromObject({ type: 'input' }))
			graph.add(Layer.fromObject({ type: 'split', size: 2 }), 'spl')
			graph.add(Layer.fromObject({ type: 'tanh' }), undefined, 'spl[0]')

			const x = Matrix.randn(100, 4)
			graph.bind({ input: x })
			graph.calc()
			const y = graph.nodes[2].outputValue
			expect(y.sizes).toEqual([100, 2])
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols / 2; j++) {
					expect(y.at(i, j)).toBe(Math.tanh(x.at(i, j)))
				}
			}
		})

		test('multioutput layer', () => {
			const graph = new ComputationalGraph()
			graph.add(Layer.fromObject({ type: 'input' }))
			graph.add(Layer.fromObject({ type: 'sin' }), 'sin')
			graph.add(Layer.fromObject({ type: 'tanh' }), 'tanh')
			graph.add(Layer.fromObject({ type: 'add' }), undefined, ['sin', 'tanh'])

			const x = Matrix.randn(100, 4)
			graph.bind({ input: x })
			graph.calc()
			const y = graph.nodes[3].outputValue
			expect(y.sizes).toEqual([100, 4])
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(y.at(i, j)).toBe(Math.sin(x.at(i, j)) + Math.tanh(Math.sin(x.at(i, j))))
				}
			}
		})
	})

	describe('grad', () => {
		test('tanh', () => {
			const graph = new ComputationalGraph()
			graph.add(Layer.fromObject({ type: 'input' }))
			graph.add(Layer.fromObject({ type: 'tanh' }))
			graph.add(Layer.fromObject({ type: 'output' }))

			const x = Matrix.randn(100, 3)
			graph.bind({ input: x })
			graph.calc()
			graph.grad(Matrix.ones(100, 3))
			const g = graph.nodes[0].gradientValue[0]
			expect(g.sizes).toEqual([100, 3])
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(g.at(i, j)).toBe(1 - Math.tanh(x.at(i, j)) ** 2)
				}
			}
		})

		test('mult', () => {
			const graph = new ComputationalGraph()
			graph.add(Layer.fromObject({ type: 'input' }), 'in')
			graph.add(Layer.fromObject({ type: 'const', value: 2 }), 'c')
			graph.add(Layer.fromObject({ type: 'mult' }), 'op', ['in', 'c'])
			graph.add(Layer.fromObject({ type: 'output' }))

			const x = Matrix.randn(100, 3)
			graph.bind({ input: x })
			graph.calc()
			graph.grad(Matrix.ones(100, 3))
			const g = graph.nodes[0].gradientValue[0]
			expect(g.sizes).toEqual([100, 3])
			for (let i = 0; i < x.rows; i++) {
				for (let j = 0; j < x.cols; j++) {
					expect(g.at(i, j)).toBe(2)
				}
			}
		})

		test('subscript input', () => {
			const graph = new ComputationalGraph()
			graph.add(Layer.fromObject({ type: 'input' }))
			graph.add(Layer.fromObject({ type: 'split', size: 2 }), 'spl')
			graph.add(Layer.fromObject({ type: 'tanh' }), undefined, 'spl[0]')
			graph.add(Layer.fromObject({ type: 'output' }))

			const x = Matrix.randn(100, 4)
			graph.bind({ input: x })
			graph.calc()
			graph.grad(Matrix.ones(100, 2))
			const g = graph.nodes[0].gradientValue[0]
			expect(g.sizes).toEqual([100, 4])
		})

		test('multioutput layer', () => {
			const graph = new ComputationalGraph()
			graph.add(Layer.fromObject({ type: 'input' }))
			graph.add(Layer.fromObject({ type: 'sin' }), 'sin')
			graph.add(Layer.fromObject({ type: 'tanh' }), 'tanh')
			graph.add(Layer.fromObject({ type: 'add' }), undefined, ['sin', 'tanh'])
			graph.add(Layer.fromObject({ type: 'output' }))

			const x = Matrix.randn(100, 4)
			graph.bind({ input: x })
			graph.calc()
			graph.grad(Matrix.ones(100, 4))
			const g = graph.nodes[0].gradientValue[0]
			expect(g.sizes).toEqual([100, 4])
		})
	})
})
