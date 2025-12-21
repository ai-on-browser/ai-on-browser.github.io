import fs from 'fs'
import path from 'path'
import url from 'url'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'
import Matrix from '../../../../../../lib/util/matrix.js'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

const erf = z => {
	const p = 0.3275911
	const a1 = 0.254829592
	const a2 = -0.284496736
	const a3 = 1.421413741
	const a4 = -1.453152027
	const a5 = 1.061405429

	const sign = z < 0 ? -1 : 1
	const t = 1 / (1 + p * Math.abs(z))
	const erf = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z)
	return sign * erf
}

describe('load', () => {
	test('erf', async () => {
		const buf = await fs.promises.readFile(`${filepath}/erf.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(3)
		expect(nodes[1]).toEqual({ type: 'erf', input: ['x'], name: 'y' })
	})
})

describe('nn', () => {
	test('erf', async () => {
		const buf = await fs.promises.readFile(`${filepath}/erf.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ErfLayer')
		const x = Matrix.randn(20, 3)

		const y = net.calc(x)
		for (let i = 0; i < x.rows; i++) {
			for (let j = 0; j < x.cols; j++) {
				expect(y.at(i, j)).toBeCloseTo(erf(x.at(i, j)))
			}
		}
	})
})
