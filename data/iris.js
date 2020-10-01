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
		super(manager)

		this.setCSVFromUrl('/data/csv/iris.data', dataNames, ["numeric", "numeric", "numeric", "numeric", 'category'], 4)
	}

	get availTask() {
		return ['CF', 'RG', 'AD', 'DR', 'FS']
	}
}

