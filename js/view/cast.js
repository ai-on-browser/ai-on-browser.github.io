import CAST from '../../lib/model/cast.js'

var dispCAST = function (elm, platform) {
	platform.setting.ml.reference = {
		author: 'A. Ben-Dor, R. Shamir, Z. Yakhini',
		title: 'Clustering Gene Expression Patterns',
		year: 1999,
	}
	const fitModel = () => {
		const t = +elm.select('[name=t]').property('value')
		const model = new CAST(t)
		model.fit(platform.trainInput)
		const pred = model.predict()
		platform.trainResult = pred.map(v => v + 1)
		elm.select('[name=clusters]').text(model.size)
	}

	elm.append('span').text(' t ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 't')
		.attr('min', 0)
		.attr('max', 1)
		.attr('value', 0.95)
		.attr('step', 0.01)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	elm.append('span').text(' Clusters: ')
	elm.append('span').attr('name', 'clusters')
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	dispCAST(platform.setting.ml.configElement, platform)
}
