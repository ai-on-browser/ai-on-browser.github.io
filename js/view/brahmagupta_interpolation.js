import BrahmaguptaInterpolation from '../../lib/model/brahmagupta_interpolation.js'

var dispBrahmagupta = (elm, platform) => {
	platform.setting.ml.reference = {
		title: "Brahmagupta's interpolation formula (Wikipedia)",
		url: 'https://en.wikipedia.org/wiki/Brahmagupta%27s_interpolation_formula',
	}
	const calcBrahmagupta = () => {
		const model = new BrahmaguptaInterpolation()
		model.fit(
			platform.trainInput.map(v => v[0]),
			platform.trainOutput.map(v => v[0])
		)
		const pred = model.predict(platform.testInput(1).map(v => v[0]))
		platform.testResult(pred)
	}

	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcBrahmagupta)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.require = {
		dimension: 1,
	}
	dispBrahmagupta(platform.setting.ml.configElement, platform)
}
