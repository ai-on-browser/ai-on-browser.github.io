import Word2Vec from '../../../lib/model/word_to_vec.js'

describe.each(['CBOW', 'skip-gram'])('embedding %s', method => {
	test('number', () => {
		const x = ['May', 'I', 'have', 'a', 'large', 'container', 'of', 'coffee']
		const model = new Word2Vec(method, 1, 10, 2, 'adam')

		for (let i = 0; i < 20; i++) {
			model.fit(x, 1, 0.1, 10)
		}

		const y = model.reduce(x)
		expect(y).toHaveLength(x.length)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toHaveLength(2)
		}
	})

	test('words', () => {
		const x = ['May', 'I', 'have', 'a', 'large', 'container', 'of', 'coffee']
		const model = new Word2Vec(method, 1, x, 2, 'adam')

		for (let i = 0; i < 20; i++) {
			model.fit(x, 1, 0.1, 10)
		}

		const y = model.reduce(x)
		expect(y).toHaveLength(x.length)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toHaveLength(2)
		}
	})
})
