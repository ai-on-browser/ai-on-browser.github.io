import { correlation, mad, mae, mape, mse, msle, r2, rmse, rmsle, rmspe } from '../../../lib/evaluate/regression.js'

describe('mse', () => {
	describe('definition', () => {
		test('1d array', () => {
			const a = []
			const b = []
			const n = 1000
			let diff = 0
			for (let i = 0; i < n; i++) {
				const ai = Math.random()
				const bi = Math.random()
				a.push(ai)
				b.push(bi)
				diff += (ai - bi) ** 2
			}
			const err = mse(a, b)
			expect(err).toBe(diff / n)
		})

		test('2d array', () => {
			const a = []
			const b = []
			const d = 3
			const n = 1000
			const diff = Array(d).fill(0)
			for (let i = 0; i < n; i++) {
				a[i] = []
				b[i] = []
				for (let k = 0; k < d; k++) {
					const ai = Math.random()
					const bi = Math.random()
					a[i].push(ai)
					b[i].push(bi)
					diff[k] += (ai - bi) ** 2
				}
			}
			const err = mse(a, b)
			expect(err).toHaveLength(d)
			for (let k = 0; k < d; k++) {
				expect(err[k]).toBe(diff[k] / n)
			}
		})
	})

	test('best', () => {
		const a = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			a.push(Math.random())
		}
		const err = mse(a, a)
		expect(err).toBe(0)
	})
})

describe('rmse', () => {
	describe('definition', () => {
		test('1d array', () => {
			const a = []
			const b = []
			const n = 1000
			let diff = 0
			for (let i = 0; i < n; i++) {
				const ai = Math.random()
				const bi = Math.random()
				a.push(ai)
				b.push(bi)
				diff += (ai - bi) ** 2
			}
			const err = rmse(a, b)
			expect(err).toBe(Math.sqrt(diff / n))
		})

		test('2d array', () => {
			const a = []
			const b = []
			const d = 3
			const n = 1000
			const diff = Array(d).fill(0)
			for (let i = 0; i < n; i++) {
				a[i] = []
				b[i] = []
				for (let k = 0; k < d; k++) {
					const ai = Math.random()
					const bi = Math.random()
					a[i].push(ai)
					b[i].push(bi)
					diff[k] += (ai - bi) ** 2
				}
			}
			const err = rmse(a, b)
			expect(err).toHaveLength(d)
			for (let k = 0; k < d; k++) {
				expect(err[k]).toBe(Math.sqrt(diff[k] / n))
			}
		})
	})

	test('best', () => {
		const a = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			a.push(Math.random())
		}
		const err = rmse(a, a)
		expect(err).toBe(0)
	})
})

describe('mae', () => {
	describe('definition', () => {
		test('1d array', () => {
			const a = []
			const b = []
			const n = 1000
			let diff = 0
			for (let i = 0; i < n; i++) {
				const ai = Math.random()
				const bi = Math.random()
				a.push(ai)
				b.push(bi)
				diff += Math.abs(ai - bi)
			}
			const err = mae(a, b)
			expect(err).toBe(diff / n)
		})

		test('2d array', () => {
			const a = []
			const b = []
			const d = 3
			const n = 1000
			const diff = Array(d).fill(0)
			for (let i = 0; i < n; i++) {
				a[i] = []
				b[i] = []
				for (let k = 0; k < d; k++) {
					const ai = Math.random()
					const bi = Math.random()
					a[i].push(ai)
					b[i].push(bi)
					diff[k] += Math.abs(ai - bi)
				}
			}
			const err = mae(a, b)
			expect(err).toHaveLength(d)
			for (let k = 0; k < d; k++) {
				expect(err[k]).toBe(diff[k] / n)
			}
		})
	})

	test('best', () => {
		const a = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			a.push(Math.random())
		}
		const err = mae(a, a)
		expect(err).toBe(0)
	})
})

describe('mad', () => {
	describe('definition', () => {
		test('1d array even', () => {
			const a = []
			const b = []
			const n = 1000
			const diff = []
			for (let i = 0; i < n; i++) {
				const ai = Math.random()
				const bi = Math.random()
				a.push(ai)
				b.push(bi)
				diff[i] = Math.abs(ai - bi)
			}
			diff.sort((a, b) => a - b)
			const err = mad(a, b)
			expect(err).toBe((diff[diff.length / 2] + diff[diff.length / 2 - 1]) / 2)
		})

		test('1d array odd', () => {
			const a = []
			const b = []
			const n = 999
			const diff = []
			for (let i = 0; i < n; i++) {
				const ai = Math.random()
				const bi = Math.random()
				a.push(ai)
				b.push(bi)
				diff[i] = Math.abs(ai - bi)
			}
			diff.sort((a, b) => a - b)
			const err = mad(a, b)
			expect(err).toBe(diff[(diff.length - 1) / 2])
		})

		test('2d array even', () => {
			const a = []
			const b = []
			const d = 3
			const n = 1000
			const diff = Array.from({ length: d }, () => [])
			for (let i = 0; i < n; i++) {
				a[i] = []
				b[i] = []
				for (let k = 0; k < d; k++) {
					const ai = Math.random()
					const bi = Math.random()
					a[i].push(ai)
					b[i].push(bi)
					diff[k][i] = Math.abs(ai - bi)
				}
			}
			const err = mad(a, b)
			expect(err).toHaveLength(d)
			for (let k = 0; k < d; k++) {
				diff[k].sort((a, b) => a - b)
				expect(err[k]).toBe((diff[k][diff[k].length / 2] + diff[k][diff[k].length / 2 - 1]) / 2)
			}
		})

		test('2d array odd', () => {
			const a = []
			const b = []
			const d = 3
			const n = 999
			const diff = Array.from({ length: d }, () => [])
			for (let i = 0; i < n; i++) {
				a[i] = []
				b[i] = []
				for (let k = 0; k < d; k++) {
					const ai = Math.random()
					const bi = Math.random()
					a[i].push(ai)
					b[i].push(bi)
					diff[k][i] = Math.abs(ai - bi)
				}
			}
			const err = mad(a, b)
			expect(err).toHaveLength(d)
			for (let k = 0; k < d; k++) {
				diff[k].sort((a, b) => a - b)
				expect(err[k]).toBe(diff[k][(diff[k].length - 1) / 2])
			}
		})
	})

	test('best', () => {
		const a = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			a.push(Math.random())
		}
		const err = mad(a, a)
		expect(err).toBe(0)
	})
})

describe('rmspe', () => {
	describe('definition', () => {
		test('1d array', () => {
			const a = []
			const b = []
			const n = 1000
			let diff = 0
			for (let i = 0; i < n; i++) {
				const ai = Math.random()
				const bi = Math.random()
				a.push(ai)
				b.push(bi)
				diff += ((ai - bi) / bi) ** 2
			}
			const err = rmspe(a, b)
			expect(err).toBe(Math.sqrt(diff / n))
		})

		test('2d array', () => {
			const a = []
			const b = []
			const d = 3
			const n = 1000
			const diff = Array(d).fill(0)
			for (let i = 0; i < n; i++) {
				a[i] = []
				b[i] = []
				for (let k = 0; k < d; k++) {
					const ai = Math.random()
					const bi = Math.random()
					a[i].push(ai)
					b[i].push(bi)
					diff[k] += ((ai - bi) / bi) ** 2
				}
			}
			const err = rmspe(a, b)
			expect(err).toHaveLength(d)
			for (let k = 0; k < d; k++) {
				expect(err[k]).toBe(Math.sqrt(diff[k] / n))
			}
		})
	})

	test('best', () => {
		const a = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			a.push(Math.random())
		}
		const err = rmspe(a, a)
		expect(err).toBe(0)
	})
})

describe('mape', () => {
	describe('definition', () => {
		test('1d array', () => {
			const a = []
			const b = []
			const n = 1000
			let diff = 0
			for (let i = 0; i < n; i++) {
				const ai = Math.random()
				const bi = Math.random()
				a.push(ai)
				b.push(bi)
				diff += Math.abs((ai - bi) / bi)
			}
			const err = mape(a, b)
			expect(err).toBe(diff / n)
		})

		test('2d array', () => {
			const a = []
			const b = []
			const d = 3
			const n = 1000
			const diff = Array(d).fill(0)
			for (let i = 0; i < n; i++) {
				a[i] = []
				b[i] = []
				for (let k = 0; k < d; k++) {
					const ai = Math.random()
					const bi = Math.random()
					a[i].push(ai)
					b[i].push(bi)
					diff[k] += Math.abs((ai - bi) / bi)
				}
			}
			const err = mape(a, b)
			expect(err).toHaveLength(d)
			for (let k = 0; k < d; k++) {
				expect(err[k]).toBe(diff[k] / n)
			}
		})
	})

	test('best', () => {
		const a = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			a.push(Math.random())
		}
		const err = mape(a, a)
		expect(err).toBe(0)
	})
})

describe('msle', () => {
	describe('definition', () => {
		test('1d array', () => {
			const a = []
			const b = []
			const n = 1000
			let diff = 0
			for (let i = 0; i < n; i++) {
				const ai = Math.random()
				const bi = Math.random()
				a.push(ai)
				b.push(bi)
				diff += (Math.log(1 + ai) - Math.log(1 + bi)) ** 2
			}
			const err = msle(a, b)
			expect(err).toBe(diff / n)
		})

		test('2d array', () => {
			const a = []
			const b = []
			const d = 3
			const n = 1000
			const diff = Array(d).fill(0)
			for (let i = 0; i < n; i++) {
				a[i] = []
				b[i] = []
				for (let k = 0; k < d; k++) {
					const ai = Math.random()
					const bi = Math.random()
					a[i].push(ai)
					b[i].push(bi)
					diff[k] += (Math.log(1 + ai) - Math.log(1 + bi)) ** 2
				}
			}
			const err = msle(a, b)
			expect(err).toHaveLength(d)
			for (let k = 0; k < d; k++) {
				expect(err[k]).toBe(diff[k] / n)
			}
		})
	})

	test('best', () => {
		const a = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			a.push(Math.random())
		}
		const err = msle(a, a)
		expect(err).toBe(0)
	})
})

describe('rmsle', () => {
	describe('definition', () => {
		test('1d array', () => {
			const a = []
			const b = []
			const n = 1000
			let diff = 0
			for (let i = 0; i < n; i++) {
				const ai = Math.random()
				const bi = Math.random()
				a.push(ai)
				b.push(bi)
				diff += (Math.log(1 + ai) - Math.log(1 + bi)) ** 2
			}
			const err = rmsle(a, b)
			expect(err).toBe(Math.sqrt(diff / n))
		})

		test('2d array', () => {
			const a = []
			const b = []
			const d = 3
			const n = 1000
			const diff = Array(d).fill(0)
			for (let i = 0; i < n; i++) {
				a[i] = []
				b[i] = []
				for (let k = 0; k < d; k++) {
					const ai = Math.random()
					const bi = Math.random()
					a[i].push(ai)
					b[i].push(bi)
					diff[k] += (Math.log(1 + ai) - Math.log(1 + bi)) ** 2
				}
			}
			const err = rmsle(a, b)
			expect(err).toHaveLength(d)
			for (let k = 0; k < d; k++) {
				expect(err[k]).toBe(Math.sqrt(diff[k] / n))
			}
		})
	})

	test('best', () => {
		const a = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			a.push(Math.random())
		}
		const err = rmsle(a, a)
		expect(err).toBe(0)
	})
})

describe('r2', () => {
	describe('definition', () => {
		test('1d array', () => {
			const a = []
			const b = []
			const n = 1000
			for (let i = 0; i < n; i++) {
				a.push(Math.random())
				b.push(Math.random())
			}
			const mb = b.reduce((s, v) => s + v, 0) / n
			const sa = b.reduce((s, v, i) => s + (v - a[i]) ** 2, 0)
			const sb = b.reduce((s, v) => s + (v - mb) ** 2, 0)

			const cd = r2(a, b)
			expect(cd).toBe(1 - sa / sb)
		})

		test('2d array', () => {
			const a = []
			const b = []
			const d = 3
			const n = 1000
			for (let i = 0; i < n; i++) {
				a[i] = []
				b[i] = []
				for (let k = 0; k < d; k++) {
					a[i].push(Math.random())
					b[i].push(Math.random())
				}
			}

			const err = r2(a, b)
			expect(err).toHaveLength(d)
			for (let k = 0; k < d; k++) {
				const mb = b.reduce((s, v) => s + v[k], 0) / n
				const sa = b.reduce((s, v, i) => s + (v[k] - a[i][k]) ** 2, 0)
				const sb = b.reduce((s, v) => s + (v[k] - mb) ** 2, 0)
				expect(err[k]).toBe(1 - sa / sb)
			}
		})
	})

	test('best', () => {
		const a = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			a.push(Math.random())
		}
		const err = r2(a, a)
		expect(err).toBe(1)
	})

	test('baseline', () => {
		const b = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			b.push(Math.random())
		}
		const a = Array(n).fill(b.reduce((s, v) => s + v, 0) / n)
		const err = r2(a, b)
		expect(err).toBe(0)
	})
})

describe('correlation', () => {
	describe('definition', () => {
		test('1d array', () => {
			const a = []
			const b = []
			const n = 1000
			for (let i = 0; i < n; i++) {
				a.push(Math.random())
				b.push(Math.random())
			}
			const ma = a.reduce((s, v) => s + v, 0) / n
			const mb = b.reduce((s, v) => s + v, 0) / n
			const sa = a.reduce((s, v) => s + (v - ma) ** 2, 0) / n
			const sb = b.reduce((s, v) => s + (v - mb) ** 2, 0) / n
			const co = a.reduce((s, v, i) => s + (v - ma) * (b[i] - mb), 0) / n

			const corr = correlation(a, b)
			expect(corr).toBe(co / Math.sqrt(sa * sb))
		})

		test('2d array', () => {
			const a = []
			const b = []
			const d = 3
			const n = 1000
			for (let i = 0; i < n; i++) {
				a[i] = []
				b[i] = []
				for (let k = 0; k < d; k++) {
					a[i].push(Math.random())
					b[i].push(Math.random())
				}
			}

			const err = correlation(a, b)
			expect(err).toHaveLength(d)
			for (let k = 0; k < d; k++) {
				const ma = a.reduce((s, v) => s + v[k], 0) / n
				const mb = b.reduce((s, v) => s + v[k], 0) / n
				const sa = a.reduce((s, v) => s + (v[k] - ma) ** 2, 0) / n
				const sb = b.reduce((s, v) => s + (v[k] - mb) ** 2, 0) / n
				const co = a.reduce((s, v, i) => s + (v[k] - ma) * (b[i][k] - mb), 0) / n
				expect(err[k]).toBe(co / Math.sqrt(sa * sb))
			}
		})
	})

	test('best', () => {
		const a = []
		const n = 1000
		for (let i = 0; i < n; i++) {
			a.push(Math.random())
		}
		const err = correlation(a, a)
		expect(err).toBe(1)
	})
})
