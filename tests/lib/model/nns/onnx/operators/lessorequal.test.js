import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Matrix from '../../../../../../lib/util/matrix.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('lessorequal', async () => {
		const buf = await fs.promises.readFile(`${filepath}/lessorequal.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('LessOrEqualLayer')
		const x1 = Matrix.randint(20, 3, -5, 5)
		const x2 = Matrix.randint(20, 3, -5, 5)

		const y = net.calc({ x1, x2 })
		for (let i = 0; i < x1.rows; i++) {
			for (let j = 0; j < x2.cols; j++) {
				expect(y.at(i, j)).toBe(x1.at(i, j) <= x2.at(i, j))
			}
		}
	})
})
