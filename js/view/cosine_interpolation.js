import CosineInterpolation from '../../lib/model/cosine_interpolation.js'

var dispCosineInterpolation = function (elm, platform) {
	const calcCosineInterpolation = function () {
		platform.fit((tx, ty) => {
			let model = new CosineInterpolation()
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

	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcCosineInterpolation)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispCosineInterpolation(platform.setting.ml.configElement, platform)
}
