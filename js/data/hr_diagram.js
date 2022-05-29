import { BaseData } from './base.js'

const originalData = [
	[4.37, 5.23],
	[4.56, 5.74],
	[4.26, 4.93],
	[4.56, 5.74],
	[4.3, 5.19],
	[4.46, 5.46],
	[3.84, 4.65],
	[4.57, 5.27],
	[4.26, 5.57],
	[4.37, 5.12],
	[3.49, 5.73],
	[4.43, 5.45],
	[4.48, 5.42],
	[4.01, 4.05],
	[4.29, 4.26],
	[4.42, 4.58],
	[4.23, 3.94],
	[4.42, 4.18],
	[4.23, 4.18],
	[3.49, 5.89],
	[4.29, 4.38],
	[4.29, 4.22],
	[4.42, 4.42],
	[4.49, 4.85],
	[4.38, 5.02],
	[4.42, 4.66],
	[4.29, 4.66],
	[4.38, 4.9],
	[4.22, 4.39],
	[3.48, 6.05],
	[4.38, 4.42],
	[4.56, 5.1],
	[4.45, 5.22],
	[3.49, 6.29],
	[4.23, 4.34],
	[4.62, 5.62],
	[4.53, 5.1],
	[4.45, 5.22],
	[4.53, 5.18],
	[4.43, 5.57],
	[4.38, 4.62],
	[4.45, 5.06],
	[4.5, 5.34],
	[4.45, 5.34],
	[4.55, 5.54],
	[4.45, 4.98],
	[4.42, 4.5],
]

export default class HRDiagramData extends BaseData {
	// Robust Regression and Outlier Detection
	// http://www.ru.ac.bd/wp-content/uploads/sites/25/2019/03/304_10_Rousseeuw_Robust-regression-and-outlier-detection.pdf
	// The Data for the Hertzsprung-Russell Diagram of the Star Cluster CYG OB1
	constructor(manager) {
		super(manager)

		this._x = originalData.concat()
		this._y = Array(this._x.length).fill(0)

		const elm = this.setting.data.configElement
		const div = document.createElement('div')
		div.style.fontSize = '80%'
		div.append(
			'The Data for the Hertzsprung-Russell Diagram of the Star Cluster CYG OB1',
			document.createElement('br'),
			'P. J. Rousseeuw and A. M. Leroy. Robust Regression and Outlier Detection. John Wiley and Sons, New York, October 1987.'
		)
		elm.appendChild(div)
	}

	get availTask() {
		return ['RG', 'AD']
	}

	get columnNames() {
		if (this._manager.task === 'AD') {
			return ['log temperature', 'log light intensity']
		}
		return ['log temperature']
	}

	get x() {
		if (this._manager.task === 'AD') {
			return this._x
		}
		return this._x.map(v => [v[0]])
	}

	get y() {
		if (this._manager.task === 'AD') {
			return this._y
		}
		return this._x.map(v => v[1])
	}
}
