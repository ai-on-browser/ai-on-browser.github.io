import WeightedKMeans from '../../lib/model/weighted_kmeans.js'
import Controller from '../controller.js'

var dispWKMeans = function (elm, platform) {
	const controller = new Controller(platform)
	let model = null

	elm.append('span').text('beta')
	elm.append('input')
		.attr('name', 'beta')
		.attr('type', 'number')
		.attr('min', 1)
		.attr('max', 10)
		.attr('step', 0.1)
		.attr('value', 2)
	const slbConf = controller.stepLoopButtons().init(() => {
		platform.init()
		const beta = +elm.select('[name=beta]').property('value')
		model = new WeightedKMeans(beta)
		elm.select('[name=clusternumber]').text(model.size + ' clusters')
	})
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Add centroid')
		.on('click', () => {
			platform.fit((tx, ty, pred_cb) => {
				model.add(tx)
				const pred = model.predict(tx)
				pred_cb(pred.map(v => v + 1))
			})
			platform.centroids(
				model.centroids,
				model.centroids.map((c, i) => i + 1),
				{ line: true }
			)
			elm.select('[name=clusternumber]').text(model.size + ' clusters')
		})
	elm.append('span').attr('name', 'clusternumber').style('padding', '0 10px').text('0 clusters')

	slbConf.step(cb => {
		if (model.size === 0) {
			cb && cb()
			return
		}
		platform.fit((tx, ty, pred_cb) => {
			model.fit(
				tx,
				ty.map(v => v[0])
			)
			const pred = model.predict(tx)
			pred_cb(pred.map(v => v + 1))
		})
		platform.centroids(
			model.centroids,
			model.centroids.map((c, i) => i + 1),
			{
				line: true,
				duration: 1000,
			}
		)
		cb && setTimeout(cb, 1000)
	})
	elm.append('input')
		.attr('type', 'button')
		.attr('value', 'Skip')
		.on('click', () => {
			platform.fit((tx, ty, pred_cb) => {
				ty = ty.map(v => v[0])
				while (model.fit(tx, ty) > 1.0e-8);
				const pred = model.predict(tx)
				pred_cb(pred.map(v => v + 1))
			})
			platform.centroids(
				model.centroids,
				model.centroids.map((c, i) => i + 1),
				{
					line: true,
					duration: 1000,
				}
			)
		})
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	dispWKMeans(platform.setting.ml.configElement, platform)
}
