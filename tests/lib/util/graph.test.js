import { jest } from '@jest/globals'
jest.retryTimes(5)

import Graph from '../../../lib/util/graph.js'

describe('graph', () => {
	describe('constructor', () => {
		test('default', () => {
			const graph = new Graph(0, [])

			expect(graph.order).toBe(0)
			expect(graph.size).toBe(0)
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
				expect(graph.edges[0]).toEqual([0, 0, 1])
			})
		})
	})

	describe('mincut', () => {
		test('default', () => {
			const graph = Graph.fromAdjacency([
				[0, 1, 1, 0, 0, 0, 0],
				[1, 0, 1, 0, 0, 0, 0],
				[1, 1, 0, 1, 0, 0, 0],
				[0, 0, 1, 0, 1, 1, 1],
				[0, 0, 0, 1, 0, 1, 1],
				[0, 0, 0, 1, 1, 0, 1],
				[0, 0, 0, 1, 1, 1, 0],
			])

			const [cut, nodes] = graph.mincut()
			expect(cut).toBe(1)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})

		test('separated', () => {
			const graph = Graph.fromAdjacency([
				[0, 1, 1, 0, 0, 0, 0],
				[1, 0, 1, 0, 0, 0, 0],
				[1, 1, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 1, 1, 1],
				[0, 0, 0, 1, 0, 1, 1],
				[0, 0, 0, 1, 1, 0, 1],
				[0, 0, 0, 1, 1, 1, 0],
			])

			const [cut, nodes] = graph.mincut()
			expect(cut).toBe(0)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})

		test('minv', () => {
			const graph = Graph.fromAdjacency([
				[0, 1, 1, 0, 0, 0, 0],
				[1, 0, 1, 1, 0, 0, 0],
				[1, 1, 0, 0, 1, 0, 0],
				[0, 1, 0, 0, 1, 1, 1],
				[0, 0, 1, 1, 0, 1, 1],
				[0, 0, 0, 1, 1, 0, 1],
				[0, 0, 0, 1, 1, 1, 0],
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
			const graph = Graph.fromAdjacency([
				[0, 1, 1, 0, 0, 0, 0],
				[1, 0, 1, 0, 0, 0, 0],
				[1, 1, 0, 1, 0, 0, 0],
				[0, 0, 1, 0, 1, 1, 1],
				[0, 0, 0, 1, 0, 1, 1],
				[0, 0, 0, 1, 1, 0, 1],
				[0, 0, 0, 1, 1, 1, 0],
			])

			const [cut, nodes] = graph.mincutBruteForce()
			expect(cut).toBe(1)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})

		test('separated', () => {
			const graph = Graph.fromAdjacency([
				[0, 1, 1, 0, 0, 0, 0],
				[1, 0, 1, 0, 0, 0, 0],
				[1, 1, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 1, 1, 1],
				[0, 0, 0, 1, 0, 1, 1],
				[0, 0, 0, 1, 1, 0, 1],
				[0, 0, 0, 1, 1, 1, 0],
			])

			const [cut, nodes] = graph.mincutBruteForce()
			expect(cut).toBe(0)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})

		test('minv', () => {
			const graph = Graph.fromAdjacency([
				[0, 1, 1, 0, 0, 0, 0],
				[1, 0, 1, 1, 0, 0, 0],
				[1, 1, 0, 0, 1, 0, 0],
				[0, 1, 0, 0, 1, 1, 1],
				[0, 0, 1, 1, 0, 1, 1],
				[0, 0, 0, 1, 1, 0, 1],
				[0, 0, 0, 1, 1, 1, 0],
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
			const graph = Graph.fromAdjacency([
				[0, 1, 1, 0, 0, 0, 0],
				[1, 0, 1, 0, 0, 0, 0],
				[1, 1, 0, 1, 0, 0, 0],
				[0, 0, 1, 0, 1, 1, 1],
				[0, 0, 0, 1, 0, 1, 1],
				[0, 0, 0, 1, 1, 0, 1],
				[0, 0, 0, 1, 1, 1, 0],
			])

			const [cut, nodes] = graph.mincutStoerWagner()
			expect(cut).toBe(1)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})

		test('separated', () => {
			const graph = Graph.fromAdjacency([
				[0, 1, 1, 0, 0, 0, 0],
				[1, 0, 1, 0, 0, 0, 0],
				[1, 1, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 1, 1, 1],
				[0, 0, 0, 1, 0, 1, 1],
				[0, 0, 0, 1, 1, 0, 1],
				[0, 0, 0, 1, 1, 1, 0],
			])

			const [cut, nodes] = graph.mincutStoerWagner()
			expect(cut).toBe(0)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})

		test('minv', () => {
			const graph = Graph.fromAdjacency([
				[0, 1, 1, 0, 0, 0, 0],
				[1, 0, 1, 1, 0, 0, 0],
				[1, 1, 0, 0, 1, 0, 0],
				[0, 1, 0, 0, 1, 1, 1],
				[0, 0, 1, 1, 0, 1, 1],
				[0, 0, 0, 1, 1, 0, 1],
				[0, 0, 0, 1, 1, 1, 0],
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
			const graph = Graph.fromAdjacency([
				[0, 1, 1, 0, 0, 0, 0],
				[1, 0, 1, 0, 0, 0, 0],
				[1, 1, 0, 1, 0, 0, 0],
				[0, 0, 1, 0, 1, 1, 1],
				[0, 0, 0, 1, 0, 1, 1],
				[0, 0, 0, 1, 1, 0, 1],
				[0, 0, 0, 1, 1, 1, 0],
			])

			const [cut, nodes] = graph.mincutKargers()
			expect(cut).toBe(1)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})

		test('separated', () => {
			const graph = Graph.fromAdjacency([
				[0, 1, 1, 0, 0, 0, 0],
				[1, 0, 1, 0, 0, 0, 0],
				[1, 1, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 1, 1, 1],
				[0, 0, 0, 1, 0, 1, 1],
				[0, 0, 0, 1, 1, 0, 1],
				[0, 0, 0, 1, 1, 1, 0],
			])

			const [cut, nodes] = graph.mincutKargers()
			expect(cut).toBe(0)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})

		test('minv', () => {
			const graph = Graph.fromAdjacency([
				[0, 1, 1, 0, 0, 0, 0],
				[1, 0, 1, 1, 0, 0, 0],
				[1, 1, 0, 0, 1, 0, 0],
				[0, 1, 0, 0, 1, 1, 1],
				[0, 0, 1, 1, 0, 1, 1],
				[0, 0, 0, 1, 1, 0, 1],
				[0, 0, 0, 1, 1, 1, 0],
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
			const graph = Graph.fromAdjacency([
				[0, 1, 1, 0, 0, 0, 0],
				[1, 0, 1, 0, 0, 0, 0],
				[1, 1, 0, 1, 0, 0, 0],
				[0, 0, 1, 0, 1, 1, 1],
				[0, 0, 0, 1, 0, 1, 1],
				[0, 0, 0, 1, 1, 0, 1],
				[0, 0, 0, 1, 1, 1, 0],
			])

			const [cut, nodes] = graph.mincutKargersStein()
			expect(cut).toBe(1)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})

		test('separated', () => {
			const graph = Graph.fromAdjacency([
				[0, 1, 1, 0, 0, 0, 0],
				[1, 0, 1, 0, 0, 0, 0],
				[1, 1, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 1, 1, 1],
				[0, 0, 0, 1, 0, 1, 1],
				[0, 0, 0, 1, 1, 0, 1],
				[0, 0, 0, 1, 1, 1, 0],
			])

			const [cut, nodes] = graph.mincutKargersStein()
			expect(cut).toBe(0)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})

		test('minv', () => {
			const graph = Graph.fromAdjacency([
				[0, 1, 1, 0, 0, 0, 0],
				[1, 0, 1, 1, 0, 0, 0],
				[1, 1, 0, 0, 1, 0, 0],
				[0, 1, 0, 0, 1, 1, 1],
				[0, 0, 1, 1, 0, 1, 1],
				[0, 0, 0, 1, 1, 0, 1],
				[0, 0, 0, 1, 1, 1, 0],
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
			const graph = Graph.fromAdjacency([
				[0, 1, 1, 0, 0, 0],
				[1, 0, 1, 1, 0, 0],
				[1, 1, 0, 0, 1, 0],
				[0, 1, 0, 0, 1, 1],
				[0, 0, 1, 1, 0, 1],
				[0, 0, 0, 1, 1, 0],
			])

			const [cut, nodes] = graph.bisectionSpectral()
			expect(cut).toBe(2)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5])
		})

		test('separated', () => {
			const graph = Graph.fromAdjacency([
				[0, 1, 1, 0, 0, 0, 0],
				[1, 0, 1, 0, 0, 0, 0],
				[1, 1, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 1, 1, 1],
				[0, 0, 0, 1, 0, 1, 1],
				[0, 0, 0, 1, 1, 0, 1],
				[0, 0, 0, 1, 1, 1, 0],
			])

			const [cut, nodes] = graph.bisectionSpectral()
			expect(cut).toBe(0)
			expect(nodes).toHaveLength(2)
			expect(nodes[0].sort()).toEqual(nodes[0].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
			expect(nodes[1].sort()).toEqual(nodes[1].indexOf(0) >= 0 ? [0, 1, 2] : [3, 4, 5, 6])
		})
	})
})
