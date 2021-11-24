import {
	KNN,
	KNNRegression,
	KNNAnomaly,
	KNNDensityEstimation,
	SemiSupervisedKNN,
} from '../../lib/model/knearestneighbor.js'

var dispKNN = function (elm, platform) {
	const mode = platform.task
	let checkCount = 5

	const calcKnn = function () {
		const metric = elm.select('[name=metric]').property('value')
		if (mode === 'CF') {
			if (platform.datas.length === 0) {
				return
			}
			platform.fit((tx, ty) => {
				let model = new KNN(checkCount, metric)
				model.fit(
					tx,
					ty.map(v => v[0])
				)
				platform.predict((px, pred_cb) => {
					const pred = model.predict(px)
					pred_cb(pred)
				}, 4)
			})
		} else if (mode === 'RG') {
			const dim = platform.datas.dimension
			platform.fit((tx, ty) => {
				let model = new KNNRegression(checkCount, metric)
				model.fit(
					tx,
					ty.map(v => v[0])
				)

				platform.predict(
					(px, pred_cb) => {
						let p = model.predict(px)

						pred_cb(p)
					},
					dim === 1 ? 1 : 4
				)
			})
		} else if (mode === 'AD') {
			platform.fit((tx, ty, cb) => {
				const model = new KNNAnomaly(checkCount + 1, metric)
				model.fit(tx)

				const threshold = +elm.select('[name=threshold]').property('value')
				const outliers = model.predict(tx).map(p => p > threshold)
				cb(outliers)
			})
		} else if (mode === 'DE') {
			platform.fit((tx, ty) => {
				const model = new KNNDensityEstimation(checkCount + 1, metric)
				model.fit(tx)

				platform.predict((px, cb) => {
					const pred = model.predict(px)
					const min = Math.min(...pred)
					const max = Math.max(...pred)
					cb(pred.map(v => specialCategory.density((v - min) / (max - min))))
				}, 5)
			})
		} else if (mode === 'CP') {
			platform.fit((tx, ty, cb) => {
				const model = new KNNAnomaly(checkCount + 1, metric)
				const d = +elm.select('[name=window]').property('value')
				const data = tx.rolling(d)
				model.fit(data)

				const threshold = +elm.select('[name=threshold]').property('value')
				const pred = model.predict(data)
				for (let i = 0; i < d / 2; i++) {
					pred.unshift(0)
				}
				cb(pred, threshold)
			})
		} else if (mode === 'SC') {
			platform.fit((tx, ty, cb) => {
				const model = new SemiSupervisedKNN(checkCount, metric)
				model.fit(
					tx,
					ty.map(v => v[0])
				)
				cb(model.predict())
			})
		} else if (mode === 'IN') {
			platform.fit((tx, ty) => {
				let model = new KNNRegression(1, 'euclid')
				model.fit(
					tx,
					ty.map(v => v[0])
				)

				platform.predict((px, pred_cb) => {
					let p = model.predict(px)

					pred_cb(p)
				}, 1)
			})
		}
	}

	elm.append('select')
		.attr('name', 'metric')
		.selectAll('option')
		.data(['euclid', 'manhattan', 'chebyshev'])
		.enter()
		.append('option')
		.attr('value', d => d)
		.text(d => d)
	if (mode !== 'IN') {
		elm.append('span').text(' k = ')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'k')
			.attr('value', checkCount)
			.attr('min', 1)
			.attr('max', 100)
			.property('required', true)
			.on('change', function () {
				checkCount = +elm.select('[name=k]').property('value')
			})
	}
	if (mode === 'CP') {
		elm.append('span').text(' window = ')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'window')
			.attr('value', 10)
			.attr('min', 1)
			.attr('max', 100)
			.on('change', function () {
				calcKnn()
			})
	}
	if (mode === 'AD' || mode === 'CP') {
		elm.append('span').text(' threshold = ')
		elm.append('input')
			.attr('type', 'number')
			.attr('name', 'threshold')
			.attr('value', mode === 'AD' ? 0.05 : 0.4)
			.attr('min', 0.001)
			.attr('max', 10)
			.property('required', true)
			.attr('step', 0.001)
			.on('change', function () {
				calcKnn()
			})
	}
	elm.append('input').attr('type', 'button').attr('value', 'Calculate').on('click', calcKnn)
}

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	dispKNN(platform.setting.ml.configElement, platform)
}
