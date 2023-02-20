import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../lib/model/nns/onnx/onnx_importer'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('import', () => {
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
})
