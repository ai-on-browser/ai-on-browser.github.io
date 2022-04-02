import KernelDensityEstimator from '../../lib/model/kernel_density_estimator.js'

var dispKernelDensityEstimator = function (elm, platform) {
	const fitModel = cb => {
		const kernel = elm.select('[name=kernel]').property('value')
		const auto = autoCheck.property('checked')
		const h = helm.property('value')
		const model = new KernelDensityEstimator(kernel)
		model.fit(platform.trainInput, auto ? 0 : h)
		helm.property('value', model._h)

		const pred = model.predict(platform.testInput(8))
		if (platform.task === 'DE') {
			const min = Math.min(...pred)
			const max = Math.max(...pred)
			platform.testResult(pred.map(v => specialCategory.density((v - min) / (max - min))))
		} else {
			const th = +elm.select('[name=threshold]').property('value')
			const y = model.predict(platform.trainInput)
			platform.trainResult = y.map(v => v < th)
			platform.testResult(pred.map(v => v < th))
		}
	}

	elm.append('select')
		.attr('name', 'kernel')
		.selectAll('option')
		.data(['gaussian', 'rectangular', 'triangular', 'epanechnikov', 'biweight', 'triweight'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('span').text('auto')
	const autoCheck = elm
		.append('input')
		.attr('type', 'checkbox')
		.attr('name', 'auto')
		.property('checked', true)
		.on('change', () => {
			helm.property('disabled', autoCheck.property('checked'))
		})
	const helm = elm
		.append('input')
		.attr('type', 'number')
		.attr('name', 'h')
		.attr('min', 0)
		.attr('value', 0.1)
		.attr('step', 0.01)
		.property('disabled', true)
	if (platform.task === 'AD') {
		elm.append('span').text(' threshold = ')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'threshold')
			.attr('value', 0.3)
			.attr('min', 0)
			.attr('max', 10)
			.attr('step', 0.01)
			.on('change', fitModel)
	}
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Fit')
		.on('click', () => fitModel())
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Fit" button.'
	dispKernelDensityEstimator(platform.setting.ml.configElement, platform)
}
