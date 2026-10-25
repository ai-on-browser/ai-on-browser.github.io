import SmirnovGrubbs from '../../lib/model/smirnov_grubbs.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		title: "Grubbs's test (Wikipedia)",
		url: 'https://en.wikipedia.org/wiki/Grubbs%27s_test',
	}
	platform.setting.ml.require = { dimension: 1 }
	const controller = new Controller(platform)
	const calcSmirnovGrubbs = () => {
		const model = new SmirnovGrubbs(alpha.value)
		const outliers = model.predict(platform.trainInput.map(v => v[0]))
		platform.trainResult = outliers
	}

	const alpha = controller.input
		.number({ label: ' alpha = ', min: 0, max: 10, value: 1 })
		.on('change', calcSmirnovGrubbs)
	controller.input.button('Calculate').on('click', calcSmirnovGrubbs)
}
