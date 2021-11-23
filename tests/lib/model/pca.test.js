import { Matrix } from '../../../lib/util/math.js'
import { PCA, DualPCA, KernelPCA } from '../../../lib/model/pca.js'

test('pca', () => {
	const model = new PCA()
	const x = Matrix.randn(50, 5, 0, 0.2).concat(Matrix.randn(50, 5, 5, 0.2)).toArray()

	model.fit(x)
	const y = model.predict(x)
	const vari = Matrix.fromArray(y).variance(0)
	for (let i = 1; i < vari.cols; i++) {
		expect(vari.at(0, i)).toBeLessThanOrEqual(vari.at(0, i - 1))
	}
})

test('dual', () => {
	const model = new DualPCA()
	const x = Matrix.randn(20, 50, 0, 0.2).concat(Matrix.randn(20, 50, 5, 0.2)).toArray()

	model.fit(x)
	const y = model.predict(x, 10)
	const vari = Matrix.fromArray(y).variance(0)
	for (let i = 1; i < vari.cols; i++) {
		expect(vari.at(0, i)).toBeLessThanOrEqual(vari.at(0, i - 1))
	}
})

test.each([
	['gaussian', [1.0]],
	['polynomial', [2]],
])('kernel %s %p', (kernel, args) => {
	const model = new KernelPCA(kernel, args)
	const x = Matrix.randn(20, 5, 0, 0.2).concat(Matrix.randn(20, 5, 5, 0.2)).toArray()

	model.fit(x)
	const y = model.predict(x, 5)
	const vari = Matrix.fromArray(y).variance(0)
	for (let i = 1; i < vari.cols; i++) {
		expect(vari.at(0, i)).toBeLessThanOrEqual(vari.at(0, i - 1))
	}
})
