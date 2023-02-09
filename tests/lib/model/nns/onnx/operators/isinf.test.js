import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Matrix from '../../../../../../lib/util/matrix.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('isinf', async () => {
		const buf = await fs.promises.readFile(`${filepath}/isinf.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('IsInfLayer')
		const x = new Matrix(1, 4, [0, Infinity, -Infinity, NaN])

		const y = net.calc(x)
		expect(y.toArray()).toEqual([[false, true, true, false]])
	})

	test('isinf_detect_negative', async () => {
		const buf = await fs.promises.readFile(`${filepath}/isinf_detect_negative.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error("Invalid attribute 'detect_negative' value 0."))
	})

	test('isinf_detect_positive', async () => {
		const buf = await fs.promises.readFile(`${filepath}/isinf_detect_positive.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error("Invalid attribute 'detect_positive' value 0."))
	})
})
