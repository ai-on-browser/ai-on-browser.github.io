import fs from 'fs'
import path from 'path'
import url from 'url'
import NeuralNetwork from '../../../../../../lib/model/neuralnetwork.js'
import ONNXImporter from '../../../../../../lib/model/nns/onnx/onnx_importer.js'

const filepath = path.dirname(url.fileURLToPath(import.meta.url))

describe('load', () => {
	test('constant_0d', async () => {
		const buf = await fs.promises.readFile(`${filepath}/constant_0d.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(2)
		expect(nodes[0]).toEqual({ type: 'const', value: 1, name: 'y' })
	})

	test('constant', async () => {
		const buf = await fs.promises.readFile(`${filepath}/constant.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(2)
		expect(nodes[0]).toEqual({ type: 'const', value: [[1]], name: 'y' })
	})

	test('constant_sparse_tensor', async () => {
		const buf = await fs.promises.readFile(`${filepath}/constant_sparse_tensor.onnx`)
		await expect(ONNXImporter.load(buf)).rejects.toEqual(new Error('Not implemented attribute type.'))
	})

	test('constant_float', async () => {
		const buf = await fs.promises.readFile(`${filepath}/constant_float.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(2)
		expect(nodes[0].type).toBe('const')
		expect(nodes[0].name).toBe('y')
		expect(nodes[0].value).toBeCloseTo(1.2)
	})

	test('constant_floats', async () => {
		const buf = await fs.promises.readFile(`${filepath}/constant_floats.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(2)
		expect(nodes[0].type).toBe('const')
		expect(nodes[0].name).toBe('y')
		expect(nodes[0].value[0]).toBeCloseTo(1.2)
		expect(nodes[0].value[1]).toBeCloseTo(3.4)
	})

	test('constant_int', async () => {
		const buf = await fs.promises.readFile(`${filepath}/constant_int.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(2)
		expect(nodes[0]).toEqual({ type: 'const', value: 1, name: 'y' })
	})

	test('constant_ints', async () => {
		const buf = await fs.promises.readFile(`${filepath}/constant_ints.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(2)
		expect(nodes[0]).toEqual({ type: 'const', value: [1, 2], name: 'y' })
	})

	test('constant_string', async () => {
		const buf = await fs.promises.readFile(`${filepath}/constant_string.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(2)
		expect(nodes[0]).toEqual({ type: 'const', value: 'str', name: 'y' })
	})

	test('constant_strings', async () => {
		const buf = await fs.promises.readFile(`${filepath}/constant_strings.onnx`)
		const nodes = await ONNXImporter.load(buf)
		expect(nodes).toHaveLength(2)
		expect(nodes[0]).toEqual({ type: 'const', value: ['str', 'ing'], name: 'y' })
	})
})

describe('nn', () => {
	test('constant_0d', async () => {
		const buf = await fs.promises.readFile(`${filepath}/constant_0d.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConstLayer')

		const y = net.calc({})
		expect(y.sizes).toEqual([1])
		expect(y.at(0)).toBe(1)
	})

	test('constant', async () => {
		const buf = await fs.promises.readFile(`${filepath}/constant.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConstLayer')

		const y = net.calc({})
		expect(y.sizes).toEqual([1, 1])
		expect(y.at(0, 0)).toBe(1)
	})

	test('constant_float', async () => {
		const buf = await fs.promises.readFile(`${filepath}/constant_float.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConstLayer')

		const y = net.calc({})
		expect(y.sizes).toEqual([1])
		expect(y.at(0)).toBeCloseTo(1.2)
	})

	test('constant_floats', async () => {
		const buf = await fs.promises.readFile(`${filepath}/constant_floats.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConstLayer')

		const y = net.calc({})
		expect(y.sizes).toEqual([2])
		expect(y.at(0)).toBeCloseTo(1.2)
		expect(y.at(1)).toBeCloseTo(3.4)
	})

	test('constant_int', async () => {
		const buf = await fs.promises.readFile(`${filepath}/constant_int.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConstLayer')

		const y = net.calc({})
		expect(y.sizes).toEqual([1])
		expect(y.at(0)).toBe(1)
	})

	test('constant_ints', async () => {
		const buf = await fs.promises.readFile(`${filepath}/constant_ints.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConstLayer')

		const y = net.calc({})
		expect(y.sizes).toEqual([2])
		expect(y.at(0)).toBe(1)
		expect(y.at(1)).toBe(2)
	})

	test('constant_string', async () => {
		const buf = await fs.promises.readFile(`${filepath}/constant_string.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConstLayer')

		const y = net.calc({})
		expect(y.sizes).toEqual([1])
		expect(y.at(0)).toBe('str')
	})

	test('constant_strings', async () => {
		const buf = await fs.promises.readFile(`${filepath}/constant_strings.onnx`)
		const net = await NeuralNetwork.fromONNX(buf)
		expect(net._graph._nodes.map(n => n.layer.constructor.name)).toContain('ConstLayer')

		const y = net.calc({})
		expect(y.sizes).toEqual([2])
		expect(y.at(0)).toBe('str')
		expect(y.at(1)).toBe('ing')
	})
})
