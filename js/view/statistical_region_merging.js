import StatisticalRegionMerging from '../../lib/model/statistical_region_merging.js'

var dispSRM = function (elm, platform) {
	const fitModel = () => {
		const th = +elm.select('[name=threshold]').property('value')
		const model = new StatisticalRegionMerging(th)
		const orgStep = platform._step
		platform._step = 2
		let y = model.predict(platform.trainInput)
		platform.trainResult = y.flat()
		platform._step = orgStep
	}

	elm.append('span').text(' threshold = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'threshold')
		.attr('value', 5)
		.attr('min', 0)
		.attr('max', 256)
		.attr('step', 0.1)
		.on('change', fitModel)
	elm.append('input').attr('type', 'button').attr('value', 'Fit').on('click', fitModel)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	dispSRM(platform.setting.ml.configElement, platform)
}
