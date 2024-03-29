import YeoJohnson from '../../lib/model/yeo_johnson.js'

var dispYeoJohnson = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Power transform (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Power_transform#Yeo%E2%80%93Johnson_transformation',
	}
	const fitModel = () => {
		const auto = autoCheck.property('checked')
		const h = +lambdaelm.property('value')
		const model = new YeoJohnson(h)
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
	dispYeoJohnson(platform.setting.ml.configElement, platform)
}
