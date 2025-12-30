import { accuracy } from '../../../lib/evaluate/classification.js'
import EnsembleBinaryModel from '../../../lib/model/ensemble_binary.js'
import Matrix from '../../../lib/util/matrix.js'

describe('oneone', () => {
	test('init fit', () => {
		const model = new EnsembleBinaryModel(() => {
			let x, y, w, b
			return {
				init: (tx, ty) => {
					x = Matrix.fromArray(tx)
					y = Matrix.fromArray(ty)
				},
				fit: () => {
					w = x.tDot(x).solve(x.tDot(y))
					b = Matrix.sub(x.dot(w), y).mean(0)
				},
				predict: x => {
					const p = Matrix.fromArray(x).dot(w)
					p.sub(b)
					return p.toArray()
				},
			}
		}, 'oneone')
		const n = 100
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)),
			Matrix.randn(n, 2, [-1, 4], 0.2)
		).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / n))
		}
		model.init(x, t)
		model.fit()
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test('predict returns 1d array', () => {
		const model = new EnsembleBinaryModel(() => {
			let x, y, w, b
			return {
				init: (tx, ty) => {
					x = Matrix.fromArray(tx)
					y = Matrix.fromArray(ty)
				},
				fit: () => {
					w = x.tDot(x).solve(x.tDot(y))
					b = Matrix.sub(x.dot(w), y).mean(0)
				},
				predict: x => {
					const p = Matrix.fromArray(x).dot(w)
					p.sub(b)
					return p.value
				},
			}
		}, 'oneone')
		const n = 100
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)),
			Matrix.randn(n, 2, [-1, 4], 0.2)
		).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / n))
		}
		model.init(x, t)
		model.fit()
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test('construct with classes', () => {
		const model = new EnsembleBinaryModel(
			() => {
				let x, y, w, b
				return {
					init: (tx, ty) => {
						x = Matrix.fromArray(tx)
						y = Matrix.fromArray(ty)
					},
					fit: () => {
						w = x.tDot(x).solve(x.tDot(y))
						b = Matrix.sub(x.dot(w), y).mean(0)
					},
					predict: x => {
						const p = Matrix.fromArray(x).dot(w)
						p.sub(b)
						return p.toArray()
					},
				}
			},
			'oneone',
			['a', 'b', 'c']
		)
		const n = 100
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)),
			Matrix.randn(n, 2, [-1, 4], 0.2)
		).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / n))
		}
		model.init(x, t)
		model.fit()
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test('construct with set classes', () => {
		const model = new EnsembleBinaryModel(
			() => {
				let x, y, w, b
				return {
					init: (tx, ty) => {
						x = Matrix.fromArray(tx)
						y = Matrix.fromArray(ty)
					},
					fit: () => {
						w = x.tDot(x).solve(x.tDot(y))
						b = Matrix.sub(x.dot(w), y).mean(0)
					},
					predict: x => {
						const p = Matrix.fromArray(x).dot(w)
						p.sub(b)
						return p.toArray()
					},
				}
			},
			'oneone',
			new Set(['a', 'b', 'c'])
		)
		const n = 100
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)),
			Matrix.randn(n, 2, [-1, 4], 0.2)
		).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / n))
		}
		model.init(x, t)
		model.fit()
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test('no model init', () => {
		const model = new EnsembleBinaryModel(() => {
			let x, y, w, b
			return {
				init: (tx, ty) => {
					x = Matrix.fromArray(tx)
					y = Matrix.fromArray(ty)
				},
				fit: () => {
					w = x.tDot(x).solve(x.tDot(y))
					b = Matrix.sub(x.dot(w), y).mean(0)
				},
				predict: x => {
					const p = Matrix.fromArray(x).dot(w)
					p.sub(b)
					return p.toArray()
				},
			}
		}, 'oneone')
		const n = 100
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)),
			Matrix.randn(n, 2, [-1, 4], 0.2)
		).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / n))
		}
		model.fit(x, t)
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test('no sub model init', () => {
		const model = new EnsembleBinaryModel(() => {
			let w, b
			return {
				fit: (x, y) => {
					x = Matrix.fromArray(x)
					y = Matrix.fromArray(y)
					w = x.tDot(x).solve(x.tDot(y))
					b = Matrix.sub(x.dot(w), y).mean(0)
				},
				predict: x => {
					const p = Matrix.fromArray(x).dot(w)
					p.sub(b)
					return p.toArray()
				},
			}
		}, 'oneone')
		const n = 100
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)),
			Matrix.randn(n, 2, [-1, 4], 0.2)
		).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / n))
		}
		model.fit(x, t)
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})
})

describe('onerest', () => {
	test('init fit', () => {
		const model = new EnsembleBinaryModel(() => {
			let x, y, w, b
			return {
				init: (tx, ty) => {
					x = Matrix.fromArray(tx)
					y = Matrix.fromArray(ty)
				},
				fit: () => {
					w = x.tDot(x).solve(x.tDot(y))
					b = Matrix.sub(x.dot(w), y).mean(0)
				},
				predict: x => {
					const p = Matrix.fromArray(x).dot(w)
					p.sub(b)
					return p.toArray()
				},
			}
		}, 'onerest')
		const n = 100
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)),
			Matrix.randn(n, 2, [-1, 4], 0.2)
		).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / n))
		}
		model.init(x, t)
		model.fit()
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test('predict returns 1d array', () => {
		const model = new EnsembleBinaryModel(() => {
			let x, y, w, b
			return {
				init: (tx, ty) => {
					x = Matrix.fromArray(tx)
					y = Matrix.fromArray(ty)
				},
				fit: () => {
					w = x.tDot(x).solve(x.tDot(y))
					b = Matrix.sub(x.dot(w), y).mean(0)
				},
				predict: x => {
					const p = Matrix.fromArray(x).dot(w)
					p.sub(b)
					return p.value
				},
			}
		}, 'onerest')
		const n = 100
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)),
			Matrix.randn(n, 2, [-1, 4], 0.2)
		).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / n))
		}
		model.init(x, t)
		model.fit()
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test('constructo with classes', () => {
		const model = new EnsembleBinaryModel(
			() => {
				let x, y, w, b
				return {
					init: (tx, ty) => {
						x = Matrix.fromArray(tx)
						y = Matrix.fromArray(ty)
					},
					fit: () => {
						w = x.tDot(x).solve(x.tDot(y))
						b = Matrix.sub(x.dot(w), y).mean(0)
					},
					predict: x => {
						const p = Matrix.fromArray(x).dot(w)
						p.sub(b)
						return p.toArray()
					},
				}
			},
			'onerest',
			['a', 'b', 'c']
		)
		const n = 100
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)),
			Matrix.randn(n, 2, [-1, 4], 0.2)
		).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / n))
		}
		model.init(x, t)
		model.fit()
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test('constructo with set classes', () => {
		const model = new EnsembleBinaryModel(
			() => {
				let x, y, w, b
				return {
					init: (tx, ty) => {
						x = Matrix.fromArray(tx)
						y = Matrix.fromArray(ty)
					},
					fit: () => {
						w = x.tDot(x).solve(x.tDot(y))
						b = Matrix.sub(x.dot(w), y).mean(0)
					},
					predict: x => {
						const p = Matrix.fromArray(x).dot(w)
						p.sub(b)
						return p.toArray()
					},
				}
			},
			'onerest',
			new Set(['a', 'b', 'c'])
		)
		const n = 100
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)),
			Matrix.randn(n, 2, [-1, 4], 0.2)
		).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / n))
		}
		model.init(x, t)
		model.fit()
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test('no model init', () => {
		const model = new EnsembleBinaryModel(() => {
			let x, y, w, b
			return {
				init: (tx, ty) => {
					x = Matrix.fromArray(tx)
					y = Matrix.fromArray(ty)
				},
				fit: () => {
					w = x.tDot(x).solve(x.tDot(y))
					b = Matrix.sub(x.dot(w), y).mean(0)
				},
				predict: x => {
					const p = Matrix.fromArray(x).dot(w)
					p.sub(b)
					return p.toArray()
				},
			}
		}, 'onerest')
		const n = 100
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)),
			Matrix.randn(n, 2, [-1, 4], 0.2)
		).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / n))
		}
		model.fit(x, t)
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test('no sub model init', () => {
		const model = new EnsembleBinaryModel(() => {
			let w, b
			return {
				fit: (x, y) => {
					x = Matrix.fromArray(x)
					y = Matrix.fromArray(y)
					w = x.tDot(x).solve(x.tDot(y))
					b = Matrix.sub(x.dot(w), y).mean(0)
				},
				predict: x => {
					const p = Matrix.fromArray(x).dot(w)
					p.sub(b)
					return p.toArray()
				},
			}
		}, 'onerest')
		const n = 100
		const x = Matrix.concat(
			Matrix.concat(Matrix.randn(n, 2, 0, 0.2), Matrix.randn(n, 2, 5, 0.2)),
			Matrix.randn(n, 2, [-1, 4], 0.2)
		).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = String.fromCharCode('a'.charCodeAt(0) + Math.floor(i / n))
		}
		model.fit(x, t)
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})
})

test('invalid type', () => {
	const model = new EnsembleBinaryModel(() => {
		let x, y, w, b
		return {
			init: (tx, ty) => {
				x = Matrix.fromArray(tx)
				y = Matrix.fromArray(ty)
			},
			fit: () => {
				w = x.tDot(x).solve(x.tDot(y))
				b = Matrix.sub(x.dot(w), y).mean(0)
			},
			predict: x => {
				const p = Matrix.fromArray(x).dot(w)
				p.sub(b)
				return p.toArray()
			},
		}
	}, 'invalid')

	expect(model).toEqual({})
})
