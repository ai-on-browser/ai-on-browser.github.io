import PolynomialInterpolation from '../../lib/model/polynomial_interpolation.js'

var dispPolynomialInterpolation = function (elm, platform) {
	const fitModel = () => {
		platform.fit((tx, ty) => {
			const model = new PolynomialInterpolation()
			model.fit(
				tx.map(v => v[0]),
				ty.map(v => v[0])
			)

			platform.predict((px, pred_cb) => {
				const pred = model.predict(px.map(v => v[0]))
				pred_cb(pred)
			}, 1)
		})
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
