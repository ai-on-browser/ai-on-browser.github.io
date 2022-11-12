import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../lib/model/nns/onnx/onnx_importer'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('import', () => {
	test('import', async () => {
		const buf = await fs.promises.readFile(`${filepath}/test_pytorch.onnx`)
		const net = await ONNXImporter.load(buf)
		const y = net.calc([[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]]).toArray()
		expect(y).toHaveLength(1)
		expect(y[0]).toHaveLength(2)
	})
})
