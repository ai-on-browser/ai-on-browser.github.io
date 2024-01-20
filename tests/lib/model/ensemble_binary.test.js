import Matrix from '../../../lib/util/matrix.js'
import EnsembleBinaryModel from '../../../lib/model/ensemble_binary.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

describe('oneone', () => {
	test('init fit', () => {
		const model = new EnsembleBinaryModel(function () {
			this.init = (x, y) => {
				this.x = Matrix.fromArray(x)
				this.y = Matrix.fromArray(y)
			}
			this.fit = () => {
				this.w = this.x.tDot(this.x).solve(this.x.tDot(this.y))
				this.b = Matrix.sub(this.x.dot(this.w), this.y).mean(0)
			}
			this.predict = x => {
				const p = Matrix.fromArray(x).dot(this.w)
				p.sub(this.b)
				return p.toArray()
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
		const model = new EnsembleBinaryModel(function () {
			this.init = (x, y) => {
				this.x = Matrix.fromArray(x)
				this.y = Matrix.fromArray(y)
			}
			this.fit = () => {
				this.w = this.x.tDot(this.x).solve(this.x.tDot(this.y))
				this.b = Matrix.sub(this.x.dot(this.w), this.y).mean(0)
			}
			this.predict = x => {
				const p = Matrix.fromArray(x).dot(this.w)
				p.sub(this.b)
				return p.value
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
			function () {
				this.init = (x, y) => {
					this.x = Matrix.fromArray(x)
					this.y = Matrix.fromArray(y)
				}
				this.fit = () => {
					this.w = this.x.tDot(this.x).solve(this.x.tDot(this.y))
					this.b = Matrix.sub(this.x.dot(this.w), this.y).mean(0)
				}
				this.predict = x => {
					const p = Matrix.fromArray(x).dot(this.w)
					p.sub(this.b)
					return p.toArray()
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
			function () {
				this.init = (x, y) => {
					this.x = Matrix.fromArray(x)
					this.y = Matrix.fromArray(y)
				}
				this.fit = () => {
					this.w = this.x.tDot(this.x).solve(this.x.tDot(this.y))
					this.b = Matrix.sub(this.x.dot(this.w), this.y).mean(0)
				}
				this.predict = x => {
					const p = Matrix.fromArray(x).dot(this.w)
					p.sub(this.b)
					return p.toArray()
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
		const model = new EnsembleBinaryModel(function () {
			this.init = (x, y) => {
				this.x = Matrix.fromArray(x)
				this.y = Matrix.fromArray(y)
			}
			this.fit = () => {
				this.w = this.x.tDot(this.x).solve(this.x.tDot(this.y))
				this.b = Matrix.sub(this.x.dot(this.w), this.y).mean(0)
			}
			this.predict = x => {
				const p = Matrix.fromArray(x).dot(this.w)
				p.sub(this.b)
				return p.toArray()
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
		const model = new EnsembleBinaryModel(function () {
			this.fit = (x, y) => {
				x = Matrix.fromArray(x)
				y = Matrix.fromArray(y)
				this.w = x.tDot(x).solve(x.tDot(y))
				this.b = Matrix.sub(x.dot(this.w), y).mean(0)
			}
			this.predict = x => {
				const p = Matrix.fromArray(x).dot(this.w)
				p.sub(this.b)
				return p.toArray()
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
		const model = new EnsembleBinaryModel(function () {
			this.init = (x, y) => {
				this.x = Matrix.fromArray(x)
				this.y = Matrix.fromArray(y)
			}
			this.fit = () => {
				this.w = this.x.tDot(this.x).solve(this.x.tDot(this.y))
				this.b = Matrix.sub(this.x.dot(this.w), this.y).mean(0)
			}
			this.predict = x => {
				const p = Matrix.fromArray(x).dot(this.w)
				p.sub(this.b)
				return p.toArray()
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
		const model = new EnsembleBinaryModel(function () {
			this.init = (x, y) => {
				this.x = Matrix.fromArray(x)
				this.y = Matrix.fromArray(y)
			}
			this.fit = () => {
				this.w = this.x.tDot(this.x).solve(this.x.tDot(this.y))
				this.b = Matrix.sub(this.x.dot(this.w), this.y).mean(0)
			}
			this.predict = x => {
				const p = Matrix.fromArray(x).dot(this.w)
				p.sub(this.b)
				return p.value
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
			function () {
				this.init = (x, y) => {
					this.x = Matrix.fromArray(x)
					this.y = Matrix.fromArray(y)
				}
				this.fit = () => {
					this.w = this.x.tDot(this.x).solve(this.x.tDot(this.y))
					this.b = Matrix.sub(this.x.dot(this.w), this.y).mean(0)
				}
				this.predict = x => {
					const p = Matrix.fromArray(x).dot(this.w)
					p.sub(this.b)
					return p.toArray()
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
			function () {
				this.init = (x, y) => {
					this.x = Matrix.fromArray(x)
					this.y = Matrix.fromArray(y)
				}
				this.fit = () => {
					this.w = this.x.tDot(this.x).solve(this.x.tDot(this.y))
					this.b = Matrix.sub(this.x.dot(this.w), this.y).mean(0)
				}
				this.predict = x => {
					const p = Matrix.fromArray(x).dot(this.w)
					p.sub(this.b)
					return p.toArray()
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
		const model = new EnsembleBinaryModel(function () {
			this.init = (x, y) => {
				this.x = Matrix.fromArray(x)
				this.y = Matrix.fromArray(y)
			}
			this.fit = () => {
				this.w = this.x.tDot(this.x).solve(this.x.tDot(this.y))
				this.b = Matrix.sub(this.x.dot(this.w), this.y).mean(0)
			}
			this.predict = x => {
				const p = Matrix.fromArray(x).dot(this.w)
				p.sub(this.b)
				return p.toArray()
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
		const model = new EnsembleBinaryModel(function () {
			this.fit = (x, y) => {
				x = Matrix.fromArray(x)
				y = Matrix.fromArray(y)
				this.w = x.tDot(x).solve(x.tDot(y))
				this.b = Matrix.sub(x.dot(this.w), y).mean(0)
			}
			this.predict = x => {
				const p = Matrix.fromArray(x).dot(this.w)
				p.sub(this.b)
				return p.toArray()
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
	const model = new EnsembleBinaryModel(function () {
		this.init = (x, y) => {
			this.x = Matrix.fromArray(x)
			this.y = Matrix.fromArray(y)
		}
		this.fit = () => {
			this.w = this.x.tDot(this.x).solve(this.x.tDot(this.y))
			this.b = Matrix.sub(this.x.dot(this.w), this.y).mean(0)
		}
		this.predict = x => {
			const p = Matrix.fromArray(x).dot(this.w)
			p.sub(this.b)
			return p.toArray()
		}
	}, 'invalid')

	expect(model).toEqual({})
})
