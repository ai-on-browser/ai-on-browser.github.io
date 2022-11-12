import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Matrix from '../../../../../../lib/util/matrix.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('dropout', async () => {
		const buf = await fs.promises.readFile(`${filepath}/dropout.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('DropoutLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		const dropidx = []
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				if (i === 0 && y.at(i, j) === 0) {
					dropidx.push(j)
				}
				expect(y.at(i, j)).toBeCloseTo(dropidx.indexOf(j) >= 0 ? 0 : x.at(i, j) * 1.5)
			}
		}
	})
})
