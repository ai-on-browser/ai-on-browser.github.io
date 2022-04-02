import SezanThresholding from '../../lib/model/sezan.js'

var dispSezan = function (elm, platform) {
	platform.colorSpace = 'gray'
	const fitModel = () => {
		const orgStep = platform._step
		platform._step = 1
		const gamma = +elm.select('[name=gamma]').property('value')
		const sigma = +elm.select('[name=sigma]').property('value')
		const model = new SezanThresholding(gamma, sigma)
		let y = model.predict(platform.trainInput.flat(2))
		elm.select('[name=threshold]').text(model._th)
		platform.trainResult = y.map(v => specialCategory.density(1 - v))
		platform._step = orgStep
	}

	elm.append('span').text(' gamma ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'gamma')
		.attr('value', 0.5)
		.attr('min', 0)
		.attr('max', 1)
		.attr('step', 0.1)
		.on('change', fitModel)
	elm.append('span').text(' sigma ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'sigma')
		.attr('value', 5)
		.attr('min', 0)
		.attr('max', 10)
		.attr('step', 0.1)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
	elm.append('span').text(' Estimated threshold ')
	elm.append('span').attr('name', 'threshold')
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispSezan(platform.setting.ml.configElement, platform)
}
