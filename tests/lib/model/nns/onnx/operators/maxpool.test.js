import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Tensor from '../../../../../../lib/util/tensor.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('maxpool', async () => {
		const buf = await fs.promises.readFile(`${filepath}/maxpool.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('MaxPoolLayer')
		const x = Tensor.randn([20, 2, 10, 10])

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 2, 5, 5])
	})
})
