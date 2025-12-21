import AdaptiveThresholding from '../../../lib/model/adaptive_thresholding.js'
import Tensor from '../../../lib/util/tensor.js'

test('default', () => {
	const model = new AdaptiveThresholding()
	expect(model._method).toBe('mean')
})

describe.each([undefined, 'mean', 'gaussian', 'median', 'midgray'])('predict %j', method => {
	test.each([undefined, 0.2])('%j', c => {
		const model = new AdaptiveThresholding(method, undefined, c)
		const x = Tensor.random([10, 10]).toArray()

		const y = model.predict(x)
		expect(y).toHaveLength(10)
		expect(y[0]).toHaveLength(10)
		for (let i = 0; i < 10; i++) {
			for (let j = 0; j < 10; j++) {
				expect(y[i][j] === 0 || y[i][j] === 1).toBeTruthy()
			}
		}
	})
})
