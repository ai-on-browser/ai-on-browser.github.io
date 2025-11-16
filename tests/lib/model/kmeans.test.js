import Matrix from '../../../lib/util/matrix.js'
import { KMeans, KMeanspp, KMedoids, KMedians, SemiSupervisedKMeansModel } from '../../../lib/model/kmeans.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'
import { accuracy } from '../../../lib/evaluate/classification.js'

describe.each([KMeans, KMeanspp, KMedoids, KMedians])('%j', methodCls => {
	test.each([50, 51])('predict %j', n => {
		const model = new methodCls()
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

		model.add(x)
		model.add(x)
		for (let i = 0; i < 20; i++) {
			const d = model.fit(x)
			if (d === 0) {
				break
			}
		}
		expect(model.size).toBe(2)
		expect(model.centroids).toHaveLength(2)
		const y = model.predict(x)
		expect(y).toHaveLength(x.length)

		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}
		const ri = randIndex(y, t)
		expect(ri).toBeGreaterThan(0.9)
	})

	test('fit before init', () => {
		const model = new methodCls()
		const x = Matrix.randn(50, 2, 0, 0.1).toArray()
		const d = model.fit(x)
		expect(d).toBe(0)
	})

	test('predict before fit', () => {
		const model = new methodCls()
		const x = Matrix.randn(50, 2, 0, 0.1).toArray()
		expect(() => model.predict(x)).toThrow('Call fit before predict.')
	})
})

describe('semi-classifier', () => {
	test('predict', () => {
		const model = new SemiSupervisedKMeansModel()
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		const t_org = []
		for (let i = 0; i < x.length; i++) {
			t_org[i] = t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
			if (Math.random() < 0.5) {
				t[i] = null
			}
		}
		model.init(x, t)
		for (let i = 0; i < 20; i++) {
			model.fit(x, t)
		}
		const categories = model.categories.concat()
		categories.sort()
		expect(categories).toEqual(['a', 'b'])
		const y = model.predict(x)
		const acc = accuracy(y, t_org)
		expect(acc).toBeGreaterThan(0.95)
	})

	test('fit before init', () => {
		const model = new SemiSupervisedKMeansModel()
		const x = Matrix.randn(50, 2, 0, 0.1).toArray()
		const d = model.fit(x, Array(50).fill(0))
		expect(d).toBe(0)
	})

	test('predict before fit', () => {
		const model = new SemiSupervisedKMeansModel()
		const x = Matrix.randn(50, 2, 0, 0.1).toArray()
		expect(() => model.predict(x)).toThrow('Call fit before predict.')
	})
})
