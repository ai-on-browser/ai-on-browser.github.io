import HBOS from '../../lib/model/hbos.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.reference = {
		author: 'M. Goldstein, A. Dengel',
		title: 'Histogram-based Outlier Score (HBOS): A fast Unsupervised Anomaly Detection Algorithm',
		year: 2012,
	}
	const controller = new Controller(platform)
	const calc = () => {
		const model = new HBOS(k.value, method.value)
		const outliers = model.predict(platform.trainInput)
		platform.trainResult = outliers.map(v => v < t.value)
	}

	const k = controller.input.number({ label: ' k ', min: 1, max: 100, value: 20 }).on('change', calc)
	const method = controller.select({ label: ' method ', values: ['dynamic', 'static'] }).on('change', () => {
		if (method.value === 'dynamic') {
			k.element.step = 1
			k.value = Math.round(k.value)
		} else {
			k.element.step = 0.1
		}
		calc()
	})
	const t = controller.input.number({ label: ' t ', min: -100, max: 0, step: 0.1, value: -3 }).on('change', calc)
	controller.input.button('Calculate').on('click', calc)
}
