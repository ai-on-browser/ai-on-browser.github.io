import DensityPeak from '../../lib/model/density_peak.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'A. Rodriguez, A. Laio',
		title: 'Density-based algorithm: identifies clusters as regions around local maxima of the density',
		year: 2014,
	}
	const controller = new Controller(platform)

	const fitModel = () => {
		const model = new DensityPeak(eps.value)

		const pred = model.predict(platform.trainInput).map(v => v + 1)
		platform.trainResult = pred
		clusters.value = new Set(pred.filter(v => v > 0)).size
	}

	const eps = controller.input
		.number({ label: 'eps', min: 0.01, max: 10, step: 0.01, value: 0.05 })
		.on('change', fitModel)
	controller.input.button('Fit').on('click', fitModel)
	const clusters = controller.text({ label: ' Clusters: ' })
}
