import {
	davisBouldinIndex,
	dunnIndex,
	silhouetteCoefficient,
	purity,
	randIndex,
	diceIndex,
	jaccardIndex,
	fowlkesMallowsIndex,
} from '../../../lib/evaluate/clustering.js'

describe('davisBouldinIndex', () => {
	test('definition', () => {
		const data = []
		const y = []
		const n = 1000
		const dim = 3
		const count = [0, 0]
		const center = [Array(dim).fill(0), Array(dim).fill(0)]
		for (let i = 0; i < n; i++) {
			const ai = Math.floor(Math.random() * 2)
			y.push(ai)
			count[ai]++
			data[i] = []
			for (let d = 0; d < dim; d++) {
				data[i][d] = Math.random()
				center[ai][d] += data[i][d]
			}
		}
		const s = [0, 0]
		for (let k = 0; k < 2; k++) {
			center[k] = center[k].map(v => v / count[k])
			for (let i = 0; i < n; i++) {
				if (y[i] !== k) {
					continue
				}
				s[k] += Math.sqrt(data[i].reduce((s, v, d) => s + (v - center[k][d]) ** 2, 0))
			}
			s[k] /= count[k]
		}
		const m01 = Math.sqrt(center[0].reduce((s, v, d) => s + (v - center[1][d]) ** 2, 0))

		const dbi = davisBouldinIndex(data, y)
		expect(dbi).toBe((s[0] + s[1]) / m01)
	})
})

describe('dunnIndex', () => {
	describe('definition', () => {
		test('intra=max, inter=centroid', () => {
			const data = []
			const y = []
			const n = 1000
			const dim = 3
			const count = [0, 0]
			const center = [Array(dim).fill(0), Array(dim).fill(0)]
			for (let i = 0; i < n; i++) {
				const ai = Math.floor(Math.random() * 2)
				y.push(ai)
				count[ai]++
				data[i] = []
				for (let d = 0; d < dim; d++) {
					data[i][d] = Math.random()
					center[ai][d] += data[i][d]
				}
			}

			const d = [0, 0]
			for (let k = 0; k < 2; k++) {
				center[k] = center[k].map(v => v / count[k])
				for (let i = 0; i < n; i++) {
					if (y[i] !== k) {
						continue
					}
					for (let j = 0; j < n; j++) {
						if (y[j] !== k) {
							continue
						}
						const dij = Math.sqrt(data[i].reduce((s, v, d) => s + (v - data[j][d]) ** 2, 0))
						if (d[k] < dij) {
							d[k] = dij
						}
					}
				}
			}
			const dij = Math.sqrt(center[0].reduce((s, v, d) => s + (v - center[1][d]) ** 2, 0))

			const di = dunnIndex(data, y)
			expect(di).toBe(dij / Math.max(d[0], d[1]))
		})

		test('intra=mean, inter=centroid', () => {
			const data = []
			const y = []
			const n = 1000
			const dim = 3
			const count = [0, 0]
			const center = [Array(dim).fill(0), Array(dim).fill(0)]
			for (let i = 0; i < n; i++) {
				const ai = Math.floor(Math.random() * 2)
				y.push(ai)
				count[ai]++
				data[i] = []
				for (let d = 0; d < dim; d++) {
					data[i][d] = Math.random()
					center[ai][d] += data[i][d]
				}
			}

			const d = [0, 0]
			for (let k = 0; k < 2; k++) {
				center[k] = center[k].map(v => v / count[k])
				for (let i = 0; i < n; i++) {
					if (y[i] !== k) {
						continue
					}
					for (let j = 0; j < n; j++) {
						if (i === j || y[j] !== k) {
							continue
						}
						d[k] += Math.sqrt(data[i].reduce((s, v, d) => s + (v - data[j][d]) ** 2, 0))
					}
				}
				d[k] *= 2 / (count[k] * (count[k] - 1))
			}
			const dij = Math.sqrt(center[0].reduce((s, v, d) => s + (v - center[1][d]) ** 2, 0))

			const di = dunnIndex(data, y, 'mean')
			expect(di).toBeCloseTo(dij / Math.max(d[0], d[1]))
		})

		test('intra=centroid, inter=centroid', () => {
			const data = []
			const y = []
			const n = 1000
			const dim = 3
			const count = [0, 0]
			const center = [Array(dim).fill(0), Array(dim).fill(0)]
			for (let i = 0; i < n; i++) {
				const ai = Math.floor(Math.random() * 2)
				y.push(ai)
				count[ai]++
				data[i] = []
				for (let d = 0; d < dim; d++) {
					data[i][d] = Math.random()
					center[ai][d] += data[i][d]
				}
			}

			const d = [0, 0]
			for (let k = 0; k < 2; k++) {
				center[k] = center[k].map(v => v / count[k])
				for (let i = 0; i < n; i++) {
					if (y[i] !== k) {
						continue
					}
					d[k] += Math.sqrt(data[i].reduce((s, v, d) => s + (v - center[k][d]) ** 2, 0))
				}
				d[k] /= count[k]
			}
			const dij = Math.sqrt(center[0].reduce((s, v, d) => s + (v - center[1][d]) ** 2, 0))

			const di = dunnIndex(data, y, 'centroid')
			expect(di).toBe(dij / Math.max(d[0], d[1]))
		})
	})
})

describe('silhouetteCoefficient', () => {
	test('definition', () => {
		const data = []
		const y = []
		const n = 1000
		const dim = 3
		const d = []
		for (let i = 0; i < n; i++) {
			const ai = Math.floor(Math.random() * 2)
			y.push(ai)
			data[i] = []
			for (let d = 0; d < dim; d++) {
				data[i][d] = Math.random()
			}

			d[i] = []
			for (let j = 0; j < i; j++) {
				d[i][j] = d[j][i] = Math.sqrt(data[i].reduce((s, v, m) => s + (v - data[j][m]) ** 2, 0))
			}
		}

		const sc = silhouetteCoefficient(data, y)
		expect(sc).toHaveLength(data.length)
		for (let i = 0; i < n; i++) {
			let a = 0
			let ca = 0
			for (let j = 0; j < n; j++) {
				if (i === j || y[i] !== y[j]) {
					continue
				}
				a += d[i][j]
				ca++
			}
			a /= ca

			let b = 0
			let cb = 0
			for (let j = 0; j < n; j++) {
				if (y[i] === y[j]) {
					continue
				}
				b += d[i][j]
				cb++
			}
			b /= cb
			const s = (b - a) / Math.max(a, b)

			expect(sc[i]).toBe(s)
		}
	})
})

describe('purity', () => {
	test('definition', () => {
		const a = []
		const b = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			const ai = Math.floor(Math.random() * 2)
			const bi = Math.floor(Math.random() * 2)
			a.push(ai)
			b.push(bi)
		}
		let p = 0
		for (let k = 0; k < 2; k++) {
			let c = [0, 0]
			for (let i = 0; i < n; i++) {
				if (a[i] !== k) {
					continue
				}
				c[b[i]]++
			}
			p += Math.max(c[0], c[1])
		}
		const pu = purity(a, b)
		expect(pu).toBe(p / n)
	})

	test('best', () => {
		const a = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			a.push(Math.floor(Math.random() * 3))
		}
		const pu = purity(a, a)
		expect(pu).toBe(1)
	})
})

describe('randIndex', () => {
	test('definition', () => {
		const a = []
		const b = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			const ai = Math.floor(Math.random() * 2)
			const bi = Math.floor(Math.random() * 2)
			a.push(ai)
			b.push(bi)
		}
		let s = 0
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < i; j++) {
				if ((a[i] === a[j] && b[i] === b[j]) || (a[i] !== a[j] && b[i] !== b[j])) {
					s++
				}
			}
		}
		const ri = randIndex(a, b)
		expect(ri).toBe(s / ((n * (n - 1)) / 2))
	})

	test('best', () => {
		const a = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			a.push(Math.floor(Math.random() * 3))
		}
		const ri = randIndex(a, a)
		expect(ri).toBe(1)
	})
})

describe('diceIndex', () => {
	describe('definition', () => {
		test('default', () => {
			const a = []
			const b = []
			const n = 1000
			for (let i = 0; i < n; i++) {
				const ai = Math.floor(Math.random() * 2)
				const bi = Math.floor(Math.random() * 2)
				a.push(ai)
				b.push(bi)
			}
			let tp = 0
			let fp = 0
			let fn = 0
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < i; j++) {
					if (a[i] === a[j] && b[i] === b[j]) {
						tp++
					} else if (a[i] === a[j] && b[i] !== b[j]) {
						fp++
					} else if (a[i] !== a[j] && b[i] === b[j]) {
						fn++
					}
				}
			}
			const p = tp / (tp + fp)
			const r = tp / (tp + fn)
			const fs = diceIndex(a, b)
			expect(fs).toBeCloseTo((2 * (p * r)) / (p + r))
		})
	})

	test('best', () => {
		const a = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			a.push(Math.floor(Math.random() * 3))
		}
		const fs = diceIndex(a, a)
		expect(fs).toBe(1)
	})
})

describe('jaccardIndex', () => {
	test('definition', () => {
		const a = []
		const b = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			const ai = Math.floor(Math.random() * 2)
			const bi = Math.floor(Math.random() * 2)
			a.push(ai)
			b.push(bi)
		}
		let tp = 0
		let fp = 0
		let fn = 0
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < i; j++) {
				if (a[i] === a[j] && b[i] === b[j]) {
					tp++
				} else if (a[i] === a[j] && b[i] !== b[j]) {
					fp++
				} else if (a[i] !== a[j] && b[i] === b[j]) {
					fn++
				}
			}
		}
		const ji = jaccardIndex(a, b)
		expect(ji).toBe(tp / (tp + fp + fn))
	})

	test('best', () => {
		const a = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			a.push(Math.floor(Math.random() * 3))
		}
		const ji = jaccardIndex(a, a)
		expect(ji).toBe(1)
	})
})

describe('fowlkesMallowsIndex', () => {
	test('definition', () => {
		const a = []
		const b = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			const ai = Math.floor(Math.random() * 2)
			const bi = Math.floor(Math.random() * 2)
			a.push(ai)
			b.push(bi)
		}
		let tp = 0
		let fp = 0
		let fn = 0
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < i; j++) {
				if (a[i] === a[j] && b[i] === b[j]) {
					tp++
				} else if (a[i] === a[j] && b[i] !== b[j]) {
					fp++
				} else if (a[i] !== a[j] && b[i] === b[j]) {
					fn++
				}
			}
		}
		const fmi = fowlkesMallowsIndex(a, b)
		expect(fmi).toBeCloseTo(Math.sqrt((tp / (tp + fp)) * (tp / (tp + fn))))
	})

	test('best', () => {
		const a = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			a.push(Math.floor(Math.random() * 3))
		}
		const fmi = fowlkesMallowsIndex(a, a)
		expect(fmi).toBe(1)
	})
})
