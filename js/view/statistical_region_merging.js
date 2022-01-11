import StatisticalRegionMerging from '../../lib/model/statistical_region_merging.js'

var dispSRM = function (elm, platform) {
	const fitModel = () => {
		platform.fit((tx, ty, pred_cb) => {
			const th = +elm.select('[name=threshold]').property('value')
			const model = new StatisticalRegionMerging(th)
			let y = model.predict(tx)
			pred_cb(y.flat())
		}, 2)
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
