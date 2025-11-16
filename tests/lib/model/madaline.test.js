import Matrix from '../../../lib/util/matrix.js'
import MADALINE from '../../../lib/model/madaline.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

describe('rule 1', () => {
	test('fit', () => {
		const model = new MADALINE([5], 1, 0.01)
		const n = 20
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [Math.floor(i / n) * 2 - 1]
		}
		for (let i = 0; i < 100; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const acc = accuracy(
			y.map(v => v[0]),
			t.map(v => v[0])
		)
		expect(acc).toBeGreaterThan(0.95)
	})

	test('fit array y', () => {
		const model = new MADALINE([5], 1, 0.01)
		const n = 20
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n) * 2 - 1
		}
		for (let i = 0; i < 100; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const acc = accuracy(
			y.map(v => v[0]),
			t
		)
		expect(acc).toBeGreaterThan(0.95)
	})

	test('much size', () => {
		expect(() => new MADALINE([2, 2], 1)).toThrow('When the rule is 1, only single layer is accepted.')
	})
})

describe.each([undefined, 2])('rule %j', rule => {
	test('fit', { retry: 3 }, () => {
		const model = new MADALINE([5, 4], rule, 0.01)
		const n = 20
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [Math.floor(i / n) * 2 - 1]
		}
		for (let i = 0; i < 100; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const acc = accuracy(
			y.map(v => v[0]),
			t.map(v => v[0])
		)
		expect(acc).toBeGreaterThan(0.95)
	})
})

describe('rule 3', () => {
	test('fit', { retry: 3 }, () => {
		const model = new MADALINE([5, 4], 3, 0.01)
		const n = 20
		const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = [Math.floor(i / n) * 2 - 1]
		}
		for (let i = 0; i < 100; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const acc = accuracy(
			y.map(v => v[0]),
			t.map(v => v[0])
		)
		expect(acc).toBeGreaterThan(0.9)
	})
})
