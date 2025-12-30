import XMeans from '../../lib/model/xmeans.js'

var dispXMeans = (elm, platform) => {
	platform.setting.ml.reference = {
		author: '石岡 恒憲',
		title: 'クラスター数を自動決定するk-meansアルゴリズムの拡張について',
		year: 2000,
	}
	const model = new XMeans()

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
	dispXMeans(platform.setting.ml.configElement, platform)
}
