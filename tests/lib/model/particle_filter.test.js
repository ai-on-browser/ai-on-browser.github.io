import { rmse } from '../../../lib/evaluate/regression.js'
import ParticleFilter from '../../../lib/model/particle_filter.js'

test('smoothing', { timeout: 10000 }, () => {
	const x = []
	const t = []
	for (let i = 0; i < 100; i++) {
		x[i] = [Math.sin(i / 20) + (Math.random() - 0.5) / 2]
		t[i] = [Math.sin(i / 20)]
	}
	const model = new ParticleFilter()
	const y = model.fit(x)
	y.length = y.length - 1
	expect(y).toHaveLength(t.length)
	const err = rmse(y, t)[0]
	expect(err).toBeLessThan(rmse(x, t)[0])
})
