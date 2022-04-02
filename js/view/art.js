import ART from '../../lib/model/art.js'

var dispART = function (elm, platform) {
	const fitModel = cb => {
		const t = +elm.select('[name=t]').property('value')
		const model = new ART(t)
		model.fit(platform.trainInput)
		const fpred = model.predict(platform.trainInput)
		platform.trainResult = fpred.map(v => v + 1)
		elm.select('[name=clusters]').text(model.size)

		const ppred = model.predict(platform.testInput(2))
		platform.testResult(ppred.map(v => (v < 0 ? -1 : v + 1)))
		cb && cb()
	}

	elm.append('span').text(' t ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 't')
		.attr('min', 0)
		.attr('max', 100)
		.attr('value', 4)
		.attr('step', 0.1)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	elm.append('span').text(' Clusters: ')
	elm.append('span').attr('name', 'clusters')
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	dispART(platform.setting.ml.configElement, platform)
}
