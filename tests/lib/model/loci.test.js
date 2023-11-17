import Matrix from '../../../lib/util/matrix.js'
import LOCI from '../../../lib/model/loci.js'

test.each([undefined, 0.5])('anomaly detection alpha: %p', alpha => {
	const model = new LOCI(alpha)
	const x = Matrix.randn(100, 2, 0, 0.2).toArray()
	x.push([10, 10])
	const y = model.predict(x)
	let c = 0
	for (let i = 0; i < y.length - 1; i++) {
		if (y[i]) {
			c++
		}
	}
	expect(c / (y.length - 1)).toBeLessThan(0.2)
	expect(y[y.length - 1]).toBe(true)
})
