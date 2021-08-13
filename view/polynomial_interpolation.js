import PolynomialInterpolation from '../model/polynomial_interpolation.js'

var dispPolynomialInterpolation = function (elm, platform) {
	const fitModel = () => {
		platform.fit((tx, ty) => {
			const model = new PolynomialInterpolation()
			model.fit(tx, ty)

			platform.predict((px, pred_cb) => {
				const pred = model.predict(px)
				pred_cb(pred)
			}, 1)
		})
	}

	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispPolynomialInterpolation(platform.setting.ml.configElement, platform)
}
