import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Tensor from '../../../../../../lib/util/tensor.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('reshape', async () => {
		const buf = await fs.promises.readFile(`${filepath}/reshape.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ReshapeLayer')
		const x = Tensor.randn([20, 5, 2])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 10])
		for (let i = 0; i < y.rows; i++) {
			for (let j = 0; j < y.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(x.at(i, Math.floor(j / 2), j % 2))
			}
		}
	})
})
