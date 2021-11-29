import HoltWinters from '../../../lib/model/holt_winters.js'

test('linear', () => {
	const model = new HoltWinters(0.2, 0.9, 0.1, 2)
	const x = []
	for (let i = 0; i < 100; i++) {
		x[i] = [i / 10 + (Math.random() - 0.5) / 100]
	}

	model.fit(x)
	const future = model.predict(20)
	expect(future).toHaveLength(20)
	for (let i = 0; i < 20; i++) {
		expect(future[i][0]).toBeCloseTo(10 + i / 10, 1)
	}
})

test('sin', () => {
	const model = new HoltWinters(0, 0, 0.9, 66)
	const x = []
	for (let i = 0; i < 100; i++) {
		x[i] = [Math.sin(i / 10) + (Math.random() - 0.5) / 100]
	}

	model.fit(x)
	const future = model.predict(50)
	expect(future).toHaveLength(50)
	for (let i = 0; i < 50; i++) {
		expect(future[i][0]).toBeCloseTo(Math.sin(10 + i / 10), 0)
	}
})
