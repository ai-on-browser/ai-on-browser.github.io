import Matrix from '../../../lib/util/matrix.js'
import CoTraining from '../../../lib/model/co_training.js'
import { DecisionTreeClassifier } from '../../../lib/model/decision_tree.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test('semi-classifier', () => {
	const dt1 = new DecisionTreeClassifier('CART')
	const dt2 = new DecisionTreeClassifier('CART')
	const model = new CoTraining(
		{
			fit(x, y) {
				dt1.init(
					x.map(v => [v[0]]),
					y
				)
				dt1.fit()
			},
			predict(x) {
				const p = dt1.predict_prob(x.map(v => [v[0]]))
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
			threshold: 0.5,
		},
		{
			fit(x, y) {
				dt2.init(
					x.map(v => [v[1]]),
					y
				)
				dt2.fit()
			},
			predict(x) {
				const p = dt2.predict_prob(x.map(v => [v[1]]))
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
			threshold: 0.5,
		}
	)
	const x = Matrix.concat(Matrix.randn(50, 2, [0, 5], 0.2), Matrix.randn(50, 2, [5, 0], 0.2)).toArray()
	const t = []
	const t_org = []
	for (let i = 0; i < x.length; i++) {
		t_org[i] = t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
		if (Math.random() < 0.5) {
			t[i] = null
		}
	}
	model.init(x, t)
	for (let i = 0; i < 50; i++) {
		model.fit()
	}
	const y = model.predict(x)
	const acc = accuracy(y, t_org)
	expect(acc).toBeGreaterThan(0.95)
})
