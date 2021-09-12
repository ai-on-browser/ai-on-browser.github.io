import SOM from '../../lib/model/som.js'

var dispSOM = function (elm, platform) {
	const mode = platform.task
	let model = null

	const fitModel = cb => {
		if (!model) {
			cb && cb()
			return
		}

		if (mode === 'CT') {
			platform.fit((tx, ty, fit_cb) => {
				model.fit(tx)
				const pred = model.predict(tx)
				fit_cb(pred.map(v => v[0] + 1))
				platform.predict((px, pred_cb) => {
					const tilePred = model.predict(px)
					pred_cb(tilePred.map(v => v[0] + 1))
				}, 4)

				platform.centroids(
					model._y,
					model._y.map((v, i) => i + 1)
				)
				cb && cb()
			})
		} else {
			platform.fit((tx, ty, pred_cb) => {
				model.fit(tx)
				const pred = model.predict(tx)

				pred_cb(pred)
				cb && cb()
			})
		}
	}

	elm.append('select')
		.selectAll('option')
		.data([
			{
				value: 'batch',
			},
		])
		.enter()
		.append('option')
		.attr('value', d => d['value'])
		.text(d => d['value'])

	if (mode != 'DR') {
		elm.append('span').text(' Size ')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'resolution')
			.attr('value', 10)
			.attr('min', 1)
			.attr('max', 100)
			.property('required', true)
	} else {
		elm.append('span').text(' Resolution ')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'resolution')
			.attr('max', 100)
			.attr('min', 1)
			.attr('value', 20)
	}
	platform.setting.ml.controller
		.stepLoopButtons()
		.init(() => {
			platform.init()
			if (platform.datas.length === 0) {
				return
			}
			const dim = platform.dimension || 1
			const resolution = +elm.select('[name=resolution]').property('value')

			model = new SOM(2, dim, resolution)
		})
		.step(fitModel)
		.epoch()
}

export default function (platform) {
	platform.setting.ml.usage =
		'Click and add data point. Next, click "Initialize". Finally, click "Fit" button repeatedly.'
	dispSOM(platform.setting.ml.configElement, platform)
}
