import CSVData from './csv.js'

// https://archive.ics.uci.edu/ml/machine-learning-databases/wine-quality/
const dataNames = [
	'fixed acidity',
	'volatile acidity',
	'citric acid',
	'residual sugar',
	'chlorides',
	'free sulfur dioxide',
	'total sulfur dioxide',
	'density',
	'pH',
	'sulphates',
	'alcohol',
	'quality'
]

export default class WineData extends CSVData {
	constructor(manager) {
		super(manager, '/data/csv/winequality-red.csv', dataNames.map((d, i) => {
			return {
				name: d,
				type: 'numeric',
				out: i === 11
			}
		}))
	}

	get availTask() {
		return ['RG', 'AD', 'DR', 'FS']
	}
}

