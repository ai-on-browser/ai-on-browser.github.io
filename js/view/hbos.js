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
		const model = new HBOS()
		const outliers = model.predict(platform.trainInput)
		platform.trainResult = outliers.map(v => v < t.value)
	}

	const t = controller.input.number({ label: ' t = ', min: -100, max: 0, step: 0.1, value: -2 }).on('change', calc)
	controller.input.button('Calculate').on('click', calc)
}
