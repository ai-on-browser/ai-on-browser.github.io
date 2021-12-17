import { Matrix } from '../../../lib/util/math.js'
import { GBDT, GBDTClassifier } from '../../../lib/model/gbdt.js'

test('classifier', () => {
	const model = new GBDTClassifier(10, 0.8, 0.5)
	const x = Matrix.randn(20, 10).toArray()
	const t = []
	for (let i = 0; i < 20; i++) {
		t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / 5))
	}
	model.init(x, t)
	for (let i = 0; i < 20; i++) {
		model.fit()
	}
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	let acc = 0
	for (let i = 0; i < t.length; i++) {
		if (y[i] === t[i]) {
			acc++
		}
	}
	expect(acc / y.length).toBeGreaterThan(0.95)
})

test('regression', () => {
	const model = new GBDT(10, 0.8, 0.5)
	const x = Matrix.random(20, 10, -2, 2).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [x[i][0] + x[i][1] + (Math.random() - 0.5) / 10]
	}
	model.init(x, t)
	for (let i = 0; i < 20; i++) {
		model.fit()
	}
	const y = model.predict(x)
	let err = 0
	for (let i = 0; i < t.length; i++) {
		err += (y[i] - t[i]) ** 2
	}
	expect(Math.sqrt(err / t.length)).toBeLessThan(0.5)
})
