import Matrix from '../../../lib/util/matrix.js'
import EnsembleBinaryModel from '../../../lib/model/ensemble_binary.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test('oneone', () => {
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
	const x = Matrix.randn(n, 2, 0, 0.2)
		.concat(Matrix.randn(n, 2, 5, 0.2))
		.concat(Matrix.randn(n, 2, [-1, 4], 0.2))
		.toArray()
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
test('onerest', () => {
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
	const x = Matrix.randn(n, 2, 0, 0.2)
		.concat(Matrix.randn(n, 2, 5, 0.2))
		.concat(Matrix.randn(n, 2, [-1, 4], 0.2))
		.toArray()
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
