import { DecisionTreeClassifier, DecisionTreeRegression } from '../../../lib/model/decision_tree.js'
import { Matrix } from '../../../lib/util/math.js'

describe('classifier', () => {
	test('depth', () => {
		const model = new DecisionTreeClassifier()
		model.init([[1, 1], [0, 0]], [1, 0])
		expect(model.depth).toBe(1)
		model.fit()
		expect(model.depth).toBe(2)
	})

	test.each(['CART', 'ID3'])('method %s', method => {
		const model = new DecisionTreeClassifier(method)
		const x = Matrix.randn(20, 10).toArray()
		const t = []
		for (let i = 0; i < 20; i++) {
			t[i] = Math.floor(Math.random() * 5)
		}
		model.init(x, t)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		const y = model.predict(x)
		for (let i = 0; i < 4; i++) {
			expect(y[i]).toBe(t[i])
		}
	})

	test.todo('importance')
})

describe('regression', () => {
	test('depth', () => {
		const model = new DecisionTreeRegression()
		model.init([[1, 1], [0, 0]], [1, 0])
		expect(model.depth).toBe(1)
		model.fit()
		expect(model.depth).toBe(2)
	})

	test('fit', () => {
		const model = new DecisionTreeRegression()
		const x = Matrix.randn(20, 10).toArray()
		const t = Matrix.randn(20, 1).value
		model.init(x, t)
		for (let i = 0; i < 100; i++) {
			model.fit()
		}
		const y = model.predict(x)
		for (let i = 0; i < 4; i++) {
			expect(y[i]).toBe(t[i])
		}
	})

	test.todo('importance')
})
