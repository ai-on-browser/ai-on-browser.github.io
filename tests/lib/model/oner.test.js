import { accuracy } from '../../../lib/evaluate/classification.js'
import OneR from '../../../lib/model/oner.js'

test('predict', () => {
	const model = new OneR()
	const n = 50
	const x = []
	const t = []
	for (let i = 0; i < n * 2; i++) {
		x[i] = []
		for (let k = 0; k < 5; k++) {
			const r = Math.floor(Math.random() * 10 + Math.floor(i / n) * 9)
			x[i][k] = String.fromCharCode('a'.charCodeAt(0) + r)
		}
		t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
	}

	model.fit(x, t)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.9)
})

test('predict unknown input', () => {
	const model = new OneR()
	const x = [['a']]
	const t = [1]

	model.fit(x, t)
	const y = model.predict([['b']])
	expect(y).toEqual([null])
})
