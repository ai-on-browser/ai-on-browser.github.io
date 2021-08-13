import { SplineInterpolation } from '../model/spline_interpolation.js'

var dispSI = function (elm, platform) {
	const calcLerp = function () {
		platform.fit((tx, ty) => {
			let model = new SplineInterpolation()
			const data = tx.map(v => v[0])
			model.fit(
				data,
				ty.map(v => v[0])
			)
			platform.predict((px, cb) => {
				const pred = model.predict(px.map(v => v[0]))
				cb(pred)
			}, 1)
		})
	}

	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcLerp)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispSI(platform.setting.ml.configElement, platform)
}
