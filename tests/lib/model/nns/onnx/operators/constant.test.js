import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('constant', async () => {
		const buf = await fs.promises.readFile(`${filepath}/constant.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConstLayer')

		const y = net.calc({})
		for (let i = 0; i < 1; i++) {
			for (let j = 0; j < 1; j++) {
				expect(y.at(i, j)).toBeCloseTo(1)
			}
		}
	})
})
