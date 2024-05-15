import BIRCH from '../../lib/model/birch.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'BIRCH (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/BIRCH',
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new BIRCH(null, b.value, t.value, l.value)
		model.fit(platform.trainInput)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		clusters.value = new Set(pred).size
	}

	const b = controller.input.number({ label: ' b ', min: 2, max: 1000, value: 10 })
	const t = controller.input.number({ label: ' t ', min: 0.01, max: 10, step: 0.01, value: 0.2 })
	const l = controller.input.number({ label: ' l ', min: 2, max: 10000, value: 10000 })
	const subalgo = controller.select(['none'])
	controller.input.button('Fit').on('click', fitModel)
	const clusters = controller.text({ label: ' Clusters: ' })
}
