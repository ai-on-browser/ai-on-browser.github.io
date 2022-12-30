import Layer from '../../../../../lib/model/nns/layer/base.js'

describe('layer', () => {
	describe('fromObject', () => {
		test('invalid name', () => {
			expect(() => Layer.fromObject({ type: 'dummy' })).toThrow('Invalid layer type: dummy')
		})
	})

	describe('registLayer', () => {
		test('duplicate name', () => {
			expect(() => Layer.registLayer('loss')).toThrow("Layer name 'loss' already exists")
		})
	})
})
