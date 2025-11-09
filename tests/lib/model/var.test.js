import VAR from '../../../lib/model/var.js'

test('sin', { retry: 3 }, () => {
	const model = new VAR(10)
	const x = []
	for (let i = 0; i < 100; i++) {
		x[i] = [Math.sin(i / 10) + (Math.random() - 0.5) / 100]
	}

	model.fit(x)
	const future = model.predict(x, 50)
	expect(future).toHaveLength(50)
	for (let i = 0; i < 50; i++) {
		expect(future[i][0]).toBeCloseTo(Math.sin(10 + i / 10), 0)
	}
})
