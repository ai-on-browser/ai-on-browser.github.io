import DelaunayInterpolation from '../../lib/model/delaunay_interpolation.js'

var dispDelaunay = (elm, platform) => {
	const calc = () => {
		const model = new DelaunayInterpolation()
		model.fit(
			platform.trainInput.map(v => [v[0], v[1]]),
			platform.trainOutput.map(v => v[0])
		)
		const pred = model.predict(platform.testInput(3).map(v => [v[0], v[1]]))
		platform.testResult(pred.map(v => v ?? -1))
	}

	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calc)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.require = {
		dimension: 2,
	}
	dispDelaunay(platform.setting.ml.configElement, platform)
}
