import GAN from '../../../lib/model/gan.js'
import Matrix from '../../../lib/util/matrix.js'

test('sample', { retry: 10, timeout: 10000 }, () => {
	const model = new GAN(
		3,
		[{ type: 'full', out_size: 5, activation: 'tanh' }],
		[{ type: 'full', out_size: 5, activation: 'tanh' }],
		'adam',
		'sgd',
		null,
		''
	)
	const x = Matrix.randn(1000, 2, 2, 0.5).toArray()
	for (let i = 0; i < 100; i++) {
		model.fit(x, null, 1, 0.01, 0.01, 10)
		expect(model.epoch).toBe(i + 1)
	}

	const s = Matrix.fromArray(model.generate(10000))
	expect(s.mean()).toBeCloseTo(2, -0.5)

	const p = model.prob([
		[2, 2],
		[-5, -5],
	])
	expect(p[0][0]).toBeGreaterThan(p[1][0])
	expect(p[1][1]).toBeGreaterThan(p[0][1])
})

test('conditional', { retry: 10, timeout: 30000 }, () => {
	const model = new GAN(
		2,
		[{ type: 'full', out_size: 3, activation: 'tanh' }],
		[{ type: 'full', out_size: 3, activation: 'tanh' }],
		'adam',
		'sgd',
		2,
		'conditional'
	)
	const n = 1000
	const x = Matrix.concat(Matrix.randn(n, 1, 0, 0.2), Matrix.randn(n, 1, 5, 0.2)).toArray()
	const t = []
	for (let i = 0; i < x.length; i++) {
		t[i] = [Math.floor(i / n) + 1]
	}
	for (let i = 0; i < 200; i++) {
		model.fit(x, t, 1, 0.01, 0.5, 100)
		expect(model.epoch).toBe(i + 1)
	}

	const y = []
	for (let i = 0; i < 10000; i++) {
		y[i] = [Math.floor(i / 5000) + 1]
	}
	const s = Matrix.fromArray(model.generate(10000, y))
	expect(s.slice(0, 5000, 0).mean()).toBeCloseTo(0, -0.5)
	expect(s.slice(5000, 10000, 0).mean()).toBeCloseTo(5, -0.5)
})
