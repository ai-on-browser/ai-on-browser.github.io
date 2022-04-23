import BIRCH from '../../lib/model/birch.js'

var dispBIRCH = function (elm, platform) {
	const fitModel = () => {
		const b = +elm.select('[name=b]').property('value')
		const t = +elm.select('[name=t]').property('value')
		const l = +elm.select('[name=l]').property('value')
		const model = new BIRCH(null, b, t, l)
		model.fit(platform.trainInput)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		elm.select('[name=clusters]').text(new Set(pred).size)
	}

	elm.append('span').text(' b ')
	elm.append('input').attr('type', 'number').attr('name', 'b').attr('min', 2).attr('max', 1000).attr('value', 10)
	elm.append('span').text(' t ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 't')
		.attr('min', 0.01)
		.attr('max', 10)
		.attr('step', 0.01)
		.attr('value', 0.2)
	elm.append('span').text(' l ')
	elm.append('input').attr('type', 'number').attr('name', 'l').attr('min', 2).attr('max', 10000).attr('value', 10000)
	elm.append('span').text(' sub algorithm ')
	elm.append('select')
		.attr('name', 'subalgo')
		.selectAll('option')
		.data(['none'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	const stepButton = elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	elm.append('span').text(' Clusters: ')
	elm.append('span').attr('name', 'clusters')
	return () => {}
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Fit" button.'
	platform.setting.terminate = dispBIRCH(platform.setting.ml.configElement, platform)
}
