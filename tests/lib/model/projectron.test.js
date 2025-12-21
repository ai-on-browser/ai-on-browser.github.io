import { accuracy } from '../../../lib/evaluate/classification.js'
import { Projectron, Projectronpp } from '../../../lib/model/projectron.js'
import Matrix from '../../../lib/util/matrix.js'

describe('projectron', () => {
	test('default', { retry: 8 }, () => {
		const model = new Projectron()
		const s = 5
		const x = []
		for (let i = 0; i < 50; i++) {
			const r = (i / 50) * Math.PI
			x.push([Math.cos(r) * s + Math.random() - 0.5, Math.sin(r) * s + Math.random() - 0.5])
		}
		for (let i = 0; i < 50; i++) {
			const r = (i / 50) * Math.PI
			x.push([s - Math.cos(r) * s + Math.random() - 0.5, s - Math.sin(r) * s - s / 2 + Math.random() - 0.5])
		}
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50) * 2 - 1
		}
		for (let i = 0; i < 10; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test.each([undefined, 'gaussian', { name: 'gaussian', s: 0.8 }])('kernel %s', { retry: 8 }, kernel => {
		const model = new Projectron(0.1, kernel)
		const s = 5
		const x = []
		for (let i = 0; i < 50; i++) {
			const r = (i / 50) * Math.PI
			x.push([Math.cos(r) * s + Math.random() - 0.5, Math.sin(r) * s + Math.random() - 0.5])
		}
		for (let i = 0; i < 50; i++) {
			const r = (i / 50) * Math.PI
			x.push([s - Math.cos(r) * s + Math.random() - 0.5, s - Math.sin(r) * s - s / 2 + Math.random() - 0.5])
		}
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50) * 2 - 1
		}
		for (let i = 0; i < 10; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test.each(['polynomial', { name: 'polynomial' }])('kernel %s', { retry: 8 }, kernel => {
		const model = new Projectron(0.1, kernel)
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50) * 2 - 1
		}
		for (let i = 0; i < 10; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.55)
	})

	test('custom kernel', { retry: 8 }, () => {
		const model = new Projectron(0.1, (a, b) => Math.exp(-2 * a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2))
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50) * 2 - 1
		}
		for (let i = 0; i < 10; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})
})

describe('projectron++', () => {
	test('default', { retry: 8 }, () => {
		const model = new Projectronpp()
		const s = 5
		const x = []
		for (let i = 0; i < 50; i++) {
			const r = (i / 50) * Math.PI
			x.push([Math.cos(r) * s + Math.random() - 0.5, Math.sin(r) * s + Math.random() - 0.5])
		}
		for (let i = 0; i < 50; i++) {
			const r = (i / 50) * Math.PI
			x.push([s - Math.cos(r) * s + Math.random() - 0.5, s - Math.sin(r) * s - s / 2 + Math.random() - 0.5])
		}
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50) * 2 - 1
		}
		for (let i = 0; i < 10; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test.each([undefined, 'gaussian', { name: 'gaussian', s: 0.8 }])('kernel %s', { retry: 8 }, kernel => {
		const model = new Projectronpp(0.1, kernel)
		const s = 5
		const x = []
		for (let i = 0; i < 50; i++) {
			const r = (i / 50) * Math.PI
			x.push([Math.cos(r) * s + Math.random() - 0.5, Math.sin(r) * s + Math.random() - 0.5])
		}
		for (let i = 0; i < 50; i++) {
			const r = (i / 50) * Math.PI
			x.push([s - Math.cos(r) * s + Math.random() - 0.5, s - Math.sin(r) * s - s / 2 + Math.random() - 0.5])
		}
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50) * 2 - 1
		}
		for (let i = 0; i < 10; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})

	test.each(['polynomial', { name: 'polynomial' }])('kernel %s', { retry: 8 }, kernel => {
		const model = new Projectronpp(0.1, kernel)
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50) * 2 - 1
		}
		for (let i = 0; i < 10; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.8)
	})

	test('custom kernel', { retry: 8 }, () => {
		const model = new Projectronpp(0.1, (a, b) => Math.exp(-2 * a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2))
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		for (let i = 0; i < x.length; i++) {
			t[i] = Math.floor(i / 50) * 2 - 1
		}
		for (let i = 0; i < 10; i++) {
			model.fit(x, t)
		}
		const y = model.predict(x)
		const acc = accuracy(y, t)
		expect(acc).toBeGreaterThan(0.95)
	})
})
