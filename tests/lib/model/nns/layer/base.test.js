import Layer from '../../../../../lib/model/nns/layer/base.js'

describe('layer', () => {
	describe('fromObject', () => {
		test('invalid name', () => {
			expect(() => Layer.fromObject({ type: 'dummy' })).toThrow('Invalid layer type: dummy')
		})
	})

	describe('registLayer', () => {
		test('duplicate name', () => {
			class TmpLayer extends Layer {}
			TmpLayer.registLayer('___test_layer')
			expect(() => TmpLayer.registLayer('___test_layer')).toThrow("Layer name '___test_layer' already exists")
		})
	})

	test('calc', () => {
		const layer = new Layer({})
		expect(() => layer.calc()).toThrow('Not impleneted')
	})

	test('grad', () => {
		const layer = new Layer({})
		expect(() => layer.grad()).toThrow('Not impleneted')
	})

	test('toObject', () => {
		const layer = new Layer({})
		const obj = layer.toObject()
		expect(obj).toEqual({})
	})
})
