import { Tensor } from '../../../lib/util/math.js'
import AdaptiveThresholding from '../../../lib/model/adaptive_thresholding.js'

test('default', () => {
	const model = new AdaptiveThresholding()
	expect(model._method).toBe('mean')
})

test.each(['mean', 'gaussian', 'median', 'midgray'])('predict', method => {
	const model = new AdaptiveThresholding(method)
	const x = Tensor.random([10, 10, 3]).toArray()

	const y = model.predict(x)
	expect(y).toHaveLength(10)
	expect(y[0]).toHaveLength(10)
	expect(y[0][0]).toHaveLength(3)
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			for (let k = 0; k < 3; k++) {
				expect(y[i][j][k] === 0 || y[i][j][k] === 255).toBeTruthy()
			}
		}
	}
})
