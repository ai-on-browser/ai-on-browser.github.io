import LBG from '../../lib/model/lbg.js'

var dispLBG = function (elm, platform) {
	platform.setting.ml.reference = {
		title: 'Linde-Buzo-Gray algorithm (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Linde%E2%80%93Buzo%E2%80%93Gray_algorithm',
	}
	const model = new LBG()

	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Step')
		.on('click', () => {
			model.fit(platform.trainInput)
			const pred = model.predict(platform.trainInput)
			platform.trainResult = pred.map(v => v + 1)
			platform.centroids(
				model.centroids,
				model.centroids.map((c, i) => i + 1),
				{
					line: true,
				}
			)
			elm.select('[name=clusternumber]').text(model.size + ' clusters')
		})
	elm.append('span').attr('name', 'clusternumber').style('padding', '0 10px').text('0 clusters')
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Clear centroid')
		.on('click', () => {
			model.clear()
			platform.init()
			elm.select('[name=clusternumber]').text(model.size + ' clusters')
		})
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	dispLBG(platform.setting.ml.configElement, platform)
}
