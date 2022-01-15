import { Matrix } from '../../../lib/util/math.js'
import {
	KMeansModel,
	KMeans,
	KMeanspp,
	KMedoids,
	KMedians,
	SemiSupervisedKMeansModel,
} from '../../../lib/model/kmeans.js'

import { randIndex } from '../../../lib/evaluate/clustering.js'
import { accuracy } from '../../../lib/evaluate/classification.js'

test.each([undefined, KMeans, KMeanspp, KMedoids, KMedians])('predict %p', methodCls => {
	const model = new KMeansModel(methodCls ? new methodCls() : undefined)
	const n = 50
	const x = Matrix.randn(n, 2, 0, 0.1).concat(Matrix.randn(n, 2, 5, 0.1)).toArray()

	model.add(x)
	model.add(x)
	for (let i = 0; i < 20; i++) {
		const d = model.fit(x)
		if (d === 0) {
			break
		}
	}
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)

	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = Math.floor(i / n)
	}
	const ri = randIndex(y, t)
	expect(ri).toBeGreaterThan(0.9)
})

test('semi-classifier', () => {
	const model = new SemiSupervisedKMeansModel()
	const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
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
	const y = model.predict(x)
	const acc = accuracy(y, t_org)
	expect(acc).toBeGreaterThan(0.95)
})