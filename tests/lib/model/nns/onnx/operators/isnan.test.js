import fs from 'fs'
import path from 'path'
import url from 'url'

import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Matrix from '../../../../../../lib/util/matrix.js'
const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('isnan', async () => {
		const buf = await fs.promises.readFile(`${filepath}/isnan.onnx`)
		const net = await ONNXImporter.load(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('IsNanLayer')
		const x = new Matrix(1, 4, [0, Infinity, -Infinity, NaN])

		const y = net.calc(x)
		expect(y.toArray()).toEqual([[false, false, false, true]])
	})
})
