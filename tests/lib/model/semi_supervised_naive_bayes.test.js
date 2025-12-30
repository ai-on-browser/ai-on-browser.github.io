import { accuracy } from '../../../lib/evaluate/classification.js'
import SemiSupervisedNaiveBayes from '../../../lib/model/semi_supervised_naive_bayes.js'

test('semi-classifier', () => {
	const model = new SemiSupervisedNaiveBayes()
	const x = [
		['May', 'I', 'have', 'a', 'large', 'container', 'of', 'coffee'],
		['I', 'have', 'a', 'cup', 'of', 'coffee'],
		[
			'Artificial',
			'beings',
			'with',
			'intelligence',
			'appeared',
			'as',
			'storytelling',
			'devices',
			'in',
			'antiquity',
		],
		['Artificial', 'intelligence', 'is', 'intelligence', 'demonstrated', 'by', 'machines'],
	]
	const t = ['a', null, 'b', null]
	const t_org = ['a', 'a', 'b', 'b']

	model.init(x, t)
	const llh = model.logLikelihood()
	for (let i = 0; i < 20; i++) {
		model.fit()
	}
	const llh0 = model.logLikelihood()
	expect(llh0).toBeGreaterThanOrEqual(llh)

	const y = model.predict(x)
	const acc = accuracy(y, t_org)
	expect(acc).toBeGreaterThan(0.95)
})

test('semi-classifier unknown data', () => {
	const model = new SemiSupervisedNaiveBayes()
	const x = [['May', 'I', 'have', 'a', 'large', 'container', 'of', 'coffee']]
	const t = ['a']

	model.init(x, t)
	model.fit()

	const y = model.predict([['Dummy']])
	expect(y).toEqual([null])
})
