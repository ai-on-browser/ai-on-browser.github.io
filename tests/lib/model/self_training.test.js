import Matrix from '../../../lib/util/matrix.js'
import SelfTraining from '../../../lib/model/self_training.js'
import { DecisionTreeClassifier } from '../../../lib/model/decision_tree.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test('semi-classifier', () => {
	const dt = new DecisionTreeClassifier('CART')
	const model = new SelfTraining(
		{
			fit(x, y) {
				dt.init(x, y)
				dt.fit()
			},
			predict(x) {
				const p = dt.predict_prob(x)
				return p.map(v => {
					let max_p = 0
					let max_k = null
					for (const k of v.keys()) {
						if (v.get(k) > max_p) {
							max_p = v.get(k)
							max_k = k
						}
					}
					return { category: max_k, score: max_p }
				})
			},
		},
		0.5
	)
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

test('semi-classifier not categorized', () => {
	const model = new SelfTraining(
		{
			fit() {},
			predict(x) {
				return x.map(() => ({ category: 0, score: 0 }))
			},
		},
		0.5
	)
	const x = [
		[0, 0],
		[1, 1],
	]
	const t = [0, null]
	model.init(x, t)
	for (let i = 0; i < 1; i++) {
		model.fit()
	}
	const y = model.predict(x)
	expect(y).toEqual([0, null])
})
