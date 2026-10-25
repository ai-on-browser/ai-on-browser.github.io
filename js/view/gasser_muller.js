import GasserMuller from '../../lib/model/gasser_muller.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.require = { dimension: 1 }
	platform.setting.ml.reference = {
		author: 'W. R. Schucany',
		title: 'Kernel Smoothers: An Overview of Curve Estimators for the First Graduate Course in Nonparametric Statistics',
		year: 2004,
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new GasserMuller(sigma.value)
		model.fit(
			platform.trainInput.map(v => v[0]),
			platform.trainOutput.map(v => v[0])
		)

		const pred = model.predict(platform.testInput(platform.datas.dimension === 1 ? 1 : 4).map(v => v[0]))
		platform.testResult(pred)
	}

	const sigma = controller.input.number({ min: 0, step: 0.01, value: 1 })
	controller.input.button('Fit').on('click', () => fitModel())
}
