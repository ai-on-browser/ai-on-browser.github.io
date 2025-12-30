import GMeans from '../../lib/model/gmeans.js'

var dispGMeans = (elm, platform) => {
	const model = new GMeans()

	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Step')
		.on('click', () => {
			model.fit(platform.trainInput, 1)
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
	dispGMeans(platform.setting.ml.configElement, platform)
}
