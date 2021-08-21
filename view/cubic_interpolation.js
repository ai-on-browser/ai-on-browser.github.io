import CubicInterpolation from '../model/cubic_interpolation.js'

var dispCubicInterpolation = function (elm, platform) {
	const calcCubicInterpolation = function () {
		platform.fit((tx, ty) => {
			let model = new CubicInterpolation()
			model.fit(
				tx.map(v => v[0]),
				ty.map(v => v[0])
			)
			platform.predict((px, cb) => {
				const pred = model.predict(px.map(v => v[0]))
				cb(pred)
			}, 1)
		})
	}

	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcCubicInterpolation)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispCubicInterpolation(platform.setting.ml.configElement, platform)
}