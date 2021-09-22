import ADALINE from '../../../lib/model/adaline.js'

test('default', () => {
	const model = new ADALINE(0.1)
    expect(model._r).toBe(0.1)
})

test('fit', () => {
	const model = new ADALINE(0.1)
    const x = [[1, 1], [1, 0], [0, 1], [0, 0]]
    const t = [[1], [1], [-1], [-1]]
    model.init(x, t)
    for (let i = 0; i < 1000; i++) {
        model.fit()
    }
    const y = model.predict(x)
    for (let i = 0; i < 4; i++) {
        expect(y[i]).toBeCloseTo(t[i][0])
    }
})
