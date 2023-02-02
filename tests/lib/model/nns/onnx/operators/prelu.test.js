import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Matrix from '../../../../../../lib/util/matrix.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('prelu', async () => {
		const buf = await fs.promises.readFile(`${filepath}/prelu.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ParametricReLULayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, j) < 0 ? x.at(i, j) * 0.1 : x.at(i, j))
			}
		}
	})

	test('prelu_slope_array', async () => {
		expect.assertions(1)
		const buf = await fs.promises.readFile(`${filepath}/prelu_slope_array.onnx`)
		try {
			await ONNXImporter.load(buf)
		} catch (e) {
			/* eslint jest/no-conditional-expect: 0 */
			expect(e.message).toMatch('Invalid slope value')
		}
	})
})