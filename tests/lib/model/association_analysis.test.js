import AssociationAnalysis from '../../../lib/model/association_analysis.js'

test('default', () => {
	const model = new AssociationAnalysis()

	const data = [
		['data', 'image', 'java'],
		['image', 'c'],
		['c', 'web'],
		['image', 'java', 'c'],
		['data', 'image', 'java', 'c', 'net'],
		['data', 'java', 'net'],
		['data', 'java'],
	]
	model.fit(data)
})
