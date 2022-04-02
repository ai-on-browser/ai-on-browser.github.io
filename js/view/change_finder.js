import ChangeFinder from '../../lib/model/change_finder.js'

var dispChangeFinder = function (elm, platform) {
	let model = null

	const fitModel = (doFit = true) => {
		const method = +elm.select('[name=method]').property('value')
		const p = +elm.select('[name=p]').property('value')
		const r = +elm.select('[name=r]').property('value')
		const smooth = +elm.select('[name=smooth]').property('value')
		const threshold = +elm.select('[name=threshold]').property('value')
		if (!model || doFit) {
			model = new ChangeFinder(p, r, smooth)
			const tx = platform.trainInput.map(v => v[0])
			model.fit(tx)
		}
		const pred = model.predict()
		platform.trainResult = pred
		platform._plotter.threshold = threshold
	}

	elm.append('select')
		.attr('name', 'method')
		.selectAll('option')
		.data(['sdar'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	elm.append('span').text('p')
	elm.append('input').attr('type', 'number').attr('name', 'p').attr('min', 1).attr('max', 1000).attr('value', 2)
	elm.append('span').text('r')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'r')
		.attr('min', 0)
		.attr('max', 1)
		.attr('value', 0.5)
		.attr('step', 0.1)
	elm.append('span').text('smooth')
	elm.append('input').attr('type', 'number').attr('name', 'smooth').attr('min', 1).attr('max', 100).attr('value', 10)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	elm.append('span').text(' threshold = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'threshold')
		.attr('value', 0.8)
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
		.on('change', () => {
			fitModel(false)
		})
}

export default function (platform) {
	platform.setting.ml.draft = true
	platform.setting.ml.usage = 'Click and add data point. Click "fit" to update.'
	dispChangeFinder(platform.setting.ml.configElement, platform)
}
