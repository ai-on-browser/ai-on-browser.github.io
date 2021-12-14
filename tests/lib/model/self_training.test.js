import { Matrix } from '../../../lib/util/math.js'
import SelfTraining from '../../../lib/model/self_training.js'
import { DecisionTreeClassifier } from '../../../lib/model/decision_tree.js'

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
					let max_k = -1
					for (const k of v.keys()) {
						if (v.get(k) > max_p) {
							max_p = v.get(k)
							max_k = k
						}
					}
					return [max_k, max_p]
				})
			},
		},
		0.5
	)
	const x = Matrix.randn(50, 2, 0, 0.2).concat(Matrix.randn(50, 2, 5, 0.2)).toArray()
	const t = []
	const t_org = []
	for (let i = 0; i < x.length; i++) {
		t_org[i] = t[i] = Math.floor(i / 50) * 2 - 1
		if (Math.random() < 0.5) {
			t[i] = null
		}
	}
	model.init(x, t)
	for (let i = 0; i < 20; i++) {
		model.fit()
	}
	const y = model.predict(x)
	let acc = 0
	for (let i = 0; i < t.length; i++) {
		if (y[i] === t_org[i]) {
			acc++
		}
	}
	expect(acc / y.length).toBeGreaterThan(0.95)
})
