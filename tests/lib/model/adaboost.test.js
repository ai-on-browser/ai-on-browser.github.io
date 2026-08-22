import { describe } from 'vitest'
import { accuracy } from '../../../lib/evaluate/classification.js'
import AdaBoost from '../../../lib/model/adaboost.js'
import Matrix from '../../../lib/util/matrix.js'

class DT {
	fit(x, y, w) {
		const n = x.length
		const d = x[0].length
		let best_score = Infinity
		this._f = -1
		this._t = 0
		for (let j = 0; j < d; j++) {
			const xj = x.map((v, i) => [v[j], i])
			xj.sort((a, b) => a[0] - b[0])

			const y1 = []
			const y2 = xj.map(v => y[v[1]])
			const w1 = []
			const w2 = xj.map(v => w[v[1]])
			for (let i = 0; i <= n; i++) {
				const [p1, s1] = this._score(y1, w1)
				const [p2, s2] = this._score(y2, w2)
				const score = (p1 * s1 + p2 * s2) / (p1 + p2)
				if (score < best_score) {
					best_score = score
					if (i === 0) {
						this._t = -Infinity
					} else if (i === n) {
						this._t = Infinity
					} else {
						this._t = (xj[i][0] + xj[i - 1][0]) / 2
					}
					this._f = j
				}
				if (i === n) {
					break
				}
				y1.push(y2.shift())
				w1.push(w2.shift())
			}
		}

		const cnt = [0, 0]
		for (let i = 0; i < n; i++) {
			if (x[i][this._f] < this._t) {
				cnt[y[i] < 0 ? 0 : 1]++
			}
		}
		this._c = cnt[0] < cnt[1] ? 1 : -1
	}

	_score(y1, w1) {
		const n = y1.length
		if (n === 0) {
			return [0, 1]
		}
		const cnt = [0, 0]
		for (let i = 0; i < n; i++) {
			cnt[y1[i] > 0 ? 1 : 0] += w1[i]
		}
		const ws = cnt.reduce((s, v) => s + v, 0)
		return [ws, cnt.reduce((s, v) => s - (v / ws) ** 2, 1)]
	}

	predict(x) {
		return x.map(v => (v[this._f] < this._t ? this._c : -this._c))
	}
}

describe('classification', () => {
	test('fit', { retry: 3 }, () => {
		const model = new AdaBoost(() => new DT())
		const x = Matrix.concat(Matrix.randn(50, 2), Matrix.randn(50, 2, 2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50) * 2 - 1
		}
		model.init(x, t)
		for (let i = 0; i < 10; i++) {
			model.fit()
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.8)
	})

	test('fit perfect', () => {
		const model = new AdaBoost(() => new DT())
		const x = [
			[0, 0],
			[0, 0.1],
			[1, 1],
			[1, 1.1],
		]
		const t = [-1, -1, 1, 1]
		model.init(x, t)
		model.fit()
		const y = model.predict(x)
		expect(y).toEqual([-1, -1, 1, 1])
	})
})
