import GrowingCellStructures from '../../../lib/model/growing_cell_structures.js'
import Matrix from '../../../lib/util/matrix.js'

test('clustering', () => {
	const model = new GrowingCellStructures()
	const n = 50
	const x = Matrix.concat(Matrix.randn(n, 2, 0, 0.1), Matrix.randn(n, 2, 5, 0.1)).toArray()

	for (let i = 0; i < 100; i++) {
		model.fit(x)
	}
	expect(model.size).toBeGreaterThan(2)
	const y = model.predict(x)
	expect(y).toHaveLength(x.length)
})

test('predict before fit', () => {
	const model = new GrowingCellStructures()
	const x = Matrix.randn(50, 2, 0, 0.1).toArray()
	expect(() => model.predict(x)).toThrow('Call fit before predict.')
})
