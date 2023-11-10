import Matrix from '../../../lib/util/matrix.js'
import Percentile from '../../../lib/model/percentile.js'

test.each([undefined, 'data', 'normal'])('anomaly detection %s', dist => {
	const model = new Percentile(0.005, dist)
	const x = Matrix.randn(100, 2, 0, 0.2).toArray()
	x.push([10, 10])
	model.fit(x)
	const y = model.predict(x)
	let c = 0
	for (let i = 0; i < y.length - 1; i++) {
		if (y[i]) {
			c++
		}
	}
	expect(c / (y.length - 1)).toBeLessThan(0.1)
	expect(y[y.length - 1]).toBeTruthy()
})

test('anomaly detection 0', () => {
	const model = new Percentile(0)
	const x = Matrix.randn(100, 2, 0, 0.2).toArray()
	model.fit(x)
	const y = model.predict(x)
	for (let i = 0; i < y.length; i++) {
		expect(y[i]).toBeFalsy()
	}
})

test('anomaly detection 0.5', () => {
	const model = new Percentile(0.5)
	const x = Matrix.randn(100, 2, 0, 0.2).toArray()
	model.fit(x)
	const y = model.predict(x)
	for (let i = 0; i < y.length; i++) {
		expect(y[i]).toBeTruthy()
	}
})

test('no data', () => {
	const model = new Percentile(0.1)
	const x = Matrix.randn(100, 2, 0, 0.2).toArray()
	model.fit([])
	const y = model.predict(x)
	for (let i = 0; i < y.length; i++) {
		expect(y[i]).toBeFalsy()
	}
})

test('one data', () => {
	const model = new Percentile(0.1)
	const x = Matrix.randn(100, 2, 0, 0.2).toArray()
	model.fit([[0, 0]])
	const y = model.predict(x)
	for (let i = 0; i < y.length; i++) {
		expect(y[i]).toBeTruthy()
	}
	const y0 = model.predict([[0, 0]])
	expect(y0[0]).toBeFalsy()
})
