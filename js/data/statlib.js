import CSVData from './csv.js'

// http://lib.stat.cmu.edu/datasets/
const datasetInfos = {
	boston: {
		file: '/js/data/csv/boston.csv.gz',
		info: [
			{ name: 'CRIM', title: 'per capita crime rate by town' },
			{ name: 'ZN', title: 'proportion of residential land zoned for lots over 25,000 sq.ft.' },
			{ name: 'INDUS', title: 'proportion of non-retail business acres per town' },
			{ name: 'CHAS', title: 'Charles River dummy variable (= 1 if tract bounds river; 0 otherwise)' },
			{ name: 'NOX', title: 'nitric oxides concentration (parts per 10 million)' },
			{ name: 'RM', title: 'average number of rooms per dwelling' },
			{ name: 'AGE', title: 'proportion of owner-occupied units built prior to 1940' },
			{ name: 'DIS', title: 'weighted distances to five Boston employment centres' },
			{ name: 'RAD', title: 'index of accessibility to radial highways' },
			{ name: 'TAX', title: 'full-value property-tax rate per $10,000' },
			{ name: 'PTRATIO', title: 'pupil-teacher ratio by town' },
			{ name: 'B', title: '1000(Bk - 0.63)^2 where Bk is the proportion of blacks by town' },
			{ name: 'LSTAT', title: '% lower status of the population' },
			{ name: 'MEDV', title: "Median value of owner-occupied homes in $1000's", out: true },
		],
		credit: "The Boston house-price data of Harrison, D. and Rubinfeld, D.L. 'Hedonic prices and the demand for clean air', J. Environ. Economics & Management,vol.5, 81-102, 1978.",
	},
	houses: {
		file: '/js/data/csv/houses.csv.gz',
		info: [
			{ name: 'median house value', out: true },
			{ name: 'median income' },
			{ name: 'housing median age' },
			{ name: 'total rooms' },
			{ name: 'total bedrooms' },
			{ name: 'population' },
			{ name: 'households' },
			{ name: 'latitude' },
			{ name: 'longitude' },
		],
		credit: 'Pace, R. Kelley and Ronald Barry, Sparse Spatial Autoregressions, Statistics and Probability Letters, 33 (1997) 291-297.',
	},
}

export default class MarketingData extends CSVData {
	constructor(manager) {
		super(manager)
		this._name = 'boston'

		const elm = this.setting.data.configElement
		const flexelm = document.createElement('div')
		flexelm.style.display = 'flex'
		flexelm.style.justifyContent = 'space-between'
		elm.appendChild(flexelm)

		const dataslctelm = document.createElement('span')
		flexelm.appendChild(dataslctelm)
		dataslctelm.append('Name')
		const datanames = document.createElement('select')
		datanames.name = 'name'
		datanames.onchange = () => {
			this._name = datanames.value
			this._readyData()
			this.setting.pushHistory()
		}
		for (const d of Object.keys(datasetInfos)) {
			const opt = document.createElement('option')
			opt.value = opt.innerText = d
			datanames.appendChild(opt)
		}
		dataslctelm.appendChild(datanames)

		const aelm = document.createElement('a')
		flexelm.appendChild(aelm)
		aelm.href = 'http://lib.stat.cmu.edu/datasets/'
		aelm.setAttribute('ref', 'noreferrer noopener')
		aelm.target = '_blank'
		aelm.innerText = 'StatLib---Datasets Archive'

		this._credit = document.createElement('span')
		this._credit.style.fontSize = '80%'
		elm.appendChild(this._credit)

		this._readyData()
	}

	get availTask() {
		return ['RG']
	}

	get params() {
		return { dataname: this._name }
	}

	set params(params) {
		if (params.dataname && Object.keys(datasetInfos).includes(params.dataname)) {
			const elm = this.setting.data.configElement
			this._name = params.dataname
			elm.querySelector('[name=name]').value = params.dataname
			this._readyData()
		}
	}

	_readyData() {
		const name = this._name
		const info = datasetInfos[name]
		this.readCSV(info.file, { delimiter: ',' }).then(data => {
			if (name === this._name) {
				this._credit.innerText = info.credit
				this.setCSV(data, info.info)
				this._manager.onReady(() => {
					this._manager.platform.render()
				})
			}
		})
	}
}
