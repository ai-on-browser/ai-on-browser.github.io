import CSVData from './csv.js'

// https://archive.ics.uci.edu/ml/index.php
const datasetInfos = {
	iris: {
		file: '/js/data/csv/iris.data.gz',
		info: [
			{ name: 'sepal length (cm)', type: 'numeric' },
			{ name: 'sepal width (cm)', type: 'numeric' },
			{ name: 'petal length (cm)', type: 'numeric' },
			{ name: 'petal width (cm)', type: 'numeric' },
			{ name: 'class', type: 'category', out: true },
		],
	},
	'wine quality': {
		file: '/js/data/csv/winequality-red.csv.gz',
		info: [
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
			'quality',
		].map((d, i) => {
			return {
				name: d,
				type: 'numeric',
				out: i === 11,
			}
		}),
	},
	zoo: {
		file: '/js/data/csv/zoo.data.gz',
		info: [
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
			'type',
		].map((d, i) => {
			return {
				name: d,
				type: 'numeric',
				out: i === 17,
				ignore: i === 0,
			}
		}),
	},
}

export default class UCIData extends CSVData {
	constructor(manager) {
		super(manager)
		this._name = 'iris'

		const elm = this.setting.data.configElement
		const flexelm = document.createElement('div')
		flexelm.style.display = 'flex'
		flexelm.style.justifyContent = 'space-between'
		elm.appendChild(flexelm)

		const dataslctelm = document.createElement('span')
		flexelm.appendChild(dataslctelm)
		const datanames = document.createElement('select')
		datanames.name = 'name'
		datanames.onchange = () => {
			this._name = datanames.value
			const info = datasetInfos[this._name]
			this.setCSV(info.file, info.info)
			this.setting.pushHistory()
		}
		for (const d of Object.keys(datasetInfos)) {
			const opt = document.createElement('option')
			opt.value = opt.innerText = d
			datanames.appendChild(opt)
		}
		dataslctelm.append('Name', datanames)

		const aelm = document.createElement('a')
		flexelm.appendChild(aelm)
		aelm.href = 'http://archive.ics.uci.edu/ml'
		aelm.setAttribute('ref', 'noreferrer noopener')
		aelm.target = '_blank'
		aelm.innerText = 'UCI Machine Learning Repository'

		const info = datasetInfos[this._name]

		const name = this._name
		this.readCSV(info.file).then(data => {
			if (name === this._name) {
				this.setCSV(data, info.info)
			}
		})
	}

	get availTask() {
		return ['CF', 'RG', 'AD', 'DR', 'FS']
	}

	get params() {
		return { dataname: this._name }
	}

	set params(params) {
		if (params.dataname && Object.keys(datasetInfos).includes(params.dataname)) {
			const elm = this.setting.data.configElement
			this._name = params.dataname
			elm.querySelector('[name=name]').value = params.dataname
			const info = datasetInfos[this._name]
			this.setCSV(info.file, info.info)
		}
	}
}
