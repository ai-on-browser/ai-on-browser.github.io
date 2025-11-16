import Matrix from '../../../lib/util/matrix.js'
import RankNet from '../../../lib/model/ranknet.js'

import { correlation } from '../../../lib/evaluate/regression.js'

describe('learning to rank', () => {
	test.each([undefined, 'identity', 'sigmoid', 'tanh', 'relu', ['tanh']])('%s', { retry: 3 }, activation => {
		const model = new RankNet([10], activation)
		let x = Matrix.zeros(30, 2)
		for (let i = 0; i < x.rows / 10; i++) {
			x.set(i * 10, 0, Matrix.randn(10, 2, i * 5, 0.1))
		}
		x = x.toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 10)
		}

		const x1 = []
		const x2 = []
		const comp = []
		for (let i = 0; i < x.length; i++) {
			for (let j = Math.max(0, i - 5); j < Math.min(x.length, i + 5); j++) {
				if (i === j) continue
				x1.push(x[i])
				x2.push(x[j])
				comp.push(Math.sign(t[i] - t[j]))
			}
		}
		for (let i = 0; i < 100; i++) {
			model.fit(x1, x2, comp)
		}
		const y = model.predict(x)
		const corr = correlation(y, t)
		expect(corr).toBeGreaterThan(0.98)
	})
})
