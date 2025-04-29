import manager from '../helper/manager.js'

import { BaseData, EmptyData, MultiDimensionalData, FixData } from '../../../js/data/base.js'

describe('BaseData', () => {
	test('constructor', () => {
		const data = new BaseData(null)
		expect(data._x).toHaveLength(0)
	})

	test('avail task', () => {
		const data = new BaseData(null)

		expect(data.availTask).toEqual([])
	})

	describe('dimension', () => {
		test('empty x', () => {
			const data = new BaseData(null)

			expect(data.dimension).toBe(0)
		})

		test('has x', () => {
			const data = new BaseData(null)
			data._x = [
				[1, 2],
				[3, 4],
			]

			expect(data.dimension).toBe(2)
		})
	})

	describe('domain', () => {
		test('no x', () => {
			const data = new BaseData(null)

			expect(data.domain).toEqual([])
		})

		test('has x', () => {
			const data = new BaseData(null)
			data._x = [
				[1, 2],
				[3, 4],
			]

			expect(data.domain).toEqual([
				[1, 3],
				[2, 4],
			])
		})
	})

	describe('range', () => {
		test('no y', () => {
			const data = new BaseData(null)

			expect(data.range).toEqual([Infinity, -Infinity])
		})

		test('has y', () => {
			const data = new BaseData(null)
			data._y = [1, 2, 3]

			expect(data.range).toEqual([1, 3])
		})
	})

	describe('indexRange', () => {
		test('no index', () => {
			const data = new BaseData(null)

			expect(data.indexRange).toEqual([Infinity, -Infinity])
		})

		test('has index', () => {
			const data = new BaseData(null)
			data._index = [1, 2, 3, 4, 5]

			expect(data.indexRange).toEqual([1, 5])
		})
	})

	describe('length', () => {
		test('no data', () => {
			const data = new BaseData(null)

			expect(data.length).toBe(0)
		})

		test('has x', () => {
			const data = new BaseData(null)
			data._x = [
				[1, 2],
				[3, 4],
			]

			expect(data.length).toBe(2)
		})

		test('has y', () => {
			const data = new BaseData(null)
			data._y = [1, 2, 3]

			expect(data.length).toBe(3)
		})

		test('has index', () => {
			const data = new BaseData(null)
			data._index = [1, 2, 3, 4, 5]

			expect(data.length).toBe(5)
		})
	})

	describe('columnNames', () => {
		test('no x', () => {
			const data = new BaseData(null)

			expect(data.columnNames).toEqual([])
		})

		test('has x', () => {
			const data = new BaseData(null)
			data._x = [
				[1, 2],
				[3, 4],
			]

			expect(data.columnNames).toEqual(['0', '1'])
		})
	})

	test('x', () => {
		const data = new BaseData(null)

		expect(data.x).toEqual([])
	})

	test('originalX', () => {
		const data = new BaseData(null)

		expect(data.originalX).toEqual([])
	})

	test('y', () => {
		const data = new BaseData(null)

		expect(data.y).toEqual([])
	})

	test('originalY', () => {
		const data = new BaseData(null)

		expect(data.originalY).toEqual([])
	})

	test('index', () => {
		const data = new BaseData(null)

		expect(data.index).toBeNull()
	})

	test('labels', () => {
		const data = new BaseData(null)

		expect(data.labels).toEqual([])
	})

	test('get params', () => {
		const data = new BaseData(null)

		expect(data.params).toEqual({})
	})

	test('set params', () => {
		const data = new BaseData(null)
		data.params = {}
		expect(data.params).toEqual({})
	})

	test('terminate', () => {
		const data = new BaseData(manager)

		expect(() => data.terminate()).not.toThrow()
	})
})

describe('EmptyData', () => {
	test('constructor', () => {
		const data = new EmptyData(null)
		expect(data._x).toHaveLength(0)
	})

	test('avail task', () => {
		const data = new EmptyData(null)

		expect(data.availTask).toEqual(['MD', 'GM'])
	})

	test('dimension', () => {
		const data = new EmptyData(null)

		expect(data.dimension).toBe(0)
	})

	test('domain', () => {
		const data = new EmptyData(null)

		expect(data.domain).toEqual([])
	})

	test('range', () => {
		const data = new EmptyData(null)

		expect(data.range).toEqual([Infinity, -Infinity])
	})

	test('indexRange', () => {
		const data = new EmptyData(null)

		expect(data.indexRange).toEqual([Infinity, -Infinity])
	})

	test('length', () => {
		const data = new EmptyData(null)

		expect(data.length).toBe(0)
	})

	test('columnNames', () => {
		const data = new EmptyData(null)

		expect(data.columnNames).toEqual([])
	})

	test('x', () => {
		const data = new EmptyData(null)

		expect(data.x).toEqual([])
	})

	test('originalX', () => {
		const data = new EmptyData(null)

		expect(data.originalX).toEqual([])
	})

	test('y', () => {
		const data = new EmptyData(null)

		expect(data.y).toEqual([])
	})

	test('originalY', () => {
		const data = new EmptyData(null)

		expect(data.originalY).toEqual([])
	})

	test('index', () => {
		const data = new EmptyData(null)

		expect(data.index).toEqual([])
	})

	test('labels', () => {
		const data = new EmptyData(null)

		expect(data.labels).toEqual([])
	})

	test('get params', () => {
		const data = new EmptyData(null)

		expect(data.params).toEqual({})
	})

	test('points', () => {
		const data = new EmptyData(null)

		expect(data.points).toEqual([])
	})

	test('terminate', () => {
		const data = new EmptyData(manager)

		expect(() => data.terminate()).not.toThrow()
	})
})

describe('MultiDimensionalData', () => {
	test('constructor', () => {
		const data = new MultiDimensionalData(null)
		expect(data._x).toHaveLength(0)
	})

	test('avail task', () => {
		const data = new MultiDimensionalData(null)

		expect(data.availTask).toEqual([])
	})

	test('dimension', () => {
		const data = new MultiDimensionalData(null)

		expect(data.dimension).toBe(0)
	})

	test('domain', () => {
		const data = new MultiDimensionalData(null)

		expect(data.domain).toEqual([])
	})

	test('range', () => {
		const data = new MultiDimensionalData(null)

		expect(data.range).toEqual([Infinity, -Infinity])
	})

	test('indexRange', () => {
		const data = new MultiDimensionalData(null)

		expect(data.indexRange).toEqual([Infinity, -Infinity])
	})

	test('length', () => {
		const data = new MultiDimensionalData(null)

		expect(data.length).toBe(0)
	})

	test('columnNames', () => {
		const data = new MultiDimensionalData(null)

		expect(data.columnNames).toEqual([])
	})

	test('inputCategoryNames', () => {
		const data = new MultiDimensionalData(null)

		expect(data.inputCategoryNames).toEqual([])
	})

	test('x', () => {
		const data = new MultiDimensionalData(null)

		expect(data.x).toEqual([])
	})

	test('originalX', () => {
		const data = new MultiDimensionalData(null)

		expect(data.originalX).toEqual([])
	})

	test('outputCategoryNames', () => {
		const data = new MultiDimensionalData(null)

		expect(data.outputCategoryNames).toBeNull()
	})

	test('y', () => {
		const data = new MultiDimensionalData(null)

		expect(data.y).toEqual([])
	})

	test('originalY', () => {
		const data = new MultiDimensionalData(null)

		expect(data.originalY).toEqual([])
	})

	test('index', () => {
		const data = new MultiDimensionalData(null)

		expect(data.index).toBeNull()
	})

	test('labels', () => {
		const data = new MultiDimensionalData(null)

		expect(data.labels).toEqual([])
	})

	test('get params', () => {
		const data = new MultiDimensionalData(null)

		expect(data.params).toEqual({})
	})

	test('terminate', () => {
		const data = new MultiDimensionalData(manager)

		expect(() => data.terminate()).not.toThrow()
	})

	describe('setArray', () => {
		test('no info', () => {
			const data = new MultiDimensionalData(manager)
			data.setArray(
				[
					[1, 'val1'],
					[2, 'val2'],
				],
				[{}, {}]
			)

			expect(data.inputCategoryNames).toEqual([undefined, ['val1', 'val2']])
			expect(data.x).toEqual([
				[1, 0],
				[2, 1],
			])
			expect(data.originalX).toEqual([
				[1, 'val1'],
				[2, 'val2'],
			])
			expect(data.y).toEqual([])
		})

		test('numeric output', () => {
			const data = new MultiDimensionalData(manager)
			data.setArray(
				[
					[1, 1, 'val1', 'a', 0.1],
					[2, 2, 'val1', 'b', 0.2],
					['x', 3, 'val2', 'c', 0.3],
				],
				[
					{ type: 'numeric' },
					{ type: 'category', labels: { 1: 'a1', 2: 'a2' } },
					{},
					{ ignore: true },
					{ out: true },
				]
			)

			expect(data.inputCategoryNames).toEqual([undefined, ['a1', 'a2', 3], ['val1', 'val2']])
			expect(data.x).toEqual([
				[1, 0, 0],
				[2, 1, 0],
				['x', 2, 1],
			])
			expect(data.originalX).toEqual([
				[1, 'a1', 'val1'],
				[2, 'a2', 'val1'],
				['x', 3, 'val2'],
			])
			expect(data.y).toEqual([0.1, 0.2, 0.3])
			expect(data.originalY).toEqual([0.1, 0.2, 0.3])
		})

		test('categorical output', () => {
			const data = new MultiDimensionalData(manager)
			data.setArray(
				[
					[1, 'a'],
					[2, 'b'],
					[3, 'a'],
				],
				[{}, { out: true }]
			)

			expect(data.inputCategoryNames).toEqual([])
			expect(data.x).toEqual([[1], [2], [3]])
			expect(data.originalX).toEqual([[1], [2], [3]])
			expect(data.y).toEqual([1, 2, 1])
			expect(data.originalY).toEqual(['a', 'b', 'a'])
		})

		test('categorical with labeled output', () => {
			const data = new MultiDimensionalData(manager)
			data.setArray(
				[
					[1, 'a'],
					[2, 'b'],
					[3, 'a'],
				],
				[{}, { out: true, labels: { a: 'aa' } }]
			)

			expect(data.inputCategoryNames).toEqual([])
			expect(data.x).toEqual([[1], [2], [3]])
			expect(data.originalX).toEqual([[1], [2], [3]])
			expect(data.y).toEqual([1, 2, 1])
			expect(data.originalY).toEqual(['a', 'b', 'a'])
		})
	})
})

describe('FixData', () => {
	test('constructor', () => {
		const data = new FixData(null)
		expect(data._x).toHaveLength(0)
	})

	test('avail task', () => {
		const data = new FixData(null)

		expect(data.availTask).toEqual([])
	})

	test('dimension', () => {
		const data = new FixData(null)

		expect(data.dimension).toBe(0)
	})

	test('domain', () => {
		const data = new FixData(null)

		const domain = data.domain
		expect(domain).toEqual([])
		expect(data.domain).toBe(domain)
	})

	test('range', () => {
		const data = new FixData(null)

		expect(data.range).toEqual([Infinity, -Infinity])
	})

	test('indexRange', () => {
		const data = new FixData(null)

		expect(data.indexRange).toEqual([Infinity, -Infinity])
	})

	test('length', () => {
		const data = new FixData(null)

		expect(data.length).toBe(0)
	})

	test('columnNames', () => {
		const data = new FixData(null)

		expect(data.columnNames).toEqual([])
	})

	test('x', () => {
		const data = new FixData(null)

		expect(data.x).toEqual([])
	})

	test('originalX', () => {
		const data = new FixData(null)

		expect(data.originalX).toEqual([])
	})

	test('y', () => {
		const data = new FixData(null)

		expect(data.y).toEqual([])
	})

	test('originalY', () => {
		const data = new FixData(null)

		expect(data.originalY).toEqual([])
	})

	test('index', () => {
		const data = new FixData(null)

		expect(data.index).toBeNull()
	})

	test('labels', () => {
		const data = new FixData(null)

		expect(data.labels).toEqual([])
	})

	test('get params', () => {
		const data = new FixData(null)

		expect(data.params).toEqual({})
	})

	test('terminate', () => {
		const data = new FixData(manager)

		expect(() => data.terminate()).not.toThrow()
	})
})
