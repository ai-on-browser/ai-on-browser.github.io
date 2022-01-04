import { Matrix } from '../../../lib/util/math.js'
import MutualInformationFeatureSelection from '../../../lib/model/mutual_information.js'

test('feature selection', () => {
	const model = new MutualInformationFeatureSelection()
	const x = Matrix.random(500, 8, -1, 1).toArray()
	const slct = [0, 2, 5]
	const t = x.map(v => [slct.reduce((s, i) => s + v[i], 0)])

	model.fit(x, t)
	const y = model.predict(x, 2)

	const idx = []
	for (let i = 0; i < y[0].length; i++) {
		for (let j = 0; j < slct.length; j++) {
			if (y[0][i] === x[0][slct[j]]) {
				idx[i] = slct[j]
			}
		}
		expect(idx[i]).toBeDefined()
	}

	for (let i = 0; i < x.length; i++) {
		for (let k = 0; k < idx.length; k++) {
			expect(y[i][k]).toBe(x[i][idx[k]])
		}
	}
})
