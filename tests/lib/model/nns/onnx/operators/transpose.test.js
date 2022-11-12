import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Matrix from '../../../../../../lib/util/matrix.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('transpose', async () => {
		const buf = await fs.promises.readFile(`${filepath}/transpose.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('TransposeLayer')
		const x = Matrix.randn(20, 10)

		const y = net.calc(x)
		expect(y.sizes).toEqual([10, 20])
		for (let i = 0; i < y.rows; i++) {
			for (let j = 0; j < y.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(j, i))
			}
		}
	})
})
