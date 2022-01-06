import { Matrix } from '../../../lib/util/math.js'
import EnsembleBinaryModel from '../../../lib/model/ensemble_binary.js'
import NormalHERD from '../../../lib/model/normal_herd.js'

import { accuracy } from '../../../lib/evaluate/classification.js'

test('oneone', () => {
	const model = new EnsembleBinaryModel(NormalHERD, 'oneone')
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
	const model = new EnsembleBinaryModel(NormalHERD, 'onerest')
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
