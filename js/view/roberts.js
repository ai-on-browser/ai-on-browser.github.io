import RobertsCross from '../../lib/model/roberts.js'

var dispRobertsCross = (elm, platform) => {
	platform.setting.ml.reference = {
		title: 'Roberts cross (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Roberts_cross',
	}
	platform.colorSpace = 'gray'
	const fitModel = () => {
		const orgStep = platform._step
		platform._step = 1
		const tx = platform.trainInput
		const th = +elm.select('[name=th]').property('value')
		const model = new RobertsCross(th)
		for (let i = 0; i < tx.length; i++) {
			for (let j = 0; j < tx[i].length; j++) {
				tx[i][j] = tx[i][j].reduce((s, v) => s + v, 0) / tx[i][j].length
			}
		}
		const y = model.predict(tx)
		platform.trainResult = y.flat()
		platform._step = orgStep
	}

	elm.append('span').text(' threshold ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'th')
		.attr('value', 50)
		.attr('min', 0)
		.attr('max', 200)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispRobertsCross(platform.setting.ml.configElement, platform)
}
