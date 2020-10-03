import CSVData from './csv.js'

// http://archive.ics.uci.edu/ml/datasets/Iris
const dataNames = [
	'sepal length (cm)',
	'sepal width (cm)',
	'petal length (cm)',
	'petal width (cm)',
	'class'
]

export default class IrisData extends CSVData {
	constructor(manager) {
		super(manager, '/data/csv/iris.data', [
			{ name: dataNames[0], type: 'numeric' },
			{ name: dataNames[1], type: 'numeric' },
			{ name: dataNames[2], type: 'numeric' },
			{ name: dataNames[3], type: 'numeric' },
			{ name: dataNames[4], type: 'category', out: true },
		])
	}

	get availTask() {
		return ['CF', 'RG', 'AD', 'DR', 'FS']
	}
}

