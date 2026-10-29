import Relief from '../../../lib/model/relief.js'
import Matrix from '../../../lib/util/matrix.js'

describe('feature selection', () => {
	test('numeric', () => {
		const model = new Relief(20, 0.5)
		const n = 50
		const x = Matrix.concat(Matrix.randn(n, 5, 0, 0.2), Matrix.randn(n, 5, [0, 5, 0, 5, 0], 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}

		model.fit(x, t)
		const y = model.predict(x)
		expect(y[0]).toHaveLength(2)

		const slct = [1, 3]
		const idx = []
		for (let i = 0; i < y[0].length; i++) {
			for (let j = 0; j < slct.length; j++) {
				if (y[0][i] === x[0][slct[j]]) {
					idx[i] = slct[j]
				}
			}
			expect(idx[i]).toBeDefined()
		}

		for (let i = 0; i < x.length; i++) {
			for (let k = 0; k < idx.length; k++) {
				expect(y[i][k]).toBe(x[i][idx[k]])
			}
		}
	})

	test('discrete', { retry: 3 }, () => {
		const model = new Relief(20, 0.4)
		const n = 100
		const slct = [1, 3]
		const x = [['a', 'b', 'c', 'd', 'e']]
		for (let i = 1; i < n; i++) {
			const xi = []
			for (let k = 0; k < 5; k++) {
				xi[k] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(Math.random() * 5))
			}
			x.push(xi)
		}
		for (let i = 0; i < n; i++) {
			const xi = []
			for (let k = 0; k < 5; k++) {
				xi[k] = String.fromCharCode(
					'a'.charCodeAt(0) + Math.floor(Math.random() * 5 + (slct.includes(k) ? 5 : 0))
				)
			}
			x.push(xi)
		}
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / n)
		}

		model.fit(x, t)
		const y = model.predict(x)
		if (y[0].length !== 2) {
			console.log(model._w)
		}
		expect(y[0]).toHaveLength(2)

		const idx = []
		for (let i = 0; i < y[0].length; i++) {
			for (let j = 0; j < slct.length; j++) {
				if (y[0][i] === x[0][slct[j]]) {
					idx[i] = slct[j]
				}
			}
			expect(idx[i]).toBeDefined()
		}

		for (let i = 0; i < x.length; i++) {
			for (let k = 0; k < idx.length; k++) {
				expect(y[i][k]).toBe(x[i][idx[k]])
			}
		}
	})
})
