import Canny from '../../lib/model/canny.js'

var dispCanny = function (elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		const th1 = +elm.select('[name=th1]').property('value')
		const th2 = +elm.select('[name=th2]').property('value')
		const orgStep = platform._step
		platform._step = 1
		const tx = platform.trainInput
		const model = new Canny(th1, th2)
		for (let i = 0; i < tx.length; i++) {
			for (let j = 0; j < tx[i].length; j++) {
				tx[i][j] = tx[i][j].reduce((s, v) => s + v, 0) / tx[i][j].length
			}
		}
		let y = model.predict(tx)
		platform.trainResult = y.flat()
		platform._step = orgStep
	}

	elm.append('span').text(' big threshold ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'th1')
		.attr('value', 200)
		.attr('min', 0)
		.attr('max', 255)
		.on('change', fitModel)
	elm.append('span').text(' small threshold ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'th2')
		.attr('value', 80)
		.attr('min', 0)
		.attr('max', 255)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispCanny(platform.setting.ml.configElement, platform)
}
