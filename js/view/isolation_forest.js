import IsolationForest from '../../lib/model/isolation_forest.js'

var dispIsolationForest = function (elm, platform) {
	let model = null

	const calcIsolationForest = function () {
		platform.fit((tx, ty, cb) => {
			const tree_num = +elm.select('input[name=tree_num]').property('value')
			const srate = +elm.select('input[name=srate]').property('value')
			const threshold = +elm.select('input[name=threshold]').property('value')
			model = new IsolationForest(tx, tree_num, srate, threshold)
			model.fit(tx)
			const outliers = model.predict(tx).map(v => v > threshold)
			cb(outliers)
			platform.predict((px, pred_cb) => {
				const outlier_tiles = model.predict(px).map(v => v > threshold)
				pred_cb(outlier_tiles)
			}, 3)
		})
	}

	elm.append('span').text(' Tree #')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'tree_num')
		.property('value', 100)
		.attr('min', 1)
		.attr('max', 1000)
	elm.append('span').text(' Sampling rate ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'srate')
		.property('value', 0.6)
		.attr('min', 0.1)
		.attr('max', 1)
		.attr('step', 0.1)
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcIsolationForest)
	elm.append('span').text(' threshold = ')
	elm.append('input')
		.attr('type', 'number')
		.attr('name', 'threshold')
		.attr('value', 0.5)
		.attr('min', 0)
		.attr('max', 1)
		.property('required', true)
		.attr('step', 0.01)
		.on('change', () => {
			platform.fit((tx, ty, cb) => {
				const threshold = +elm.select('input[name=threshold]').property('value')
				const outliers = model.predict(tx).map(v => v > threshold)
				cb(outliers)
				platform.predict((px, pred_cb) => {
					const outlier_tiles = model.predict(px).map(v => v > threshold)
					pred_cb(outlier_tiles)
				}, 3)
			})
		})
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispIsolationForest(platform.setting.ml.configElement, platform)
}
