import MARS from '../../lib/model/mars.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.reference = {
		author: 'J. H. Friedman',
		title: 'MULTIVARIATE ADAPTIVE REGRESSION SPLINES',
		year: 1990,
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new MARS(mmax.value)
		model.fit(platform.trainInput, platform.trainOutput)

		const pred = model.predict(platform.testInput(2))
		platform.testResult(pred)
	}

	const mmax = controller.input.number({ label: 'M max', max: 100, min: 1, value: 5 })

	controller.input.button('Fit').on('click', fitModel)
}
