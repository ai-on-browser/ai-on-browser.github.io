import CSVData from './csv.js'

export default class TitanicData extends CSVData {
	// https://www.openml.org/d/40945
	// Simonoff, Jeffrey S (1997): The "unusual episode" and a second statistics course. J Statistics Education, Vol. 5 No. 1.
	constructor(manager) {
		super(manager)

		this._readyData()
	}

	get availTask() {
		return ['RC']
	}

	_readyData() {
		this.readCSV('/js/data/csv/titanic.csv.gz', data => {
			this.setCSV(
				data,
				[
					{ name: 'pclass', type: 'numeric' },
					{ name: 'survived', type: 'category' },
					{ name: 'name', type: 'category' },
					{ name: 'sex', type: 'category' },
					{ name: 'age', type: 'numeric' },
					{ name: 'sibsp', type: 'numeric' },
					{ name: 'parch', type: 'numeric' },
					{ name: 'ticket', type: 'category' },
					{ name: 'fare', type: 'numeric' },
					{ name: 'cabin', type: 'category' },
					{ name: 'embarked', type: 'category' },
					{ name: 'boat', type: 'category' },
					{ name: 'body', type: 'numeric' },
					{ name: 'home.dest', type: 'category' },
				],
				true
			)
			this._manager.onReady(() => {
				this._manager.platform.render()
			})
		})
	}
}
