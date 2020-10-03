import CSVData from './csv.js'

// https://archive.ics.uci.edu/ml/machine-learning-databases/zoo/
const dataNames = [
	'animal name',
	'hair',
	'feathers',
	'eggs',
	'milk',
	'airborne',
	'aquatic',
	'predator',
	'toothed',
	'backbone',
	'breathes',
	'venomous',
	'fins',
	'legs',
	'tail',
	'domestic',
	'catsize',
	'type'
]

export default class ZooData extends CSVData {
	constructor(manager) {
		super(manager, '/data/csv/zoo.data', dataNames.map((d, i) => {
			return {
				name: d,
				type: 'numeric',
				out: i === dataNames.length - 1,
				ignore: i === 0
			}
		}))
	}

	get availTask() {
		return ['CF', 'AD', 'DR', 'FS']
	}
}

