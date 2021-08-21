import SoftKMeans from '../model/soft_kmeans.js'

var dispFuzzyCMeans = function (elm, platform) {
	let model = null

	const fitModel = (update, cb) => {
		platform.fit((tx, ty, pred_cb) => {
			if (update) {
				model.fit()
			}
			pred_cb(model.predict().map(v => v + 1))
			platform.centroids(
				model._c,
				model._c.map((c, i) => i + 1),
				{ line: true }
			)
			cb && cb()
		})
	}

	elm.append('span').text('beta')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'b')
		.attr('max', 1000)
		.attr('min', 0)
		.attr('step', 0.1)
		.attr('value', 10)
	const addCentroid = () => {
		model.add()
		elm.select('[name=clusternumber]').text(model._c.length + ' clusters')
		platform.centroids(
			model._c,
			model._c.map((c, i) => i + 1),
			{ line: true }
		)
		fitModel(false)
	}
	const slbConf = platform.setting.ml.controller.stepLoopButtons().init(() => {
		platform.fit((tx, ty) => {
			const b = +elm.select('[name=b]').property('value')
			model = new SoftKMeans(b)
			model.init(tx)
		})
		platform.init()

		addCentroid()
	})
	elm.append('input').attr('type', 'button').attr('value', 'Add centroid').on('click', addCentroid)
	elm.append('span').attr('name', 'clusternumber').style('padding', '0 10px').text('0 clusters')
	slbConf
		.step(cb => {
			fitModel(true, cb)
		})
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.'
	dispFuzzyCMeans(platform.setting.ml.configElement, platform)
}