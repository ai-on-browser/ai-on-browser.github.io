import Layer from '../../../../../lib/model/nns/layer/base.js'

describe('layer', () => {
	describe('fromObject', () => {
		test('invalid name', () => {
			expect(() => Layer.fromObject({ type: 'dummy' })).toThrow('Invalid layer type: dummy')
		})
	})

	describe('registLayer', () => {
		test('duplicate name', () => {
			Layer.registLayer('___test_layer')
			expect(() => Layer.registLayer('___test_layer')).toThrow("Layer name '___test_layer' already exists")
		})
	})
})
