import NaturalNeighborInterpolation from '../../lib/model/natural_neighbor_interpolation.js'

var dispLerp = function (elm, platform) {
	const calcLerp = function () {
		platform.fit((tx, ty) => {
			const model = new NaturalNeighborInterpolation()
			model.fit(tx, ty)
			platform.predict(
				(px, cb) => {
					const pred = model.predict(px)
					cb(pred.map(v => v ?? -1))
				},
				platform.datas.dimension === 1 ? 1 : 4
			)
		})
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
