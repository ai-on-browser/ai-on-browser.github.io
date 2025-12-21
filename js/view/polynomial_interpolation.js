import PolynomialInterpolation from '../../lib/model/polynomial_interpolation.js'

var dispPolynomialInterpolation = (elm, platform) => {
	platform.setting.ml.reference = {
		title: 'Polynomial interpolation (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Polynomial_interpolation',
	}
	const fitModel = () => {
		const model = new PolynomialInterpolation()
		model.fit(
			platform.trainInput.map(v => v[0]),
			platform.trainOutput.map(v => v[0])
		)

		const pred = model.predict(platform.testInput(1).map(v => v[0]))
		platform.testResult(pred)
	}

	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	platform.setting.ml.require = {
		dimension: 1,
	}
	dispPolynomialInterpolation(platform.setting.ml.configElement, platform)
}
