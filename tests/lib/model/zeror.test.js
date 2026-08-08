import ZeroR from '../../../lib/model/zeror.js'

test('predict', () => {
	const model = new ZeroR()
	const x = Array(20).fill(['a'])
	const t = [...Array(5).fill('a'), ...Array(10).fill('b'), ...Array(5).fill('c')]

	model.fit(x, t)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
	for (let i = 0; i < y.length; i++) {
		expect(y[i]).toBe('b')
	}
})
