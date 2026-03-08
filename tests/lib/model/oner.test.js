import { accuracy } from '../../../lib/evaluate/classification.js'
import OneR from '../../../lib/model/oner.js'

test('predict', () => {
	const model = new OneR()
	const n = 50
	const x = []
	for (let i = 0; i < n; i++) {
		const xi = []
		for (let k = 0; k < 5; k++) {
			const r = Math.floor(Math.random() * 10)
			xi[k] = String.fromCharCode('a'.charCodeAt(0) + r)
		}
		x.push(xi)
	}
	for (let i = 0; i < n; i++) {
		const xi = []
		for (let k = 0; k < 5; k++) {
			const r = Math.floor(Math.random() * 10 + 9)
			xi[k] = String.fromCharCode('a'.charCodeAt(0) + r)
		}
		x.push(xi)
	}
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 50))
	}

	model.fit(x, t)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	const acc = accuracy(y, t)
	expect(acc).toBeGreaterThan(0.9)
})
