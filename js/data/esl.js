import CSVData from './csv.js'

// https://web.stanford.edu/~hastie/ElemStatLearn/
const datasetInfos = {
	marketing: {
		file: '/js/data/csv/marketing.data.gz',
		info: [
			{
				name: 'income',
				type: 'category',
				labels: {
					1: 'Less than $10,000',
					2: '$10,000 to $14,999',
					3: '$15,000 to $19,999',
					4: '$20,000 to $24,999',
					5: '$25,000 to $29,999',
					6: '$30,000 to $39,999',
					7: '$40,000 to $49,999',
					8: '$50,000 to $74,999',
					9: '$75,000 or more',
				},
			},
			{ name: 'sex', type: 'category', labels: { 1: 'Male', 2: 'Female' } },
			{
				name: 'marital',
				type: 'category',
				labels: {
					1: 'Married',
					2: 'Living together, not married',
					3: 'Divorced or separated',
					4: 'Widowed',
					5: 'Single, never married',
					NA: null,
				},
			},
			{
				name: 'age',
				type: 'category',
				labels: {
					1: '14 thru 17',
					2: '18 thru 24',
					3: '25 thru 34',
					4: '35 thru 44',
					5: '45 thru 54',
					6: '55 thru 64',
					7: '65 and Over',
				},
			},
			{
				name: 'educatioin',
				type: 'category',
				labels: {
					1: 'Grade 8 or less',
					2: 'Grades 9 to 11',
					3: 'Graduated high school',
					4: '1 to 3 years of college',
					5: 'College graduate',
					6: 'Grad Study',
					NA: null,
				},
			},
			{
				name: 'occupation',
				type: 'category',
				labels: {
					1: 'Professional/Managerial',
					2: 'Sales Worker',
					3: 'Factory Worker/Laborer/Driver',
					4: 'Clerical/Service Worker',
					5: 'Homemaker',
					6: 'Student, HS or College',
					7: 'Military',
					8: 'Retired',
					9: 'Unemployed',
					NA: null,
				},
			},
			{
				name: 'years',
				type: 'category',
				labels: {
					1: 'Less than one year',
					2: 'One to three years',
					3: 'Four to six years',
					4: 'Seven to ten years',
					5: 'More than ten years',
					NA: null,
				},
			},
			{ name: 'dual income', type: 'category', labels: { 1: 'Not Married', 2: 'Yes', 3: 'No' } },
			{
				name: 'household',
				type: 'category',
				labels: {
					1: 'One',
					2: 'Two',
					3: 'Three',
					4: 'Four',
					5: 'Five',
					6: 'Six',
					7: 'Seven',
					8: 'Eight',
					9: 'Nine or more',
					NA: null,
				},
			},
			{
				name: 'children',
				type: 'category',
				labels: {
					0: 'None',
					1: 'One',
					2: 'Two',
					3: 'Three',
					4: 'Four',
					5: 'Five',
					6: 'Six',
					7: 'Seven',
					8: 'Eight',
					9: 'Nine or more',
				},
			},
			{
				name: 'householder',
				type: 'category',
				labels: { 1: 'Own', 2: 'Rent', 3: 'Live with Parents/Family', NA: null },
			},
			{
				name: 'type',
				type: 'category',
				labels: { 1: 'House', 2: 'Condominium', 3: 'Apartment', 4: 'Mobile Home', 5: 'Other', NA: null },
			},
			{
				name: 'ethnic',
				type: 'category',
				labels: {
					1: 'American Indian',
					2: 'Asian',
					3: 'Black',
					4: 'East Indian',
					5: 'Hispanic',
					6: 'Pacific Islander',
					7: 'White',
					8: 'Other',
					NA: null,
				},
			},
			{ name: 'language', type: 'category', labels: { 1: 'English', 2: 'Spanish', 3: 'Other', NA: null } },
		],
	},
}

export default class MarketingData extends CSVData {
	constructor(manager) {
		super(manager)
		this._name = 'marketing'

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
			this._readyData()
			this.setting.vue.pushHistory()
		}
		for (const d of Object.keys(datasetInfos)) {
			const opt = document.createElement('option')
			opt.value = opt.innerText = d
			datanames.appendChild(opt)
		}
		dataslctelm.append('Name', datanames)

		const aelm = document.createElement('a')
		flexelm.appendChild(aelm)
		aelm.href = 'https://web.stanford.edu/~hastie/ElemStatLearn/'
		aelm.setAttribute('ref', 'noreferrer noopener')
		aelm.target = '_blank'
		aelm.innerText = 'The Elements of Statistical Learning'

		this._readyData()
	}

	get availTask() {
		return ['RC']
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
		this.readCSV(info.file, {
			delimiter: ' ',
		}).then(data => {
			if (name === this._name) {
				this.setCSV(data, info.info)
				this._manager.onReady(() => {
					this._manager.platform.render()
				})
			}
		})
	}
}
