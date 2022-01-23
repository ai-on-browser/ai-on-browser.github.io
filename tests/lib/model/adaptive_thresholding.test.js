import Tensor from '../../../lib/util/tensor.js'
import AdaptiveThresholding from '../../../lib/model/adaptive_thresholding.js'

test('default', () => {
	const model = new AdaptiveThresholding()
	expect(model._method).toBe('mean')
})

test.each(['mean', 'gaussian', 'median', 'midgray'])('predict', method => {
	const model = new AdaptiveThresholding(method)
	const x = Tensor.random([10, 10]).toArray()

	const y = model.predict(x)
	expect(y).toHaveLength(10)
	expect(y[0]).toHaveLength(10)
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			expect(y[i][j] === 0 || y[i][j] === 255).toBeTruthy()
		}
	}
})
