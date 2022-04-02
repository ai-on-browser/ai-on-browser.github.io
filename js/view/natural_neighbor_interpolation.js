import NaturalNeighborInterpolation from '../../lib/model/natural_neighbor_interpolation.js'

var dispLerp = function (elm, platform) {
	const calcLerp = function () {
		const model = new NaturalNeighborInterpolation()
		model.fit(platform.trainInput, platform.trainOutput)
		const pred = model.predict(platform.testInput(platform.datas.dimension === 1 ? 1 : 4))
		platform.testResult(pred.map(v => v ?? -1))
	}

	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcLerp)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	platform.setting.ml.require = {
		dimension: [1, 2],
	}
	dispLerp(platform.setting.ml.configElement, platform)
}
