import Mountain from '../../lib/model/mountain.js'

var dispMountain = function (elm, platform) {
	let model = null

	const fitModel = cb => {
		const r = +elm.select('[name=resolution]').property('value')
		const alpha = +elm.select('[name=alpha]').property('value')
		const beta = +elm.select('[name=beta]').property('value')
		if (!model) {
			model = new Mountain(r, alpha, beta)
			model.init(platform.trainInput)
		}
		model.fit()
		const pred = model.predict(platform.trainInput)
		platform.trainResult = pred.map(v => v + 1)
		platform.testResult(model.predict(platform.testInput(4)).map(v => v + 1))

		elm.select('[name=clusters]').text(model._centroids.length)
		platform.centroids(
			model._centroids,
			model._centroids.map((v, i) => i + 1)
		)
		cb && cb()
	}

	elm.append('span').text(' resolution ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'resolution')
		.attr('min', 1)
		.attr('max', 1000)
		.attr('value', 100)
	elm.append('span').text(' alpha ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'alpha')
		.attr('min', 0)
		.attr('max', 100)
		.attr('step', 0.1)
		.attr('value', 5.4)
	elm.append('span').text(' beta ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'beta')
		.attr('min', 1)
		.attr('max', 100)
		.attr('step', 0.1)
		.attr('value', 5.4)
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Initialize')
		.on('click', () => {
			model = null
			elm.select('[name=clusters]').text(0)
			platform.init()
		})
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Step')
		.on('click', () => {
			fitModel()
		})
	elm.append('span').text(' Clusters: ')
	elm.append('span').attr('name', 'clusters')
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	dispMountain(platform.setting.ml.configElement, platform)
}
