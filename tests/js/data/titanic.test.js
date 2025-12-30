import { expect, jest } from '@jest/globals'
import * as fs from 'fs'
import path from 'path'
import url from 'url'
import TitanicData from '../../../js/data/titanic.js'
import manager from '../helper/manager.js'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

const waitReadyData = async data => {
	const startTime = new Date().getTime()
	while (new Date().getTime() < startTime + 100000) {
		await new Promise(resolve => setTimeout(resolve, 100))
		if (data.length > 0) {
			return
		}
	}
	throw new Error()
}

describe('TitanicData', () => {
	let spyFetch
	beforeAll(() => {
		spyFetch = jest.spyOn(globalThis, 'fetch').mockImplementation(async () => {
			const buff = await fs.promises.readFile(
				path.join(filepath, '..', '..', '..', 'js', 'data', 'csv', 'titanic.csv.gz')
			)
			return new Blob([buff])
		})
	})

	afterAll(() => {
		spyFetch?.mockRestore()
	})

	test('constructor', async () => {
		const data = new TitanicData(manager)
		await waitReadyData(data)

		expect(data._x).toHaveLength(1309)
	})

	test('avail task', async () => {
		const data = new TitanicData(manager)
		await waitReadyData(data)

		expect(data.availTask).toEqual(['RC'])
	})

	test('dimension', async () => {
		const data = new TitanicData(manager)
		await waitReadyData(data)

		expect(data.dimension).toBe(14)
	})

	test('domain', async () => {
		const data = new TitanicData(manager)
		await waitReadyData(data)

		expect(data.domain).toEqual([
			[1, 3],
			[0, 1],
			[0, 1306],
			[0, 1],
			[NaN, NaN],
			[0, 8],
			[0, 9],
			[0, 928],
			[NaN, NaN],
			[0, 186],
			[0, 3],
			[0, 27],
			[NaN, NaN],
			[0, 369],
		])
	})

	test('range', async () => {
		const data = new TitanicData(manager)
		await waitReadyData(data)

		expect(data.range).toEqual([Infinity, -Infinity])
	})

	test('indexRange', async () => {
		const data = new TitanicData(manager)
		await waitReadyData(data)

		expect(data.indexRange).toEqual([Infinity, -Infinity])
	})

	test('length', async () => {
		const data = new TitanicData(manager)
		await waitReadyData(data)

		expect(data.length).toBe(1309)
	})

	test('columnNames', async () => {
		const data = new TitanicData(manager)
		await waitReadyData(data)

		expect(data.columnNames).toEqual([
			'pclass',
			'survived',
			'name',
			'sex',
			'age',
			'sibsp',
			'parch',
			'ticket',
			'fare',
			'cabin',
			'embarked',
			'boat',
			'body',
			'home.dest',
		])
	})

	test('inputCategoryNames', async () => {
		const data = new TitanicData(manager)
		await waitReadyData(data)

		expect(data.inputCategoryNames).toHaveLength(14)
	})

	test('x', async () => {
		const data = new TitanicData(manager)
		await waitReadyData(data)

		expect(data.x).toHaveLength(1309)
	})

	test('originalX', async () => {
		const data = new TitanicData(manager)
		await waitReadyData(data)

		expect(data.originalX).toHaveLength(1309)
	})

	test('outputCategoryNames', async () => {
		const data = new TitanicData(manager)
		await waitReadyData(data)

		expect(data.outputCategoryNames).toBeNull()
	})

	test('y', async () => {
		const data = new TitanicData(manager)
		await waitReadyData(data)

		expect(data.y).toEqual([])
	})

	test('originalY', async () => {
		const data = new TitanicData(manager)
		await waitReadyData(data)

		expect(data.originalY).toEqual([])
	})

	test('index', async () => {
		const data = new TitanicData(manager)
		await waitReadyData(data)

		expect(data.index).toBeNull()
	})

	test('labels', async () => {
		const data = new TitanicData(manager)
		await waitReadyData(data)

		expect(data.labels).toEqual([])
	})

	test('get params', async () => {
		const data = new TitanicData(manager)
		await waitReadyData(data)

		expect(data.params).toEqual({})
	})

	test('terminate', async () => {
		const data = new TitanicData(manager)
		await waitReadyData(data)

		expect(() => data.terminate()).not.toThrow()
	})
})
