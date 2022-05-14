import {
	KNN,
	KNNRegression,
	KNNAnomaly,
	KNNDensityEstimation,
	SemiSupervisedKNN,
} from '../../lib/model/knearestneighbor.js'
import Controller from '../controller.js'
import { specialCategory } from '../utils.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Then, click "Calculate".'
	const controller = new Controller(platform)
	const mode = platform.task
	let checkCount = 5

	const calcKnn = function () {
		if (mode === 'CF') {
			if (platform.datas.length === 0) {
				return
			}
			let model = new KNN(checkCount, metric.value)
			model.fit(
				platform.trainInput,
				platform.trainOutput.map(v => v[0])
			)
			const pred = model.predict(platform.testInput(4))
			platform.testResult(pred)
		} else if (mode === 'RG') {
			const dim = platform.datas.dimension
			let model = new KNNRegression(checkCount, metric.value)
			model.fit(
				platform.trainInput,
				platform.trainOutput.map(v => v[0])
			)

			let p = model.predict(platform.testInput(dim === 1 ? 1 : 4))

			platform.testResult(p)
		} else if (mode === 'AD') {
			const model = new KNNAnomaly(checkCount + 1, metric.value)
			model.fit(platform.trainInput)

			const outliers = model.predict(platform.trainInput).map(p => p > threshold.value)
			platform.trainResult = outliers
		} else if (mode === 'DE') {
			const model = new KNNDensityEstimation(checkCount + 1, metric.value)
			model.fit(platform.trainInput)

			const pred = model.predict(platform.testInput(5))
			const min = Math.min(...pred)
			const max = Math.max(...pred)
			platform.testResult(pred.map(v => specialCategory.density((v - min) / (max - min))))
		} else if (mode === 'CP') {
			const model = new KNNAnomaly(checkCount + 1, metric.value)
			const data = platform.trainInput.rolling(window.value)
			model.fit(data)

			const pred = model.predict(data)
			for (let i = 0; i < window.value / 2; i++) {
				pred.unshift(0)
			}
			platform.trainResult = pred
			platform._plotter.threshold = threshold.value
		} else if (mode === 'SC') {
			const model = new SemiSupervisedKNN(checkCount, metric.value)
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

	const metric = controller.select(['euclid', 'manhattan', 'chebyshev'])
	if (mode !== 'IN') {
		const k = controller.input.number({ label: ' k = ', min: 1, max: 100, value: checkCount }).on('change', () => {
			checkCount = k.value
		})
	}
	let window = null
	if (mode === 'CP') {
		window = controller.input.number({ label: ' window = ', min: 1, max: 100, value: 10 }).on('change', () => {
			calcKnn()
		})
	}
	let threshold = null
	if (mode === 'AD' || mode === 'CP') {
		threshold = controller.input
			.number({ label: ' threshold = ', min: 0.001, max: 10, step: 0.001, value: mode === 'AD' ? 0.05 : 0.4 })
			.on('change', function () {
				calcKnn()
			})
	}
	controller.input.button('Calculate').on('click', calcKnn)
}
