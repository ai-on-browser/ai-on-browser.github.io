import NadarayaWatson from '../../lib/model/nadaraya_watson.js'

var dispNadarayaWatson = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Kernel regression (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Kernel_regression#Nadaraya%E2%80%93Watson_kernel_regression',
	}
	const fitModel = cb => {
		const s = +sgm.property('value')
		const auto = autoCheck.property('checked')
		const model = new NadarayaWatson(auto ? null : s)
		model.fit(platform.trainInput, platform.trainOutput)
		if (auto) {
			sgm.property('value', model._s)
		}

		const pred = model.predict(platform.testInput(10))
		platform.testResult(pred)
	}

	elm.append('span').text('auto')
	const autoCheck = elm
		.append('input')
		.attr('type', 'checkbox')
		.attr('name', 'auto')
		.property('checked', true)
		.on('change', () => {
			sgm.property('disabled', autoCheck.property('checked'))
		})
	const sgm = elm
		.append('input')
		.attr('type', 'number')
		.attr('name', 'sigma')
		.attr('min', 0)
		.attr('value', 0.1)
		.attr('step', 0.01)
		.property('disabled', true)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispNadarayaWatson(platform.setting.ml.configElement, platform)
}
