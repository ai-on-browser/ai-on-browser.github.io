import fs from 'fs'
import path from 'path'
import url from 'url'
import { Blob } from 'buffer'

import { jest } from '@jest/globals'

import ONNXImporter from '../../../../../lib/model/nns/onnx/onnx_importer'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('import', () => {
	test('Blob', async () => {
		const buf = await fs.promises.readFile(`${filepath}/test_pytorch.onnx`)
		const nodes = await ONNXImporter.load(new Blob([buf]))
		expect(nodes).toHaveLength(10)
		expect(nodes.map(n => n.type)).toEqual([
			'input',
			'full',
			'tanh',
			'full',
			'abs',
			'const',
			'add',
			'div',
			'full',
			'output',
		])
	})

	test('Buffer', async () => {
		const buf = await fs.promises.readFile(`${filepath}/test_pytorch.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(10)
		expect(nodes.map(n => n.type)).toEqual([
			'input',
			'full',
			'tanh',
			'full',
			'abs',
			'const',
			'add',
			'div',
			'full',
			'output',
		])
	})

	test('ArrayBuffer', async () => {
		const buf = await fs.promises.readFile(`${filepath}/test_pytorch.onnx`)
		const nodes = await ONNXImporter.load(buf.buffer)
		expect(nodes).toHaveLength(10)
		expect(nodes.map(n => n.type)).toEqual([
			'input',
			'full',
			'tanh',
			'full',
			'abs',
			'const',
			'add',
			'div',
			'full',
			'output',
		])
	})

	describe('console log', () => {
		let orgConsoleError = null
		beforeAll(() => {
			orgConsoleError = console.error
			console.error = jest.fn()
		})

		afterAll(() => {
			console.log = orgConsoleError
		})

		test('noimpl layer', async () => {
			const buf = await fs.promises.readFile(`${filepath}/test_noimpl_layer.onnx`)
			const nodes = await ONNXImporter.load(buf.buffer)
			expect(nodes).toHaveLength(2)
			expect(nodes.map(n => n.type)).toEqual(['input', 'output'])
			expect(console.error).toHaveBeenCalledTimes(1)
			expect(console.error).toHaveBeenCalledWith('Unimplemented operator Cast.')
		})
	})
})
