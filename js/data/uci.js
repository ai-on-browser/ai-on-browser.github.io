import CSVData from './csv.js'

// https://archive.ics.uci.edu/ml/index.php
const datasetInfos = {
	iris: {
		file: '/js/data/csv/iris.data',
		info: [
			{ name: 'sepal length (cm)', type: 'numeric' },
			{ name: 'sepal width (cm)', type: 'numeric' },
			{ name: 'petal length (cm)', type: 'numeric' },
			{ name: 'petal width (cm)', type: 'numeric' },
			{ name: 'class', type: 'category', out: true },
		],
	},
	'wine quality': {
		file: '/js/data/csv/winequality-red.csv',
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
		file: '/js/data/csv/zoo.data',
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
		const flexelm = elm.append('div').style('display', 'flex').style('justify-content', 'space-between')
		flexelm
			.append('span')
			.text('Name')
			.append('select')
			.attr('name', 'name')
			.on('change', () => {
				this._name = elm.select('[name=name]').property('value')
				const info = datasetInfos[this._name]
				this.setCSV(info.file, info.info)
				this.setting.vue.pushHistory()
			})
			.selectAll('option')
			.data(Object.keys(datasetInfos))
			.enter()
			.append('option')
			.attr('value', d => d)
			.text(d => d)
		flexelm
			.append('span')
			.append('a')
			.attr('href', 'http://archive.ics.uci.edu/ml')
			.attr('ref', 'noreferrer noopener')
			.attr('target', '_blank')
			.text('UCI Machine Learning Repository')
		const info = datasetInfos[this._name]

		const name = this._name
		this.readCSV(info.file, data => {
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
		if (params.dataname) {
			const elm = this.setting.data.configElement
			this._name = params.dataname
			elm.select('[name=name]').property('value', params.dataname)
			const info = datasetInfos[this._name]
			this.setCSV(info.file, info.info)
		}
	}
}
