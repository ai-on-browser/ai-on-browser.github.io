import TrigonometricInterpolation from '../model/trigonometric_interpolation.js'

var dispTrigonometric = function (elm, platform) {
	const calcTrigonometric = function () {
		platform.fit((tx, ty) => {
			const model = new TrigonometricInterpolation()
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

	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcTrigonometric)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispTrigonometric(platform.setting.ml.configElement, platform)
}
