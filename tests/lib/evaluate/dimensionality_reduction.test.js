import { coRankingMatrix } from '../../../lib/evaluate/dimensionality_reduction.js'

describe('coRankingMatrix', () => {
	test('same', () => {
		const a = []
		const b = []
		const n = 100
		for (let i = 0; i < n; i++) {
			const ai = [Math.random(), Math.random()]
			a.push(ai)
			b.push(ai)
		}
		const rm = coRankingMatrix(a, b, 10, 10)
		expect(rm).toBe(1.1)
	})
})
