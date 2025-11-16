import ARMA from '../../../lib/model/arma.js'

test('linear', { retry: 5 }, () => {
	const model = new ARMA(5, 2)
	const x = []
	for (let i = 0; i < 100; i++) {
		x[i] = i / 10 + (Math.random() - 0.5) / 100
	}

	for (let i = 0; i < 100; i++) {
		model.fit(x)
	}
	const future = model.predict(x, 20)
	expect(future).toHaveLength(20)
	for (let i = 0; i < 20; i++) {
		expect(future[i]).toBeCloseTo(10 + i / 10, 0)
	}
})

test('sin', { retry: 5 }, () => {
	const model = new ARMA(15, 2)
	const x = []
	for (let i = 0; i < 100; i++) {
		x[i] = Math.sin(i / 10) + (Math.random() - 0.5) / 100
	}

	for (let i = 0; i < 100; i++) {
		model.fit(x)
	}
	const future = model.predict(x, 50)
	expect(future).toHaveLength(50)
	for (let i = 0; i < 50; i++) {
		expect(future[i]).toBeCloseTo(Math.sin(10 + i / 10), 1)
	}
})

test('const', () => {
	const model = new ARMA(5, 2)
	const x = Array(100).fill(0)

	for (let i = 0; i < 1; i++) {
		model.fit(x)
	}
	const future = model.predict(x, 20)
	expect(future).toHaveLength(20)
	for (let i = 0; i < 20; i++) {
		expect(future[i]).toBeCloseTo(0)
	}
})
