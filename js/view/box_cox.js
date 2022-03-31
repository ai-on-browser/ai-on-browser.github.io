import BoxCox from '../../lib/model/box_cox.js'

var dispBoxCox = function (elm, platform) {
	const fitModel = () => {
		const auto = autoCheck.property('checked')
		const h = +lambdaelm.property('value')
		const model = new BoxCox(h)
		if (auto) {
			model.fit(platform.trainOutput)
			lambdaelm.property('value', model._lambda[0])
		}
		platform.trainResult = model.predict(platform.trainOutput)
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
	dispBoxCox(platform.setting.ml.configElement, platform)
}
