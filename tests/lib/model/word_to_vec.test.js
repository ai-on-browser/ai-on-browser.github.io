import { jest } from '@jest/globals'
jest.retryTimes(3)

import Word2Vec from '../../../lib/model/word_to_vec.js'

describe.each(['CBOW', 'skip-gram'])('embedding %s', method => {
	test('number', () => {
		const x = ['May', 'I', 'have', 'a', 'large', 'container', 'of', 'coffee']
		const model = new Word2Vec(method, 1, 10, 2, 'adam')

		for (let i = 0; i < 20; i++) {
			model.fit(x, 1, 0.1, 10)
			expect(model.epoch).toBe(i + 1)
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
			expect(model.epoch).toBe(i + 1)
		}

		const y = model.reduce(x)
		expect(y).toHaveLength(x.length)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toHaveLength(2)
		}
	})

	test('small number of words', () => {
		const x = ['May', 'I', 'have', 'a', 'large', 'container', 'of', 'coffee']
		const model = new Word2Vec(method, 1, 3, 2, 'adam')

		model.fit(x, 1, 0.1, 10)

		const y = model.reduce(x)
		expect(y).toHaveLength(x.length)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toHaveLength(2)
		}
	})
})

test('predict unknown', () => {
	const x = ['May', 'I', 'have', 'a', 'large', 'container', 'of', 'coffee']
	const model = new Word2Vec('CBOW', 1, x, 2, 'adam')

	for (let i = 0; i < 20; i++) {
		model.fit(x, 1, 0.1, 10)
		expect(model.epoch).toBe(i + 1)
	}

	const y = model.reduce(['pi'])
	expect(y).toHaveLength(1)
	for (let i = 0; i < y.length; i++) {
		expect(y[i]).toHaveLength(2)
	}
})

describe('reconstruct', () => {
	test('default', () => {
		const x = ['May', 'I', 'have', 'a', 'large', 'container', 'of', 'coffee']
		const model = new Word2Vec('CBOW', 1, x, 2, 'adam')

		for (let i = 0; i < 20; i++) {
			model.fit(x, 1, 0.1, 10)
			expect(model.epoch).toBe(i + 1)
		}

		const y = model.predict(x)
		expect(y).toHaveLength(x.length)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toHaveLength(9)
		}
	})

	test('unknown', () => {
		const x = ['May', 'I', 'have', 'a', 'large', 'container', 'of', 'coffee']
		const model = new Word2Vec('CBOW', 1, x, 2, 'adam')

		for (let i = 0; i < 20; i++) {
			model.fit(x, 1, 0.1, 10)
			expect(model.epoch).toBe(i + 1)
		}

		const y = model.predict(['pi'])
		expect(y).toHaveLength(1)
		for (let i = 0; i < y.length; i++) {
			expect(y[i]).toHaveLength(9)
		}
	})
})
