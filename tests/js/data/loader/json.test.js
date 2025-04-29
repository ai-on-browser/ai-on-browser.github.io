import { jest } from '@jest/globals'

import JSONLoader from '../../../../js/data/loader/json.js'

describe('JSONLoader', () => {
	describe('data', () => {
		test('simple', () => {
			const loader = new JSONLoader([
				{ col1: 'val1', col2: 'val2' },
				{ col1: 'val3', col2: 'val4' },
			])

			const data = loader.data
			expect(data).toHaveLength(2)
			expect(data).toEqual([
				['val1', 'val2'],
				['val3', 'val4'],
			])
		})

		test('with info', () => {
			const loader = new JSONLoader([{ col1: 'val1' }, { col1: 'val3', col2: 2 }], {
				columnInfos: [{ name: 'col1' }, { name: 'col2', nan: 0 }],
			})

			const data = loader.data
			expect(data).toHaveLength(2)
			expect(data).toEqual([
				['val1', 0],
				['val3', 2],
			])
		})
	})

	test('json', () => {
		const data = [
			{ col1: 'val1', col2: 'val2' },
			{ col1: 'val3', col2: 'val4' },
		]
		const loader = new JSONLoader(data)

		const json = loader.json
		expect(json).toHaveLength(2)
		expect(json).toEqual(data)
	})

	describe('info', () => {
		test('simple', () => {
			const loader = new JSONLoader([
				{ col1: 'val1', col2: 1 },
				{ col1: 'val3', col2: '2' },
			])

			const info = loader.info
			expect(info).toHaveLength(2)
			expect(info).toEqual([
				{ name: 'col1', type: 'category' },
				{ name: 'col2', type: 'numeric', out: true },
			])
		})
	})

	describe('load', () => {
		let spyFetch
		beforeAll(() => {
			if (typeof globalThis.FileReader === 'undefined') {
				globalThis.FileReader = class {
					async readAsText(blob, encoding) {
						this.result = await blob.text()
						this.onload()
					}
				}
			}
			spyFetch = jest.spyOn(globalThis, 'fetch').mockImplementation(async () => {
				const blob = new Blob(['[{"col1":"val1","col2":"val2"},{"col1":"val3","col2":"val4"}]'])
				return {
					json: async () => {
						return JSON.parse(await blob.text())
					},
				}
			})
		})

		afterAll(() => {
			spyFetch?.mockRestore()
		})

		test('string', async () => {
			const csv = await JSONLoader.load('http://localhost/test.csv')

			const data = csv.data
			expect(data).toHaveLength(2)
			expect(data).toEqual([
				['val1', 'val2'],
				['val3', 'val4'],
			])
		})

		test('file', async () => {
			const blob = new Blob(['[{"col1":"val1","col2":"val2"},{"col1":"val3","col2":"val4"}]'])
			const file = new File([blob], 'test.json')
			const csv = await JSONLoader.load(file)

			const data = csv.data
			expect(data).toHaveLength(2)
			expect(data).toEqual([
				['val1', 'val2'],
				['val3', 'val4'],
			])
		})
	})
})
