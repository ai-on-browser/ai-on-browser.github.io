import { jest } from '@jest/globals'
jest.retryTimes(20)

import Graph, { Edge } from '../../../lib/util/graph.js'

describe('graph', () => {
	describe('constructor', () => {
		test('default', () => {
			const graph = new Graph()

			expect(graph.order).toBe(0)
			expect(graph.size).toBe(0)
		})

		test('node number', () => {
			const graph = new Graph(3)

			expect(graph.order).toBe(3)
			expect(graph.size).toBe(0)
		})

		test('node values', () => {
			const graph = new Graph([1, 3], [])

			expect(graph.order).toBe(2)
			expect(graph.nodes).toEqual([1, 3])
			expect(graph.size).toBe(0)
		})

		test('edge values', () => {
			const graph = new Graph(2, [[0, 1]])

			expect(graph.order).toBe(2)
			expect(graph.size).toBe(1)
			expect(graph.edges[0]).toBeInstanceOf(Edge)
			expect(graph.edges[0][0]).toBe(0)
			expect(graph.edges[0][1]).toBe(1)
			expect(graph.edges[0].value).toBe(1)
			expect(graph.edges[0].direct).toBeFalsy()
		})
	})

	describe('fromAdjacency', () => {
		test('0', () => {
			const graph = Graph.fromAdjacency([])
			expect(graph.order).toBe(0)
			expect(graph.size).toBe(0)
		})

		describe('1', () => {
			test.each([0, false])('%p', e => {
				const graph = Graph.fromAdjacency([[e]])
				expect(graph.order).toBe(1)
				expect(graph.size).toBe(0)
			})

			test.each([1, true])('%p', e => {
				const graph = Graph.fromAdjacency([[e]])
				expect(graph.order).toBe(1)
				expect(graph.size).toBe(1)
				expect(graph.edges[0]).toBeInstanceOf(Edge)
				expect(graph.edges[0][0]).toBe(0)
				expect(graph.edges[0][1]).toBe(0)
				expect(graph.edges[0].value).toBe(1)
				expect(graph.edges[0].direct).toBeFalsy()
			})
		})

		test('undirect', () => {
			const graph = Graph.fromAdjacency([
				[0, 1],
				[1, 0],
			])
			expect(graph.order).toBe(2)
			expect(graph.size).toBe(1)
			expect(graph.edges[0]).toBeInstanceOf(Edge)
			expect(graph.edges[0][0]).toBe(0)
			expect(graph.edges[0][1]).toBe(1)
			expect(graph.edges[0].value).toBe(1)
			expect(graph.edges[0].direct).toBeFalsy()
		})

		describe('direct', () => {
			test('0 -> 1', () => {
				const graph = Graph.fromAdjacency([
					[0, 1],
					[0, 0],
				])
				expect(graph.order).toBe(2)
				expect(graph.size).toBe(1)
				expect(graph.edges[0]).toBeInstanceOf(Edge)
				expect(graph.edges[0][0]).toBe(0)
				expect(graph.edges[0][1]).toBe(1)
				expect(graph.edges[0].value).toBe(1)
				expect(graph.edges[0].direct).toBeTruthy()
			})

			test('1 -> 0', () => {
				const graph = Graph.fromAdjacency([
					[0, 0],
					[1, 0],
				])
				expect(graph.order).toBe(2)
				expect(graph.size).toBe(1)
				expect(graph.edges[0]).toBeInstanceOf(Edge)
				expect(graph.edges[0][0]).toBe(1)
				expect(graph.edges[0][1]).toBe(0)
				expect(graph.edges[0].value).toBe(1)
				expect(graph.edges[0].direct).toBeTruthy()
			})
		})
	})

	test.each([0, 1, 2, 3])('complete %i', n => {
		const graph = Graph.complete(n)
		expect(graph.order).toBe(n)
		expect(graph.size).toBe(n === 0 ? 0 : (n * (n - 1)) / 2)
		const checked = Array.from({ length: n }, () => Array(n).fill(0))
		for (const e of graph.edges) {
			expect(e.direct).toBeFalsy()
			expect(e.value).toBe(1)
			expect(checked[e[0]][e[1]]).toBe(0)
			expect(checked[e[1]][e[0]]).toBe(0)
			checked[e[0]][e[1]] = checked[e[1]][e[0]] = 1
		}
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				expect(checked[i][j]).toBe(i === j ? 0 : 1)
			}
		}
	})

	describe('completeBipartite', () => {
		test.each([
			[1, 2],
			[3, 4],
		])('%i %i', (n, m) => {
			const graph = Graph.completeBipartite(n, m)
			expect(graph.order).toBe(n + m)
			expect(graph.size).toBe(n * m)
		})
	})

	describe('cycle', () => {
		test.each([3, 4, 5])('undirected %i', n => {
			const graph = Graph.cycle(n)
			expect(graph.order).toBe(n)
			expect(graph.size).toBe(n)
			const checked = Array(n).fill(0)
			for (const e of graph.edges) {
				expect(e.direct).toBeFalsy()
				expect(e.value).toBe(1)
				expect(checked[e[0]]).toBe(0)
				expect(e[1]).toBe((e[0] + 1) % n)
				checked[e[0]] = 1
			}
			for (let i = 0; i < n; i++) {
				expect(checked[i]).toBe(1)
			}
		})

		test.each([3, 4, 5])('directed %i', n => {
			const graph = Graph.cycle(n, true)
			expect(graph.order).toBe(n)
			expect(graph.size).toBe(n)
			const checked = Array(n).fill(0)
			for (const e of graph.edges) {
				expect(e.direct).toBeTruthy()
				expect(e.value).toBe(1)
				expect(checked[e[0]]).toBe(0)
				expect(e[1]).toBe((e[0] + 1) % n)
				checked[e[0]] = 1
			}
			for (let i = 0; i < n; i++) {
				expect(checked[i]).toBe(1)
			}
		})

		test.each([0, 1, 2])('small n %i', n => {
			expect(() => Graph.cycle(n)).toThrowError('Index out of bounds.')
		})
	})

	describe('wheel', () => {
		test.each([4, 5])('%i', n => {
			const graph = Graph.wheel(n)
			expect(graph.order).toBe(n)
			expect(graph.size).toBe((n - 1) * 2)
			const cycle = Array(n - 1).fill(0)
			const p0 = Array(n - 1).fill(0)
			for (const e of graph.edges) {
				expect(e.direct).toBeFalsy()
				expect(e.value).toBe(1)
				if (e[0] === 0) {
					p0[e[1] - 1] = 1
					continue
				}
				expect(e[1]).toBe((e[0] % (n - 1)) + 1)
				expect(cycle[e[0] - 1]).toBe(0)
				cycle[e[0] - 1] = 1
			}
			for (let i = 0; i < n - 1; i++) {
				expect(p0[i]).toBe(1)
			}
		})

		test.each([0, 1, 2, 3])('small n %i', n => {
			expect(() => Graph.wheel(n)).toThrowError('Index out of bounds.')
		})
	})

	test.each([0, 1, 2, 3, 4])('order', n => {
		const graph = new Graph(n)
		expect(graph.order).toBe(n)
	})

	test.each([
		[[]],
		[[[0, 1]]],
		[
			[
				[0, 1],
				[1, 2],
			],
		],
	])('size %p', edges => {
		const graph = new Graph(10, edges)
		expect(graph.size).toBe(edges.length)
	})

	test.todo('nodes')

	test.todo('edges')

	describe('toDot', () => {
		test('graph', () => {
			const graph = new Graph(3, [
				[0, 1],
				[1, 2],
			])
			const dot = graph.toDot()
			expect(dot).toBe('graph g {\n  0 [label="0"];\n  1 [label="1"];\n  2 [label="2"];\n  0 -- 1;\n  1 -- 2;\n}')
		})

		test('weighted graph', () => {
			const graph = new Graph(3, [
				{ 0: 0, 1: 1, value: 1 },
				{ 0: 1, 1: 2, value: 2 },
			])
			const dot = graph.toDot()
			expect(dot).toBe(
				'graph g {\n  0 [label="0"];\n  1 [label="1"];\n  2 [label="2"];\n  0 -- 1 [label="1"];\n  1 -- 2 [label="2"];\n}'
			)
		})

		test('digraph', () => {
			const graph = new Graph(3, [
				{ 0: 0, 1: 1, direct: true },
				{ 0: 1, 1: 2, direct: true },
			])
			const dot = graph.toDot()
			expect(dot).toBe(
				'digraph g {\n  0 [label="0"];\n  1 [label="1"];\n  2 [label="2"];\n  0 -> 1;\n  1 -> 2;\n}'
			)
		})
	})

	describe('toString', () => {
		test('No node values', () => {
			const graph = new Graph(3, [
				[0, 1],
				[1, 2],
			])
			const str = graph.toString()
			expect(str).toBe(
				'Number of nodes: 3\nNumber of edges: 2\nEdges\n  From 0 to 1, value: 1 (undirected)\n  From 1 to 2, value: 1 (undirected)'
			)
		})

		test('With node values', () => {
			const graph = new Graph(
				[1, 2, 3],
				[
					[0, 1],
					[1, 2],
				]
			)
			const str = graph.toString()
			expect(str).toBe(
				'Number of nodes: 3\nNode values: [1,2,3]\nNumber of edges: 2\nEdges\n  From 0 to 1, value: 1 (undirected)\n  From 1 to 2, value: 1 (undirected)'
			)
		})

		test('No edges', () => {
			const graph = new Graph(3)
			const str = graph.toString()
			expect(str).toBe('Number of nodes: 3\nNumber of edges: 0')
		})

		test('Direct edges', () => {
			const graph = new Graph(2, [{ 0: 0, 1: 1, direct: true }])
			const str = graph.toString()
			expect(str).toBe('Number of nodes: 2\nNumber of edges: 1\nEdges\n  From 0 to 1, value: 1 (directed)')
		})
	})

	test.todo('copy')

	describe('degree', () => {
		test('undirect', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
			])
			expect(graph.degree(0)).toBe(2)
			expect(graph.degree(1)).toBe(3)
			expect(graph.degree(2)).toBe(2)
			expect(graph.degree(3)).toBe(1)
		})

		test('direct in/out-degree', () => {
			const graph = new Graph(4, [
				{ 0: 0, 1: 1, direct: true },
				{ 0: 0, 1: 2, direct: true },
				{ 0: 1, 1: 2, direct: true },
				{ 0: 1, 1: 3, direct: true },
			])
			expect(graph.degree(0, false, true)).toBe(2)
			expect(graph.degree(1, false, true)).toBe(3)
			expect(graph.degree(2, false, true)).toBe(2)
			expect(graph.degree(3, false, true)).toBe(1)
		})

		test('direct in-degree', () => {
			const graph = new Graph(4, [
				{ 0: 0, 1: 1, direct: true },
				{ 0: 0, 1: 2, direct: true },
				{ 0: 1, 1: 2, direct: true },
				{ 0: 1, 1: 3, direct: true },
			])
			expect(graph.degree(0, false, 'in')).toBe(0)
			expect(graph.degree(1, false, 'in')).toBe(1)
			expect(graph.degree(2, false, 'in')).toBe(2)
			expect(graph.degree(3, false, 'in')).toBe(1)
			expect(graph.degree(0, 'in')).toBe(0)
			expect(graph.degree(1, 'in')).toBe(1)
			expect(graph.degree(2, 'in')).toBe(2)
			expect(graph.degree(3, 'in')).toBe(1)
		})

		test('direct out-degree', () => {
			const graph = new Graph(4, [
				{ 0: 0, 1: 1, direct: true },
				{ 0: 0, 1: 2, direct: true },
				{ 0: 1, 1: 2, direct: true },
				{ 0: 1, 1: 3, direct: true },
			])
			expect(graph.degree(0, false, 'out')).toBe(2)
			expect(graph.degree(1, false, 'out')).toBe(2)
			expect(graph.degree(2, false, 'out')).toBe(0)
			expect(graph.degree(3, false, 'out')).toBe(0)
			expect(graph.degree(0, 'out')).toBe(2)
			expect(graph.degree(1, 'out')).toBe(2)
			expect(graph.degree(2, 'out')).toBe(0)
			expect(graph.degree(3, 'out')).toBe(0)
		})
	})

	describe('adjacencies', () => {
		test('undirect', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
			])
			expect(graph.adjacencies(0)).toEqual([1, 2])
			expect(graph.adjacencies(1)).toEqual([0, 2, 3])
			expect(graph.adjacencies(2)).toEqual([0, 1])
			expect(graph.adjacencies(3)).toEqual([1])
		})

		test('direct in/out-degree', () => {
			const graph = new Graph(4, [
				{ 0: 0, 1: 1, direct: true },
				{ 0: 0, 1: 2, direct: true },
				{ 0: 1, 1: 2, direct: true },
				{ 0: 1, 1: 3, direct: true },
			])
			expect(graph.adjacencies(0, false, true)).toEqual([1, 2])
			expect(graph.adjacencies(1, false, true)).toEqual([0, 2, 3])
			expect(graph.adjacencies(2, false, true)).toEqual([0, 1])
			expect(graph.adjacencies(3, false, true)).toEqual([1])
		})

		test('direct in-degree', () => {
			const graph = new Graph(4, [
				{ 0: 0, 1: 1, direct: true },
				{ 0: 0, 1: 2, direct: true },
				{ 0: 1, 1: 2, direct: true },
				{ 0: 1, 1: 3, direct: true },
			])
			expect(graph.adjacencies(0, false, 'in')).toEqual([])
			expect(graph.adjacencies(1, false, 'in')).toEqual([0])
			expect(graph.adjacencies(2, false, 'in')).toEqual([0, 1])
			expect(graph.adjacencies(3, false, 'in')).toEqual([1])
			expect(graph.adjacencies(0, 'in')).toEqual([])
			expect(graph.adjacencies(1, 'in')).toEqual([0])
			expect(graph.adjacencies(2, 'in')).toEqual([0, 1])
			expect(graph.adjacencies(3, 'in')).toEqual([1])
		})

		test('direct out-degree', () => {
			const graph = new Graph(4, [
				{ 0: 0, 1: 1, direct: true },
				{ 0: 0, 1: 2, direct: true },
				{ 0: 1, 1: 2, direct: true },
				{ 0: 1, 1: 3, direct: true },
			])
			expect(graph.adjacencies(0, false, 'out')).toEqual([1, 2])
			expect(graph.adjacencies(1, false, 'out')).toEqual([2, 3])
			expect(graph.adjacencies(2, false, 'out')).toEqual([])
			expect(graph.adjacencies(3, false, 'out')).toEqual([])
			expect(graph.adjacencies(0, 'out')).toEqual([1, 2])
			expect(graph.adjacencies(1, 'out')).toEqual([2, 3])
			expect(graph.adjacencies(2, 'out')).toEqual([])
			expect(graph.adjacencies(3, 'out')).toEqual([])
		})
	})

	describe('components', () => {
		test('connected', () => {
			const graph = new Graph(3, [
				[0, 1],
				[1, 2],
			])
			const components = graph.components()
			expect(components).toHaveLength(1)
			expect(components[0]).toHaveLength(3)
		})

		test('disconnected', () => {
			const graph = new Graph(5, [
				[0, 1],
				[2, 3],
				[3, 4],
			])
			const components = graph.components()
			expect(components).toHaveLength(2)
			expect(components[0]).toHaveLength(2)
			expect(components[1]).toHaveLength(3)
		})
	})

	describe('diameter', () => {
		test('complete', () => {
			const graph = Graph.complete(5)
			expect(graph.diameter()).toBe(1)
		})
	})

	describe('eccentricity', () => {
		test('complete', () => {
			const graph = Graph.complete(5)
			for (let i = 0; i < graph.order; i++) {
				expect(graph.eccentricity(i)).toBe(1)
			}
		})
	})

	describe('radius', () => {
		test('complete', () => {
			const graph = Graph.complete(5)
			expect(graph.radius()).toBe(1)
		})
	})

	describe('center', () => {
		test('complete', () => {
			const graph = Graph.complete(5)
			expect(graph.center()).toEqual([0, 1, 2, 3, 4])
		})
	})

	test.todo('girth')

	describe('clique', () => {
		test.each([1, 2, 3, 4, 5])('complete %i', n => {
			const graph = Graph.complete(n)
			const clique = graph.clique()
			expect(clique).toHaveLength(n)
			let c = 1
			for (let i = 0; i < n; i++) {
				c *= (n - i) / (i + 1)
				expect(clique[i]).toHaveLength(c)
			}
		})

		test.each([1, 2, 3])('clique 1', n => {
			const graph = Graph.complete(n)
			const clique = graph.clique(1)
			expect(clique).toHaveLength(n)
		})

		test('over k', () => {
			const graph = Graph.complete(5)
			const clique = graph.clique(6)
			expect(clique).toHaveLength(0)
		})
	})

	describe('addNode', () => {
		test('undefined', () => {
			const graph = new Graph()
			graph.addNode()
			expect(graph.order).toBe(1)
			expect(graph.nodes[0]).toBeUndefined()
		})

		test.each([1, 5, 'a'])('value %p', v => {
			const graph = new Graph()
			graph.addNode(v)
			expect(graph.order).toBe(1)
			expect(graph.nodes[0]).toBe(v)
		})
	})

	describe('getNode', () => {
		test('all', () => {
			const graph = new Graph()
			for (let i = 0; i < 10; i++) {
				graph.addNode(i + 1)
			}
			expect(graph.getNode()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
		})

		test('scalar', () => {
			const graph = new Graph()
			for (let i = 0; i < 10; i++) {
				graph.addNode(i + 1)
			}
			for (let i = 0; i < 10; i++) {
				expect(graph.getNode(i)).toBe(i + 1)
			}
		})

		test('array', () => {
			const graph = new Graph()
			for (let i = 0; i < 10; i++) {
				graph.addNode(i + 1)
			}
			expect(graph.getNode([1, 5, 3])).toEqual([2, 6, 4])
		})

		test.each([-1, 10])('scalar fail %i', n => {
			const graph = new Graph()
			for (let i = 0; i < 10; i++) {
				graph.addNode(i + 1)
			}
			expect(() => graph.getNode(n)).toThrowError('Index out of bounds.')
		})

		test.each([[[-1, 0]], [[9, 10]]])('array fail %p', idx => {
			const graph = new Graph()
			for (let i = 0; i < 10; i++) {
				graph.addNode(i + 1)
			}
			expect(() => graph.getNode(idx)).toThrowError('Index out of bounds.')
		})
	})

	describe('removeNode', () => {
		test('remove', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
			])
			graph.removeNode(1)
			expect(graph.order).toBe(3)
			expect(graph.size).toBe(1)
			expect(graph.edges[0]).toBeInstanceOf(Edge)
			expect(graph.edges[0][0]).toBe(0)
			expect(graph.edges[0][1]).toBe(1)
			expect(graph.edges[0].value).toBe(1)
			expect(graph.edges[0].direct).toBeFalsy()
		})

		test('remove2', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
			])
			graph.removeNode(0)
			expect(graph.order).toBe(3)
			expect(graph.size).toBe(2)
			expect(graph.edges[0]).toBeInstanceOf(Edge)
			expect(graph.edges[0][0]).toBe(0)
			expect(graph.edges[0][1]).toBe(1)
			expect(graph.edges[0].value).toBe(1)
			expect(graph.edges[0].direct).toBeFalsy()
			expect(graph.edges[1]).toBeInstanceOf(Edge)
			expect(graph.edges[1][0]).toBe(0)
			expect(graph.edges[1][1]).toBe(2)
			expect(graph.edges[1].value).toBe(1)
			expect(graph.edges[1].direct).toBeFalsy()
		})

		test.each([-1, 4])('fail %i', n => {
			const graph = new Graph(4)
			expect(() => graph.removeNode(n)).toThrowError('Index out of bounds.')
		})
	})

	describe('addEdge', () => {
		test('default', () => {
			const graph = new Graph(3)
			graph.addEdge(0, 2)
			expect(graph.order).toBe(3)
			expect(graph.size).toBe(1)
			expect(graph.edges[0]).toBeInstanceOf(Edge)
			expect(graph.edges[0][0]).toBe(0)
			expect(graph.edges[0][1]).toBe(2)
			expect(graph.edges[0].value).toBe(1)
			expect(graph.edges[0].direct).toBeFalsy()
		})

		test.each([1, 6, 'b'])('value %p', v => {
			const graph = new Graph(3)
			graph.addEdge(1, 2, v)
			expect(graph.order).toBe(3)
			expect(graph.size).toBe(1)
			expect(graph.edges[0]).toBeInstanceOf(Edge)
			expect(graph.edges[0][0]).toBe(1)
			expect(graph.edges[0][1]).toBe(2)
			expect(graph.edges[0].value).toBe(v)
			expect(graph.edges[0].direct).toBeFalsy()
		})

		test('directed', () => {
			const graph = new Graph(3)
			graph.addEdge(1, 0, 5, true)
			expect(graph.order).toBe(3)
			expect(graph.size).toBe(1)
			expect(graph.edges[0]).toBeInstanceOf(Edge)
			expect(graph.edges[0][0]).toBe(1)
			expect(graph.edges[0][1]).toBe(0)
			expect(graph.edges[0].value).toBe(5)
			expect(graph.edges[0].direct).toBeTruthy()
		})

		test.each([
			[-1, 3],
			[0, 4],
		])('fail %i, %i', (f, t) => {
			const graph = new Graph(4)
			expect(() => graph.addEdge(f, t)).toThrowError('Index out of bounds.')
		})
	})

	describe('getEdges', () => {
		test('single', () => {
			const graph = new Graph(3, [[0, 1]])
			const edges = graph.getEdges(0, 1)
			expect(edges).toHaveLength(1)
			expect(edges[0]).toBeInstanceOf(Edge)
			expect(edges[0][0]).toBe(0)
			expect(edges[0][1]).toBe(1)
			expect(edges[0].value).toBe(1)
			expect(edges[0].direct).toBeFalsy()
		})

		test('none', () => {
			const graph = new Graph(3, [[1, 2]])
			const edges = graph.getEdges(0, 1)
			expect(edges).toHaveLength(0)
		})

		test('multi', () => {
			const graph = new Graph(3, [
				[0, 1],
				[0, 1],
				[1, 2],
			])
			const edges = graph.getEdges(0, 1)
			expect(edges).toHaveLength(2)
			for (let i = 0; i < 2; i++) {
				expect(edges[i]).toBeInstanceOf(Edge)
				expect(edges[i][0]).toBe(0)
				expect(edges[i][1]).toBe(1)
				expect(edges[i].value).toBe(1)
				expect(edges[i].direct).toBeFalsy()
			}
		})

		test('undirect', () => {
			const graph = new Graph(3, [{ 0: 0, 1: 1, direct: true }, { 0: 0, 1: 1, direct: false }, [1, 2]])
			const edges = graph.getEdges(0, 1, false)
			expect(edges).toHaveLength(1)
			expect(edges[0]).toBeInstanceOf(Edge)
			expect(edges[0][0]).toBe(0)
			expect(edges[0][1]).toBe(1)
			expect(edges[0].value).toBe(1)
			expect(edges[0].direct).toBeFalsy()
		})

		test('direct', () => {
			const graph = new Graph(3, [{ 0: 0, 1: 1, direct: true }, { 0: 0, 1: 1, direct: false }, [1, 2]])
			const edges = graph.getEdges(0, 1, true)
			expect(edges).toHaveLength(1)
			expect(edges[0]).toBeInstanceOf(Edge)
			expect(edges[0][0]).toBe(0)
			expect(edges[0][1]).toBe(1)
			expect(edges[0].value).toBe(1)
			expect(edges[0].direct).toBeTruthy()
		})

		test('direct both direction', () => {
			const graph = new Graph(3, [{ 0: 0, 1: 1, direct: true }, { 0: 1, 1: 0, direct: true }, [1, 2]])
			const edges = graph.getEdges(0, 1, true)
			expect(edges).toHaveLength(2)
			expect(edges[0]).toBeInstanceOf(Edge)
			expect(edges[0][0]).toBe(0)
			expect(edges[0][1]).toBe(1)
			expect(edges[0].value).toBe(1)
			expect(edges[0].direct).toBeTruthy()
			expect(edges[1]).toBeInstanceOf(Edge)
			expect(edges[1][0]).toBe(1)
			expect(edges[1][1]).toBe(0)
			expect(edges[1].value).toBe(1)
			expect(edges[1].direct).toBeTruthy()
		})

		test.each([
			[-1, 3],
			[0, 4],
		])('fail %i, %i', (f, t) => {
			const graph = new Graph(4)
			expect(() => graph.getEdges(f, t)).toThrowError('Index out of bounds.')
		})
	})

	describe('removeEdges', () => {
		test('both', () => {
			const graph = new Graph(3, [{ 0: 0, 1: 1, direct: true }, { 0: 0, 1: 1, direct: false }, [1, 2]])
			graph.removeEdges(0, 1)
			expect(graph.size).toBe(1)
		})

		test('undirect', () => {
			const graph = new Graph(3, [{ 0: 0, 1: 1, direct: true }, { 0: 0, 1: 1, direct: false }, [1, 2]])
			graph.removeEdges(0, 1, false)
			expect(graph.size).toBe(2)
			expect(graph.edges[0]).toBeInstanceOf(Edge)
			expect(graph.edges[0][0]).toBe(0)
			expect(graph.edges[0][1]).toBe(1)
			expect(graph.edges[0].value).toBe(1)
			expect(graph.edges[0].direct).toBeTruthy()
		})

		test('direct', () => {
			const graph = new Graph(3, [{ 0: 0, 1: 1, direct: true }, { 0: 0, 1: 1, direct: false }, [1, 2]])
			graph.removeEdges(0, 1, true)
			expect(graph.size).toBe(2)
			expect(graph.edges[0]).toBeInstanceOf(Edge)
			expect(graph.edges[0][0]).toBe(0)
			expect(graph.edges[0][1]).toBe(1)
			expect(graph.edges[0].value).toBe(1)
			expect(graph.edges[0].direct).toBeFalsy()
		})

		test('direct both direction', () => {
			const graph = new Graph(3, [{ 0: 0, 1: 1, direct: true }, { 0: 1, 1: 0, direct: true }, [1, 2]])
			graph.removeEdges(0, 1, true)
			expect(graph.size).toBe(1)
		})

		test.each([
			[-1, 3],
			[0, 4],
		])('fail %i, %i', (f, t) => {
			const graph = new Graph(4)
			expect(() => graph.removeEdges(f, t)).toThrowError('Index out of bounds.')
		})
	})

	describe('adjacencyMatrix', () => {
		test('0', () => {
			const graph = new Graph()
			const amat = graph.adjacencyMatrix()
			expect(amat).toHaveLength(0)
		})

		test('1 (no loop)', () => {
			const graph = new Graph(1)
			const amat = graph.adjacencyMatrix()
			expect(amat).toEqual([[0]])
		})

		test('1 (has loop)', () => {
			const graph = new Graph(1, [[0, 0]])
			const amat = graph.adjacencyMatrix()
			expect(amat).toEqual([[2]])
		})

		test('2 (no edges)', () => {
			const graph = new Graph(2)
			const amat = graph.adjacencyMatrix()
			expect(amat).toEqual([
				[0, 0],
				[0, 0],
			])
		})

		test('2 (undirect edge)', () => {
			const graph = new Graph(2, [[0, 1]])
			const amat = graph.adjacencyMatrix()
			expect(amat).toEqual([
				[0, 1],
				[1, 0],
			])
		})

		test('2 (direct edge 0 -> 1)', () => {
			const graph = new Graph(2, [{ 0: 0, 1: 1, direct: true }])
			const amat = graph.adjacencyMatrix()
			expect(amat).toEqual([
				[0, 1],
				[0, 0],
			])
		})

		test('2 (direct edge 1 -> 0)', () => {
			const graph = new Graph(2, [{ 0: 1, 1: 0, direct: true }])
			const amat = graph.adjacencyMatrix()
			expect(amat).toEqual([
				[0, 0],
				[1, 0],
			])
		})

		test('2 (weighted edge)', () => {
			const graph = new Graph(2, [{ 0: 1, 1: 0, value: 3 }])
			const amat = graph.adjacencyMatrix()
			expect(amat).toEqual([
				[0, 3],
				[3, 0],
			])
		})
	})

	describe('degreeMatrix', () => {
		test('undirected', () => {
			const graph = new Graph(4, [
				[0, 1],
				[1, 2],
				[0, 2],
				[1, 3],
			])
			const dmat = graph.degreeMatrix()
			expect(dmat).toEqual([
				[2, 0, 0, 0],
				[0, 3, 0, 0],
				[0, 0, 2, 0],
				[0, 0, 0, 1],
			])
		})

		test('directed both', () => {
			const graph = new Graph(4, [
				{ 0: 0, 1: 1, direct: true },
				{ 0: 1, 1: 2, direct: true },
				{ 0: 2, 1: 0, direct: true },
				{ 0: 1, 1: 3, direct: true },
			])
			const dmat = graph.degreeMatrix('both')
			expect(dmat).toEqual([
				[2, 0, 0, 0],
				[0, 3, 0, 0],
				[0, 0, 2, 0],
				[0, 0, 0, 1],
			])
		})

		test('directed in', () => {
			const graph = new Graph(4, [
				{ 0: 0, 1: 1, direct: true },
				{ 0: 1, 1: 2, direct: true },
				{ 0: 2, 1: 0, direct: true },
				{ 0: 1, 1: 3, direct: true },
			])
			const dmat = graph.degreeMatrix('in')
			expect(dmat).toEqual([
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, 1],
			])
		})

		test('directed out', () => {
			const graph = new Graph(4, [
				{ 0: 0, 1: 1, direct: true },
				{ 0: 1, 1: 2, direct: true },
				{ 0: 2, 1: 0, direct: true },
				{ 0: 1, 1: 3, direct: true },
			])
			const dmat = graph.degreeMatrix('out')
			expect(dmat).toEqual([
				[1, 0, 0, 0],
				[0, 2, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, 0],
			])
		})
	})

	test.todo('laplacianMatrix')

	describe('isNull', () => {
		test('null', () => {
			const graph = new Graph(0, [])
			expect(graph.isNull()).toBeTruthy()
		})

		test('not null', () => {
			const graph = new Graph(1, [])
			expect(graph.isNull()).toBeFalsy()
		})
	})

	describe('isEdgeless', () => {
		test('edgeless', () => {
			const graph = new Graph(3)
			expect(graph.isEdgeless()).toBeTruthy()
		})

		test('not edgeless', () => {
			const graph = new Graph(3, [[0, 1]])
			expect(graph.isEdgeless()).toBeFalsy()
		})
	})

	describe('isUndirected', () => {
		test('undirected', () => {
			const graph = new Graph(3, [
				[0, 1],
				[1, 2],
			])
			expect(graph.isUndirected()).toBeTruthy()
		})

		test('empty', () => {
			const graph = new Graph(3)
			expect(graph.isUndirected()).toBeTruthy()
		})

		test('directed', () => {
			const graph = new Graph(3, [{ 0: 0, 1: 1, direct: true }])
			expect(graph.isUndirected()).toBeFalsy()
		})

		test('mixed', () => {
			const graph = new Graph(3, [{ 0: 0, 1: 1, direct: true }, [1, 2]])
			expect(graph.isUndirected()).toBeFalsy()
		})
	})

	describe('isDirected', () => {
		test('directed', () => {
			const graph = new Graph(3, [{ 0: 0, 1: 1, direct: true }])
			expect(graph.isDirected()).toBeTruthy()
		})

		test('empty', () => {
			const graph = new Graph(3)
			expect(graph.isDirected()).toBeTruthy()
		})

		test('undirected', () => {
			const graph = new Graph(3, [[0, 1]])
			expect(graph.isDirected()).toBeFalsy()
		})

		test('mixed', () => {
			const graph = new Graph(3, [{ 0: 0, 1: 1, direct: true }, [1, 2]])
			expect(graph.isDirected()).toBeFalsy()
		})
	})

	describe('isMixed', () => {
		test('mixed', () => {
			const graph = new Graph(3, [{ 0: 0, 1: 1, direct: true }, [1, 2]])
			expect(graph.isMixed()).toBeTruthy()
		})

		test('empty', () => {
			const graph = new Graph(3)
			expect(graph.isMixed()).toBeFalsy()
		})

		test('undirected', () => {
			const graph = new Graph(3, [[0, 1]])
			expect(graph.isMixed()).toBeFalsy()
		})

		test('directed', () => {
			const graph = new Graph(3, [{ 0: 0, 1: 1, direct: true }])
			expect(graph.isMixed()).toBeFalsy()
		})
	})

	describe('isWeighted', () => {
		test('weighted', () => {
			const graph = new Graph(3, [{ 0: 0, 1: 1, value: 2 }])
			expect(graph.isWeighted()).toBeTruthy()
		})

		test('unweighted', () => {
			const graph = new Graph(3, [[0, 1]])
			expect(graph.isWeighted()).toBeFalsy()
		})
	})

	describe('isSimple', () => {
		test('simple', () => {
			const graph = new Graph(3, [
				[0, 1],
				[1, 2],
				[2, 0],
			])
			expect(graph.isSimple()).toBeTruthy()
		})

		test('has loop', () => {
			const graph = new Graph(3, [[0, 0]])
			expect(graph.isSimple()).toBeFalsy()
		})

		test('has miltiple edges', () => {
			const graph = new Graph(3, [
				[0, 1],
				[0, 1],
			])
			expect(graph.isSimple()).toBeFalsy()
		})
	})

	describe('isConnected', () => {
		test('connected', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
			])
			expect(graph.isConnected()).toBeTruthy()
		})

		test('non connected', () => {
			const graph = new Graph(4, [
				[0, 1],
				[2, 3],
			])
			expect(graph.isConnected()).toBeFalsy()
		})
	})

	describe('isBiconnected', () => {
		test('connected', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
				[2, 3],
			])
			expect(graph.isBiconnected()).toBeTruthy()
		})

		test('non biconnected', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
			])
			expect(graph.isBiconnected()).toBeFalsy()
		})
	})

	describe('isTree', () => {
		test('tree', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[2, 3],
			])
			expect(graph.isTree()).toBeTruthy()
		})

		test('has loop', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[2, 3],
			])
			expect(graph.isTree()).toBeFalsy()
		})

		test('not connected', () => {
			const graph = new Graph(4, [
				[0, 1],
				[2, 3],
			])
			expect(graph.isTree()).toBeFalsy()
		})
	})

	describe('isForest', () => {
		test('forest', () => {
			const graph = new Graph(4, [
				[0, 1],
				[2, 3],
			])
			expect(graph.isForest()).toBeTruthy()
		})

		test('has cycle', () => {
			const graph = new Graph(4, [
				[0, 1],
				[1, 2],
				[2, 0],
				[1, 3],
			])
			expect(graph.isForest()).toBeFalsy()
		})
	})

	describe('isBipartite', () => {
		test('bipartite', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 3],
				[1, 2],
				[2, 3],
			])
			expect(graph.isBipartite()).toBeTruthy()
		})

		test('disconnected bipartite', () => {
			const graph = new Graph(4, [
				[0, 1],
				[2, 3],
			])
			expect(graph.isBipartite()).toBeTruthy()
		})

		test('not bipartite', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[2, 3],
			])
			expect(graph.isBipartite()).toBeFalsy()
		})
	})

	describe('isRegular', () => {
		test('null', () => {
			const graph = new Graph()
			expect(graph.isRegular()).toBeTruthy()
		})

		test('complete', () => {
			const graph = Graph.complete(4)
			expect(graph.isRegular()).toBeTruthy()
		})

		test('tree', () => {
			const graph = new Graph(4, [
				[0, 1],
				[1, 2],
				[1, 3],
			])
			expect(graph.isRegular()).toBeFalsy()
		})
	})

	test.todo('isPlainer')

	test.todo('isSymmetric')

	describe('isDAG', () => {
		test('directed', () => {
			const graph = new Graph(4, [
				{ 0: 0, 1: 1, direct: true },
				{ 0: 0, 1: 2, direct: true },
				{ 0: 1, 1: 2, direct: true },
				{ 0: 2, 1: 3, direct: true },
			])
			expect(graph.isDAG()).toBeTruthy()
		})
	})

	describe('hasCycle', () => {
		test('undirected has cycle', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[2, 3],
			])
			expect(graph.hasCycle()).toBeTruthy()
		})

		test('undirected not has cycle', () => {
			const graph = new Graph(4, [
				[0, 1],
				[2, 3],
			])
			expect(graph.hasCycle()).toBeFalsy()
		})

		test('directed has cycle', () => {
			const graph = new Graph(4, [
				{ 0: 0, 1: 1, direct: true },
				{ 0: 1, 1: 2, direct: true },
				{ 0: 2, 1: 0, direct: true },
				{ 0: 2, 1: 3, direct: true },
			])
			expect(graph.hasCycle()).toBeTruthy()
		})

		test('directed not has cycle', () => {
			const graph = new Graph(4, [
				{ 0: 0, 1: 1, direct: true },
				{ 0: 0, 1: 2, direct: true },
				{ 0: 1, 1: 2, direct: true },
				{ 0: 2, 1: 3, direct: true },
			])
			expect(graph.hasCycle()).toBeFalsy()
		})
	})

	describe('hasCycleDFS', () => {
		test('undirected has cycle', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[2, 3],
			])
			expect(graph.hasCycleDFS()).toBeTruthy()
		})

		test('undirected not has cycle', () => {
			const graph = new Graph(4, [
				[0, 1],
				[2, 3],
			])
			expect(graph.hasCycleDFS()).toBeFalsy()
		})

		test('directed', () => {
			const graph = new Graph(4, [
				{ 0: 0, 1: 1, direct: true },
				{ 0: 1, 1: 2, direct: true },
				{ 0: 2, 1: 0, direct: true },
				{ 0: 2, 1: 3, direct: true },
			])
			expect(() => graph.hasCycleDFS()).toThrowError('This method only works undirected graph.')
		})
	})

	describe('hasCycleEachNodes', () => {
		test('undirected has cycle', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[2, 3],
			])
			expect(graph.hasCycleEachNodes()).toBeTruthy()
		})

		test('undirected not has cycle', () => {
			const graph = new Graph(4, [
				[0, 1],
				[2, 3],
			])
			expect(graph.hasCycleEachNodes()).toBeFalsy()
		})

		test('directed has cycle', () => {
			const graph = new Graph(4, [
				{ 0: 0, 1: 1, direct: true },
				{ 0: 1, 1: 2, direct: true },
				{ 0: 2, 1: 0, direct: true },
				{ 0: 2, 1: 3, direct: true },
			])
			expect(graph.hasCycleEachNodes()).toBeTruthy()
		})

		test('directed not has cycle', () => {
			const graph = new Graph(4, [
				{ 0: 0, 1: 1, direct: true },
				{ 0: 0, 1: 2, direct: true },
				{ 0: 1, 1: 2, direct: true },
				{ 0: 2, 1: 3, direct: true },
			])
			expect(graph.hasCycleEachNodes()).toBeFalsy()
		})
	})

	test.todo('isomorphism')

	describe('inducedSub', () => {
		test('default', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 3],
			])
			const sub = graph.inducedSub([0, 1, 2])
			expect(sub.order).toBe(3)
			expect(sub.size).toBe(2)
		})
	})

	describe('complement', () => {
		test('default', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 3],
			])
			const complement = graph.complement()
			expect(complement.order).toBe(4)
			expect(complement.size).toBe(3)
			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < i; j++) {
					expect(complement.getEdges(i, j)).toHaveLength(graph.getEdges(i, j).length > 0 ? 0 : 1)
				}
			}
		})

		test('complete', () => {
			const graph = Graph.complete(5)
			const complement = graph.complement()
			expect(complement.order).toBe(5)
			expect(complement.size).toBe(0)
		})
	})

	describe('contraction', () => {
		test('default', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[2, 3],
			])
			graph.contraction(1, 2)
			expect(graph.order).toBe(3)
			expect(graph.size).toBe(3)
		})

		test('same', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[2, 3],
			])
			graph.contraction(1, 1)
			expect(graph.order).toBe(4)
			expect(graph.size).toBe(4)
		})

		test('a > b', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[2, 3],
			])
			graph.contraction(2, 1)
			expect(graph.order).toBe(3)
			expect(graph.size).toBe(3)
		})
	})

	describe('subdivision', () => {
		test('default', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[2, 3],
			])
			graph.subdivision(1, 2)
			expect(graph.order).toBe(5)
			expect(graph.size).toBe(5)
		})
	})

	describe('disjointUnion', () => {
		test('default', () => {
			const g1 = new Graph(3, [
				[0, 1],
				[1, 2],
			])
			const g2 = new Graph(2, [[0, 1]])
			const graph = g1.copy()
			graph.disjointUnion(g2)
			expect(graph.order).toBe(g1.order + g2.order)
			expect(graph.size).toBe(g1.size + g2.size)
		})
	})

	describe('substitution', () => {
		test('default', () => {
			const g1 = new Graph(3, [
				[0, 1],
				[1, 2],
			])
			const g2 = new Graph(2, [[0, 1]])
			g1.substitution(1, g2)
			expect(g1.order).toBe(4)
			expect(g1.size).toBe(5)
			expect(g1.getEdges(0, 1)).toHaveLength(1)
			expect(g1.getEdges(0, 2)).toHaveLength(0)
			expect(g1.getEdges(0, 3)).toHaveLength(1)
			expect(g1.getEdges(1, 2)).toHaveLength(1)
			expect(g1.getEdges(1, 3)).toHaveLength(1)
			expect(g1.getEdges(2, 3)).toHaveLength(1)
		})
	})

	describe('cartesianProduct', () => {
		test('default', () => {
			const g1 = new Graph(3, [
				[0, 1],
				[1, 2],
			])
			const g2 = new Graph(2, [[0, 1]])
			const cp = g1.cartesianProduct(g2)
			expect(cp.order).toBe(g1.order * g2.order)
			expect(cp.size).toBe(g1.order * g2.size + g2.order * g1.size)
			for (let i = 0; i < g1.order; i++) {
				for (let j = 0; j < g2.order; j++) {
					const st = i + j * g1.order
					for (let s = 0; s < g1.order; s++) {
						for (let t = 0; t < g2.order; t++) {
							const ed = s + t * g1.order
							const es = []
							for (const e of cp.edges) {
								if ((e[0] === st && e[1] === ed) || (!e.direct && e[0] === ed && e[1] === st)) {
									es.push(e)
								}
							}
							expect(es).toHaveLength(
								(i === s && g2.getEdges(j, t).length > 0) || (j === t && g1.getEdges(i, s).length > 0)
									? 1
									: 0
							)
						}
					}
				}
			}
		})
	})

	describe('tensorProduct', () => {
		test('default', () => {
			const g1 = new Graph(3, [
				[0, 1],
				[1, 2],
			])
			const g2 = new Graph(2, [[0, 1]])
			const cp = g1.tensorProduct(g2)
			expect(cp.order).toBe(g1.order * g2.order)
			expect(cp.size).toBe(g1.size * g2.size * 2)
			for (let i = 0; i < g1.order; i++) {
				for (let j = 0; j < g2.order; j++) {
					const st = i + j * g1.order
					for (let s = 0; s < g1.order; s++) {
						for (let t = 0; t < g2.order; t++) {
							const ed = s + t * g1.order
							const es = []
							for (const e of cp.edges) {
								if ((e[0] === st && e[1] === ed) || (!e.direct && e[0] === ed && e[1] === st)) {
									es.push(e)
								}
							}
							expect(es).toHaveLength(
								g1.getEdges(i, s).length > 0 && g2.getEdges(j, t).length > 0 ? 1 : 0
							)
						}
					}
				}
			}
		})
	})

	describe('strongProduct', () => {
		test('default', () => {
			const g1 = new Graph(3, [
				[0, 1],
				[1, 2],
			])
			const g2 = new Graph(2, [[0, 1]])
			const cp = g1.strongProduct(g2)
			expect(cp.order).toBe(g1.order * g2.order)
			expect(cp.size).toBe(g1.order * g2.size + g2.order * g1.size + g1.size * g2.size * 2)
			for (let i = 0; i < g1.order; i++) {
				for (let j = 0; j < g2.order; j++) {
					const st = i + j * g1.order
					for (let s = 0; s < g1.order; s++) {
						for (let t = 0; t < g2.order; t++) {
							const ed = s + t * g1.order
							const es = []
							for (const e of cp.edges) {
								if ((e[0] === st && e[1] === ed) || (!e.direct && e[0] === ed && e[1] === st)) {
									es.push(e)
								}
							}
							expect(es).toHaveLength(
								(i === s && g2.getEdges(j, t).length > 0) ||
									(j === t && g1.getEdges(i, s).length > 0) ||
									(g1.getEdges(i, s).length > 0 && g2.getEdges(j, t).length > 0)
									? 1
									: 0
							)
						}
					}
				}
			}
		})
	})

	describe('lexicographicProduct', () => {
		test('default', () => {
			const g1 = new Graph(3, [
				[0, 1],
				[1, 2],
			])
			const g2 = new Graph(2, [[0, 1]])
			const cp = g1.lexicographicProduct(g2)
			expect(cp.order).toBe(g1.order * g2.order)
			expect(cp.size).toBe(g1.size * g2.order ** 2 + g1.order * g2.size)
			for (let i = 0; i < g1.order; i++) {
				for (let j = 0; j < g2.order; j++) {
					const st = i + j * g1.order
					for (let s = 0; s < g1.order; s++) {
						for (let t = 0; t < g2.order; t++) {
							const ed = s + t * g1.order
							const es = []
							for (const e of cp.edges) {
								if ((e[0] === st && e[1] === ed) || (!e.direct && e[0] === ed && e[1] === st)) {
									es.push(e)
								}
							}
							expect(es).toHaveLength(
								g1.getEdges(i, s).length > 0 || (i === s && g2.getEdges(j, t).length > 0) ? 1 : 0
							)
						}
					}
				}
			}
		})
	})

	describe('shortestPath', () => {
		test('from some node', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
			])
			const p = graph.shortestPath(0)
			expect(p).toHaveLength(4)
			expect(p[0]).toEqual({ length: 0, prev: null, path: [0] })
			expect(p[1]).toEqual({ length: 1, prev: 0, path: [0, 1] })
			expect(p[2]).toEqual({ length: 1, prev: 0, path: [0, 2] })
			expect(p[3]).toEqual({ length: 2, prev: 1, path: [0, 1, 3] })
		})

		test('from all node', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
			])
			const p = graph.shortestPath()
			expect(p).toHaveLength(4)
			expect(p[0]).toEqual([
				{ length: 0, path: [0] },
				{ length: 1, path: [0, 1] },
				{ length: 1, path: [0, 2] },
				{ length: 2, path: [0, 1, 3] },
			])
			expect(p[1]).toEqual([
				{ length: 1, path: [1, 0] },
				{ length: 0, path: [1] },
				{ length: 1, path: [1, 2] },
				{ length: 1, path: [1, 3] },
			])
			expect(p[2]).toEqual([
				{ length: 1, path: [2, 0] },
				{ length: 1, path: [2, 1] },
				{ length: 0, path: [2] },
				{ length: 2, path: [2, 1, 3] },
			])
			expect(p[3]).toEqual([
				{ length: 2, path: [3, 1, 0] },
				{ length: 1, path: [3, 1] },
				{ length: 2, path: [3, 1, 2] },
				{ length: 0, path: [3] },
			])
		})
	})

	describe('shortestPathBreadthFirstSearch', () => {
		test('default', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
			])
			const p = graph.shortestPathBreadthFirstSearch(0)
			expect(p).toHaveLength(4)
			expect(p[0]).toEqual({ length: 0, prev: null, path: [0] })
			expect(p[1]).toEqual({ length: 1, prev: 0, path: [0, 1] })
			expect(p[2]).toEqual({ length: 1, prev: 0, path: [0, 2] })
			expect(p[3]).toEqual({ length: 2, prev: 1, path: [0, 1, 3] })
		})
	})

	describe('shortestPathDijkstra', () => {
		test('default', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
			])
			const p = graph.shortestPathDijkstra(0)
			expect(p).toHaveLength(4)
			expect(p[0]).toEqual({ length: 0, prev: null, path: [0] })
			expect(p[1]).toEqual({ length: 1, prev: 0, path: [0, 1] })
			expect(p[2]).toEqual({ length: 1, prev: 0, path: [0, 2] })
			expect(p[3]).toEqual({ length: 2, prev: 1, path: [0, 1, 3] })
		})
	})

	describe('shortestPathBellmanFord', () => {
		test('default', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
			])
			const p = graph.shortestPathBellmanFord(0)
			expect(p).toHaveLength(4)
			expect(p[0]).toEqual({ length: 0, prev: null, path: [0] })
			expect(p[1]).toEqual({ length: 1, prev: 0, path: [0, 1] })
			expect(p[2]).toEqual({ length: 1, prev: 0, path: [0, 2] })
			expect(p[3]).toEqual({ length: 2, prev: 1, path: [0, 1, 3] })
		})
	})

	describe('shortestPathFloydWarshall', () => {
		test('default', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
			])
			const p = graph.shortestPathFloydWarshall()
			expect(p).toHaveLength(4)
			expect(p[0]).toEqual([
				{ length: 0, path: [0] },
				{ length: 1, path: [0, 1] },
				{ length: 1, path: [0, 2] },
				{ length: 2, path: [0, 1, 3] },
			])
			expect(p[1]).toEqual([
				{ length: 1, path: [1, 0] },
				{ length: 0, path: [1] },
				{ length: 1, path: [1, 2] },
				{ length: 1, path: [1, 3] },
			])
			expect(p[2]).toEqual([
				{ length: 1, path: [2, 0] },
				{ length: 1, path: [2, 1] },
				{ length: 0, path: [2] },
				{ length: 2, path: [2, 1, 3] },
			])
			expect(p[3]).toEqual([
				{ length: 2, path: [3, 1, 0] },
				{ length: 1, path: [3, 1] },
				{ length: 2, path: [3, 1, 2] },
				{ length: 0, path: [3] },
			])
		})
	})

	describe('minimumSpanningTree', () => {
		test('default', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
			])
			const tree = graph.minimumSpanningTree()
			expect(tree.order).toBe(4)
			expect(tree.size).toBe(3)
			expect(tree.isTree()).toBeTruthy()
		})
	})

	describe('minimumSpanningTreePrim', () => {
		test('default', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
			])
			const tree = graph.minimumSpanningTreePrim()
			expect(tree.order).toBe(4)
			expect(tree.size).toBe(3)
			expect(tree.isTree()).toBeTruthy()
		})
	})

	describe('minimumSpanningTreeKruskal', () => {
		test('default', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
			])
			const tree = graph.minimumSpanningTreeKruskal()
			expect(tree.order).toBe(4)
			expect(tree.size).toBe(3)
			expect(tree.isTree()).toBeTruthy()
		})
	})

	describe('minimumSpanningTreeBoruvka', () => {
		test('default', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
			])
			const tree = graph.minimumSpanningTreeBoruvka()
			expect(tree.order).toBe(4)
			expect(tree.size).toBe(3)
			expect(tree.isTree()).toBeTruthy()
		})
	})

	describe('cut', () => {
		test('default', () => {
			const graph = new Graph(4, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
			])
			const cut = graph.cut([0, 2], [1, 3])
			expect(cut).toBe(2)
		})
	})

	describe('mincut', () => {
		test('default', () => {
			const graph = new Graph(7, [
				[0, 1],
				[0, 2],
				[1, 2],
				[2, 3],
				[3, 4],
				[3, 5],
				[3, 6],
				[4, 5],
				[4, 6],
				[5, 6],
			])

			const [cut, nodes] = graph.mincut()
			expect(cut).toBe(1)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})

		test('separated', () => {
			const graph = new Graph(7, [
				[0, 1],
				[0, 2],
				[1, 2],
				[3, 4],
				[3, 5],
				[3, 6],
				[4, 5],
				[4, 6],
				[5, 6],
			])

			const [cut, nodes] = graph.mincut()
			expect(cut).toBe(0)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})

		test('minv', () => {
			const graph = new Graph(7, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
				[2, 4],
				[3, 4],
				[3, 5],
				[3, 6],
				[4, 5],
				[4, 6],
				[5, 6],
			])

			const [cut, nodes] = graph.mincut(2)
			expect(cut).toBe(2)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})
	})

	describe('mincutBruteForce', () => {
		test('default', () => {
			const graph = new Graph(7, [
				[0, 1],
				[0, 2],
				[1, 2],
				[2, 3],
				[3, 4],
				[3, 5],
				[3, 6],
				[4, 5],
				[4, 6],
				[5, 6],
			])

			const [cut, nodes] = graph.mincutBruteForce()
			expect(cut).toBe(1)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})

		test('separated', () => {
			const graph = new Graph(7, [
				[0, 1],
				[0, 2],
				[1, 2],
				[3, 4],
				[3, 5],
				[3, 6],
				[4, 5],
				[4, 6],
				[5, 6],
			])

			const [cut, nodes] = graph.mincutBruteForce()
			expect(cut).toBe(0)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})

		test('minv', () => {
			const graph = new Graph(7, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
				[2, 4],
				[3, 4],
				[3, 5],
				[3, 6],
				[4, 5],
				[4, 6],
				[5, 6],
			])

			const [cut, nodes] = graph.mincutBruteForce(2)
			expect(cut).toBe(2)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})
	})

	describe('mincutStoerWagner', () => {
		test('default', () => {
			const graph = new Graph(7, [
				[0, 1],
				[0, 2],
				[1, 2],
				[2, 3],
				[3, 4],
				[3, 5],
				[3, 6],
				[4, 5],
				[4, 6],
				[5, 6],
			])

			const [cut, nodes] = graph.mincutStoerWagner()
			expect(cut).toBe(1)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})

		test('separated', () => {
			const graph = new Graph(7, [
				[0, 1],
				[0, 2],
				[1, 2],
				[3, 4],
				[3, 5],
				[3, 6],
				[4, 5],
				[4, 6],
				[5, 6],
			])

			const [cut, nodes] = graph.mincutStoerWagner()
			expect(cut).toBe(0)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})

		test('minv', () => {
			const graph = new Graph(7, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
				[2, 4],
				[3, 4],
				[3, 5],
				[3, 6],
				[4, 5],
				[4, 6],
				[5, 6],
			])

			const [cut, nodes] = graph.mincutStoerWagner(2)
			expect(cut).toBe(2)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})
	})

	describe('mincutKargers', () => {
		test('default', () => {
			const graph = new Graph(7, [
				[0, 1],
				[0, 2],
				[1, 2],
				[2, 3],
				[3, 4],
				[3, 5],
				[3, 6],
				[4, 5],
				[4, 6],
				[5, 6],
			])

			const [cut, nodes] = graph.mincutKargers()
			expect(cut).toBe(1)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})

		test('separated', () => {
			const graph = new Graph(7, [
				[0, 1],
				[0, 2],
				[1, 2],
				[3, 4],
				[3, 5],
				[3, 6],
				[4, 5],
				[4, 6],
				[5, 6],
			])

			const [cut, nodes] = graph.mincutKargers()
			expect(cut).toBe(0)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})

		test('minv', () => {
			const graph = new Graph(7, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
				[2, 4],
				[3, 4],
				[3, 5],
				[3, 6],
				[4, 5],
				[4, 6],
				[5, 6],
			])

			const [cut, nodes] = graph.mincutKargers(2)
			expect(cut).toBe(2)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})
	})

	describe('mincutKargersStein', () => {
		test('default', () => {
			const graph = new Graph(7, [
				[0, 1],
				[0, 2],
				[1, 2],
				[2, 3],
				[3, 4],
				[3, 5],
				[3, 6],
				[4, 5],
				[4, 6],
				[5, 6],
			])

			const [cut, nodes] = graph.mincutKargersStein()
			expect(cut).toBe(1)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})

		test('separated', () => {
			const graph = new Graph(7, [
				[0, 1],
				[0, 2],
				[1, 2],
				[3, 4],
				[3, 5],
				[3, 6],
				[4, 5],
				[4, 6],
				[5, 6],
			])

			const [cut, nodes] = graph.mincutKargersStein()
			expect(cut).toBe(0)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})

		test('minv', () => {
			const graph = new Graph(7, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
				[2, 4],
				[3, 4],
				[3, 5],
				[3, 6],
				[4, 5],
				[4, 6],
				[5, 6],
			])

			const [cut, nodes] = graph.mincutKargersStein(2)
			expect(cut).toBe(2)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})
	})

	describe('bisectionSpectral', () => {
		test('default', () => {
			const graph = new Graph(6, [
				[0, 1],
				[0, 2],
				[1, 2],
				[1, 3],
				[2, 4],
				[3, 4],
				[3, 5],
				[4, 5],
			])

			const [cut, nodes] = graph.bisectionSpectral()
			expect(cut).toBe(2)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5])
		})

		test('separated', () => {
			const graph = new Graph(7, [
				[0, 1],
				[0, 2],
				[1, 2],
				[3, 4],
				[3, 5],
				[3, 6],
				[4, 5],
				[4, 6],
				[5, 6],
			])

			const [cut, nodes] = graph.bisectionSpectral()
			expect(cut).toBe(0)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})
	})
})
