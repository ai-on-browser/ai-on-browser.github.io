import PercentileAnormaly from '../../lib/model/percentile.js'

var dispPercentile = function (elm, platform) {
	const calcPercentile = function () {
		const distribution = elm.select('[name=distribution]').property('value')
		const threshold = +elm.select('[name=threshold]').property('value')
		const model = new PercentileAnormaly(threshold, distribution)
		model.fit(platform.trainInput)
		const outliers = model.predict(platform.trainInput)
		platform.trainResult = outliers
		platform.testResult(model.predict(platform.testInput(1)))
	}

	elm.append('span').text('Distribution ')
	elm.append('select')
		.attr('name', 'distribution')
		.on('change', calcPercentile)
		.selectAll('option')
		.data(['data', 'normal'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('span').text(' threshold = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'threshold')
		.attr('value', 0.02)
		.attr('min', 0)
		.attr('max', 0.5)
		.property('required', true)
		.attr('step', 0.005)
		.on('change', function () {
			calcPercentile()
		})
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcPercentile)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispPercentile(platform.setting.ml.configElement, platform)
}
