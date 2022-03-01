import Tensor from '../../../lib/util/tensor.js'
import NiblackThresholding from '../../../lib/model/niblack.js'

test('predict', () => {
	const model = new NiblackThresholding()
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
