import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Matrix from '../../../../../../lib/util/matrix.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

const alpha = 1.67326319217681884765625
const gamma = 1.05070102214813232421875

describe('load', () => {
	test('selu', async () => {
		const buf = await fs.promises.readFile(`${filepath}/selu.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ScaledELULayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(
					x.at(i, j) < 0 ? gamma * alpha * (Math.exp(x.at(i, j)) - 1) : gamma * x.at(i, j)
				)
			}
		}
	})
	
	test('selu_attrs', async () => {
		const buf = await fs.promises.readFile(`${filepath}/selu_attrs.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ScaledELULayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(
					x.at(i, j) < 0 ? 1.5 * (Math.exp(x.at(i, j)) - 1) : x.at(i, j)
				)
			}
		}
	})
})
