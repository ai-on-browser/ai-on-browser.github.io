import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Matrix from '../../../../../../lib/util/matrix.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('concat', async () => {
		const buf = await fs.promises.readFile(`${filepath}/concat.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConcatLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 4])
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j))
			}
			expect(y.at(i, x.cols)).toBeCloseTo(1)
		}
	})
})
