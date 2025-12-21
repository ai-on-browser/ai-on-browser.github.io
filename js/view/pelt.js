import PELT from '../../lib/model/pelt.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'R. Killick, P. Fearnhead, I. A. Eckley',
		title: 'Optimal detection of changepoints with a linear computational cost',
		year: 2011,
	}
	const controller = new Controller(platform)
	const calcSST = () => {
		const model = new PELT(penalty.value, cost.value)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => +v)
		platform.threshold = 0.5
	}

	const penalty = controller.input.number({ label: ' penalty ', min: 0, max: 100, step: 0.1, value: 0.1 })
	const cost = controller.select(['l2', 'l1', 'rbf'])
	controller.input.button('Calculate').on('click', calcSST)
}
