import JeoJohnson from '../model/yeo_johnson.js'

var dispJeoJohnson = function (elm, platform) {
	const fitModel = () => {
		const auto = autoCheck.property('checked')
		const h = +lambdaelm.property('value')
		const model = new JeoJohnson(h)
		platform.fit((tx, ty, pred_cb) => {
			if (auto) {
				model.fit(ty)
				lambdaelm.property('value', model._lambda[0])
			}
			pred_cb(model.predict(ty))
		})
	}
	elm.append('span').text('lambda')
	const autoCheck = elm
		.append('input')
		.attr('type', 'checkbox')
		.attr('name', 'auto')
		.attr('title', 'auto')
		.property('checked', true)
		.on('change', () => {
			lambdaelm.property('disabled', autoCheck.property('checked'))
		})
	const lambdaelm = elm
		.append('input')
		.attr('type', 'number')
		.attr('name', 'lambd')
		.attr('value', 0.1)
		.attr('step', 0.1)
		.property('disabled', true)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispJeoJohnson(platform.setting.ml.configElement, platform)
}
