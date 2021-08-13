import InverseSmoothstepInterpolation from '../model/inverse_smoothstep.js'

var dispSmoothstep = function (elm, platform) {
	const calcSmoothstep = function () {
		platform.fit((tx, ty) => {
			const model = new InverseSmoothstepInterpolation()
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

	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcSmoothstep)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispSmoothstep(platform.setting.ml.configElement, platform)
}
