import { jest } from '@jest/globals'
jest.retryTimes(3)

import Matrix from '../../../lib/util/matrix.js'
import S3VM from '../../../lib/model/s3vm.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

describe('semi-classifier', () => {
	test.each(['gaussian', { name: 'gaussian', d: 0.8 }, 'linear', { name: 'linear' }])('kernel %s', kernel => {
		const model = new S3VM(kernel)
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		const t_org = []
		for (let i = 0; i < x.length; i++) {
			t_org[i] = t[i] = Math.floor(i / 50) * 2 - 1
			if (Math.random() < 0.5) {
				t[i] = null
			}
		}
		model.init(x, t)
		for (let i = 0; i < 1000; i++) {
			model.fit()
		}
		const y = model.predict(x)
		const acc = accuracy(y.map(Math.sign), t_org.map(Math.sign))
		expect(acc).toBeGreaterThan(0.95)
	})

	test('custom kernel', () => {
		const model = new S3VM((a, b) => Math.exp(-2 * a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0) ** 2))
		const x = Matrix.concat(Matrix.randn(50, 2, 0, 0.2), Matrix.randn(50, 2, 5, 0.2)).toArray()
		const t = []
		const t_org = []
		for (let i = 0; i < x.length; i++) {
			t_org[i] = t[i] = Math.floor(i / 50) * 2 - 1
			if (Math.random() < 0.5) {
				t[i] = null
			}
		}
		model.init(x, t)
		for (let i = 0; i < 1000; i++) {
			model.fit()
		}
		const y = model.predict(x)
		const acc = accuracy(y.map(Math.sign), t_org.map(Math.sign))
		expect(acc).toBeGreaterThan(0.95)
	})
})
