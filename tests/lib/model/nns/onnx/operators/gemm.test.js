import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Matrix from '../../../../../../lib/util/matrix.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('gemm', async () => {
		const buf = await fs.promises.readFile(`${filepath}/gemm.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('FullyConnected')
		const x = Matrix.randn(20, 10)

		const y = net.calc(x)
		expect(y.sizes).toEqual([20, 3])
	})
})
