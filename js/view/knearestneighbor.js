import {
	KNN,
	KNNRegression,
	KNNAnomaly,
	KNNDensityEstimation,
	SemiSupervisedKNN,
} from '../../lib/model/knearestneighbor.js'
import { specialCategory } from '../utils.js'

var dispKNN = function (elm, platform) {
	const mode = platform.task
	let checkCount = 5

	const calcKnn = function () {
		const metric = elm.select('[name=metric]').property('value')
		if (mode === 'CF') {
			if (platform.datas.length === 0) {
				return
			}
			let model = new KNN(checkCount, metric)
			model.fit(
				platform.trainInput,
				platform.trainOutput.map(v => v[0])
			)
			const pred = model.predict(platform.testInput(4))
			platform.testResult(pred)
		} else if (mode === 'RG') {
			const dim = platform.datas.dimension
			let model = new KNNRegression(checkCount, metric)
			model.fit(
				platform.trainInput,
				platform.trainOutput.map(v => v[0])
			)

			let p = model.predict(platform.testInput(dim === 1 ? 1 : 4))

			platform.testResult(p)
		} else if (mode === 'AD') {
			const model = new KNNAnomaly(checkCount + 1, metric)
			model.fit(platform.trainInput)

			const threshold = +elm.select('[name=threshold]').property('value')
			const outliers = model.predict(platform.trainInput).map(p => p > threshold)
			platform.trainResult = outliers
		} else if (mode === 'DE') {
			const model = new KNNDensityEstimation(checkCount + 1, metric)
			model.fit(platform.trainInput)

			const pred = model.predict(platform.testInput(5))
			const min = Math.min(...pred)
			const max = Math.max(...pred)
			platform.testResult(pred.map(v => specialCategory.density((v - min) / (max - min))))
		} else if (mode === 'CP') {
			const model = new KNNAnomaly(checkCount + 1, metric)
			const d = +elm.select('[name=window]').property('value')
			const data = platform.trainInput.rolling(d)
			model.fit(data)

			const threshold = +elm.select('[name=threshold]').property('value')
			const pred = model.predict(data)
			for (let i = 0; i < d / 2; i++) {
				pred.unshift(0)
			}
			platform.trainResult = pred
			platform._plotter.threshold = threshold
		} else if (mode === 'SC') {
			const model = new SemiSupervisedKNN(checkCount, metric)
			model.fit(
				platform.trainInput,
				platform.trainOutput.map(v => v[0])
			)
			platform.trainResult = model.predict()
		} else if (mode === 'IN') {
			let model = new KNNRegression(1, 'euclid')
			model.fit(
				platform.trainInput,
				platform.trainOutput.map(v => v[0])
			)

			let p = model.predict(platform.testInput(1))

			platform.testResult(p)
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
