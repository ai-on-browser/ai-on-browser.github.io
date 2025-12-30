import { accuracy, cohensKappa, fScore, precision, recall } from '../../../lib/evaluate/classification.js'

describe('accuracy', () => {
	test('definition two classes', () => {
		const a = []
		const b = []
		const n = 1000
		let same = 0
		for (let i = 0; i < n; i++) {
			const ai = Math.floor(Math.random() * 2)
			const bi = Math.floor(Math.random() * 2)
			a.push(ai)
			b.push(bi)
			if (ai === bi) {
				same++
			}
		}
		const acc = accuracy(a, b)
		expect(acc).toBe(same / n)
	})

	test('best', () => {
		const a = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			a.push(Math.floor(Math.random() * 3))
		}
		const acc = accuracy(a, a)
		expect(acc).toBe(1)
	})

	test('worst', () => {
		const a = []
		const b = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			const v = Math.floor(Math.random() * 3)
			a.push(v)
			b.push((v + 1) % 3)
		}
		const acc = accuracy(a, b)
		expect(acc).toBe(0)
	})
})

describe('precision', () => {
	test('definition two classes', () => {
		const a = []
		const b = []
		const n = 1000
		let tp1 = 0
		let fp1 = 0
		let tp2 = 0
		let fp2 = 0
		for (let i = 0; i < n; i++) {
			const ai = Math.floor(Math.random() * 2)
			const bi = Math.floor(Math.random() * 2)
			a.push(ai)
			b.push(bi)
			if (ai === bi) {
				if (ai === 0) {
					tp1++
				} else {
					tp2++
				}
			} else {
				if (ai === 0) {
					fp1++
				} else {
					fp2++
				}
			}
		}
		const pre = precision(a, b)
		expect(pre).toBe((tp1 / (tp1 + fp1) + tp2 / (tp2 + fp2)) / 2)
	})

	test('best', () => {
		const a = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			a.push(Math.floor(Math.random() * 3))
		}
		const acc = precision(a, a)
		expect(acc).toBe(1)
	})

	test('worst', () => {
		const a = []
		const b = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			const v = Math.floor(Math.random() * 3)
			a.push(v)
			b.push((v + 1) % 3)
		}
		const acc = precision(a, b)
		expect(acc).toBe(0)
	})
})

describe('recall', () => {
	test('definition two classes', () => {
		const a = []
		const b = []
		const n = 1000
		let tp1 = 0
		let fn1 = 0
		let tp2 = 0
		let fn2 = 0
		for (let i = 0; i < n; i++) {
			const ai = Math.floor(Math.random() * 2)
			const bi = Math.floor(Math.random() * 2)
			a.push(ai)
			b.push(bi)
			if (ai === bi) {
				if (ai === 0) {
					tp1++
				} else {
					tp2++
				}
			} else {
				if (ai === 0) {
					fn2++
				} else {
					fn1++
				}
			}
		}
		const rec = recall(a, b)
		expect(rec).toBe((tp1 / (tp1 + fn1) + tp2 / (tp2 + fn2)) / 2)
	})

	test('best', () => {
		const a = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			a.push(Math.floor(Math.random() * 3))
		}
		const acc = recall(a, a)
		expect(acc).toBe(1)
	})

	test('worst', () => {
		const a = []
		const b = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			const v = Math.floor(Math.random() * 3)
			a.push(v)
			b.push((v + 1) % 3)
		}
		const acc = recall(a, b)
		expect(acc).toBe(0)
	})
})

describe('fScore', () => {
	test('definition two classes', () => {
		const a = []
		const b = []
		const n = 1000
		let tp1 = 0
		let fp1 = 0
		let fn1 = 0
		let tp2 = 0
		let fp2 = 0
		let fn2 = 0
		for (let i = 0; i < n; i++) {
			const ai = Math.floor(Math.random() * 2)
			const bi = Math.floor(Math.random() * 2)
			a.push(ai)
			b.push(bi)
			if (ai === bi) {
				if (ai === 0) {
					tp1++
				} else {
					tp2++
				}
			} else {
				if (ai === 0) {
					fn2++
					fp1++
				} else {
					fn1++
					fp2++
				}
			}
		}
		const fs = fScore(a, b)
		expect(fs).toBe(((2 * tp1) / (2 * tp1 + fp1 + fn1) + (2 * tp2) / (2 * tp2 + fp2 + fn2)) / 2)
	})

	test('best', () => {
		const a = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			a.push(Math.floor(Math.random() * 3))
		}
		const acc = fScore(a, a)
		expect(acc).toBe(1)
	})

	test('worst', () => {
		const a = []
		const b = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			const v = Math.floor(Math.random() * 3)
			a.push(v)
			b.push((v + 1) % 3)
		}
		const acc = fScore(a, b)
		expect(acc).toBe(0)
	})
})

describe('cohensKappa', () => {
	test('definition two classes', () => {
		const a = []
		const b = []
		const n = 1000
		let c = 0
		for (let i = 0; i < n; i++) {
			const ai = Math.floor(Math.random() * 2)
			const bi = Math.floor(Math.random() * 2)
			a.push(ai)
			b.push(bi)
			if (ai === bi) {
				c++
			}
		}
		const p0 = c / n
		const pe =
			(a.reduce((s, v) => s + (v === 0 ? 1 : 0), 0) * b.reduce((s, v) => s + (v === 0 ? 1 : 0), 0) +
				a.reduce((s, v) => s + (v === 1 ? 1 : 0), 0) * b.reduce((s, v) => s + (v === 1 ? 1 : 0), 0)) /
			n ** 2
		const ck = cohensKappa(a, b)
		expect(ck).toBe((p0 - pe) / (1 - pe))
	})

	test('best', () => {
		const a = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			a.push(Math.floor(Math.random() * 3))
		}
		const acc = cohensKappa(a, a)
		expect(acc).toBe(1)
	})

	test('worst', () => {
		const a = []
		const b = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			const v = Math.floor(Math.random() * 3)
			a.push(v)
			b.push((v + 1) % 3)
		}
		const acc = cohensKappa(a, b)

		const pe =
			(a.reduce((s, v) => s + (v === 0 ? 1 : 0), 0) * b.reduce((s, v) => s + (v === 0 ? 1 : 0), 0) +
				a.reduce((s, v) => s + (v === 1 ? 1 : 0), 0) * b.reduce((s, v) => s + (v === 1 ? 1 : 0), 0) +
				a.reduce((s, v) => s + (v === 2 ? 1 : 0), 0) * b.reduce((s, v) => s + (v === 2 ? 1 : 0), 0)) /
			n ** 2
		expect(acc).toBe(-pe / (1 - pe))
	})
})
