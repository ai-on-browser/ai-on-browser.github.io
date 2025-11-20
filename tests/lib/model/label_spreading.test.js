import Matrix from '../../../lib/util/matrix.js'
import LabelSpreading from '../../../lib/model/label_spreading.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test.each([
	[undefined, undefined],
	[0.5, { name: 'rbf', sigma: 0.2 }],
	[0.8, { name: 'knn', k: 10 }],
])('semi-classifier %j %j', (alpha, method) => {
	const model = new LabelSpreading(alpha, method)
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
		model.fit()
	}
	const y = model.predict(x)
	const acc = accuracy(y, t_org)
	expect(acc).toBeGreaterThan(0.95)
})

test('semi-classifier k=0', () => {
	const model = new LabelSpreading(0.5, { name: 'rbf', sigma: 0.1, k: 0 })
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
		model.fit()
	}
	const y = model.predict(x)
	const acc = accuracy(y, t_org)
	expect(acc).toBeGreaterThanOrEqual(0.5)
})
