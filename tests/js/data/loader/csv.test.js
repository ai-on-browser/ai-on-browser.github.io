import { jest } from '@jest/globals'

import CSV from '../../../../js/data/loader/csv.js'

describe('CSV', () => {
	describe('data', () => {
		test('without header', () => {
			const csv = new CSV([
				['val1', 'val2'],
				['val3', 'val4'],
			])

			const data = csv.data
			expect(data).toHaveLength(2)
			expect(data).toEqual([
				['val1', 'val2'],
				['val3', 'val4'],
			])
		})

		test('with header', () => {
			const csv = new CSV(
				[
					['col1', 'col2'],
					['val1', 'val2'],
					['val3', 'val4'],
				],
				{ header: 1 }
			)

			const data = csv.data
			expect(data).toHaveLength(2)
			expect(data).toEqual([
				['val1', 'val2'],
				['val3', 'val4'],
			])
		})
	})

	describe('columns', () => {
		test('without header', () => {
			const csv = new CSV([
				['val1', 'val2'],
				['val3', 'val4'],
			])

			const columns = csv.columns
			expect(columns).toHaveLength(2)
			expect(columns).toEqual(['0', '1'])
		})

		test('with header', () => {
			const csv = new CSV(
				[
					['col1', 'col2'],
					['val1', 'val2'],
					['val3', 'val4'],
				],
				{ header: 1 }
			)

			const columns = csv.columns
			expect(columns).toHaveLength(2)
			expect(columns).toEqual(['col1', 'col2'])
		})
	})

	describe('type', () => {
		test('without header', () => {
			const csv = new CSV([
				['val1', '1'],
				['val3', '2'],
			])

			const type = csv.type
			expect(type).toHaveLength(2)
			expect(type).toEqual(['category', 'numeric'])
		})

		test('with header', () => {
			const csv = new CSV(
				[
					['col1', 'col2'],
					['val1', '1'],
					['val3', '2'],
				],
				{ header: 1 }
			)

			const type = csv.type
			expect(type).toHaveLength(2)
			expect(type).toEqual(['category', 'numeric'])
		})
	})

	describe('info', () => {
		test('without header', () => {
			const csv = new CSV([
				['val1', '1'],
				['val3', '2'],
			])

			const info = csv.info
			expect(info).toHaveLength(2)
			expect(info).toEqual([
				{ name: '0', type: 'category' },
				{ name: '1', type: 'numeric', out: true },
			])
		})

		test('with header', () => {
			const csv = new CSV(
				[
					['col1', 'col2'],
					['val1', '1'],
					['val3', '2'],
				],
				{ header: 1 }
			)

			const info = csv.info
			expect(info).toHaveLength(2)
			expect(info).toEqual([
				{ name: 'col1', type: 'category' },
				{ name: 'col2', type: 'numeric', out: true },
			])
		})
	})

	describe('parse', () => {
		test('without header', () => {
			const csv = CSV.parse('val1,val2\nval3,val4')

			const data = csv.data
			expect(data).toHaveLength(2)
			expect(data).toEqual([
				['val1', 'val2'],
				['val3', 'val4'],
			])
		})

		test('with header', () => {
			const csv = CSV.parse('col1,col2\nval1,val2\nval3,val4', { header: 1 })

			const data = csv.data
			expect(data).toHaveLength(2)
			expect(data).toEqual([
				['val1', 'val2'],
				['val3', 'val4'],
			])
		})

		test('crlf', () => {
			const csv = CSV.parse('val1,val2\r\nval3,val4')

			const data = csv.data
			expect(data).toHaveLength(2)
			expect(data).toEqual([
				['val1', 'val2'],
				['val3', 'val4'],
			])
		})

		test('empty line', () => {
			const csv = CSV.parse('val1,val2\n\nval3,val4\n')

			const data = csv.data
			expect(data).toHaveLength(2)
			expect(data).toEqual([
				['val1', 'val2'],
				['val3', 'val4'],
			])
		})

		test('doube quote', () => {
			const csv = CSV.parse('"val1","val2"\n"val3","val4"')

			const data = csv.data
			expect(data).toHaveLength(2)
			expect(data).toEqual([
				['val1', 'val2'],
				['val3', 'val4'],
			])
		})

		test('escape quote / lf', () => {
			const csv = CSV.parse('"val""1","val\n2"\n"val3","val4"')

			const data = csv.data
			expect(data).toHaveLength(2)
			expect(data).toEqual([
				['val"1', 'val\n2'],
				['val3', 'val4'],
			])
		})
	})

	describe('load', () => {
		let spyFetch
		beforeAll(() => {
			if (typeof globalThis.FileReader === 'undefined') {
				globalThis.FileReader = class {
					async readAsText(blob) {
						this.result = await blob.text()
						this.onload()
					}
				}
			}
			spyFetch = jest.spyOn(globalThis, 'fetch').mockImplementation(async () => {
				const blob = new Blob(['val1,val2\nval3,val4'])
				return blob
			})
		})

		afterAll(() => {
			spyFetch?.mockRestore()
		})

		test('string', async () => {
			const csv = await CSV.load('http://localhost/test.csv')

			const data = csv.data
			expect(data).toHaveLength(2)
			expect(data).toEqual([
				['val1', 'val2'],
				['val3', 'val4'],
			])
		})

		test('file', async () => {
			const blob = new Blob(['val1,val2\nval3,val4'])
			const file = new File([blob], 'test.csv')
			const csv = await CSV.load(file)

			const data = csv.data
			expect(data).toHaveLength(2)
			expect(data).toEqual([
				['val1', 'val2'],
				['val3', 'val4'],
			])
		})
	})

	describe('load gz', () => {
		let spyFetch
		beforeAll(() => {
			if (typeof globalThis.FileReader === 'undefined') {
				globalThis.FileReader = class {
					async readAsText(blob) {
						this.result = await blob.text()
						this.onload()
					}
				}
			}
			spyFetch = jest.spyOn(globalThis, 'fetch').mockImplementation(async () => {
				const blob = new Blob(['val1,val2\nval3,val4'])
				const compressedReadableStream = blob.stream().pipeThrough(new CompressionStream('gzip'))
				return new Response(compressedReadableStream)
			})
		})

		afterAll(() => {
			spyFetch?.mockRestore()
		})

		test('string', async () => {
			const csv = await CSV.load('http://localhost/test.csv.gz')

			const data = csv.data
			expect(data).toHaveLength(2)
			expect(data).toEqual([
				['val1', 'val2'],
				['val3', 'val4'],
			])
		})
	})
})
