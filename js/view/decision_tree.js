import { DecisionTreeClassifier, DecisionTreeRegression } from '../../lib/model/decision_tree.js'
import Matrix from '../../lib/util/matrix.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click and add data point. Next, click "Initialize". Finally, click "Separate".'
	platform.setting.ml.reference = {
		title: 'Decision tree (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Decision_tree',
	}
	const controller = new Controller(platform)
	const mode = platform.task
	let tree = null

	const dispRange = () => {
		if (platform.task === 'FS') {
			const importance = tree.importance().map((v, i) => [v, i])
			importance.sort((a, b) => b[0] - a[0])
			const tdim = platform.dimension
			const idx = importance.map(i => i[1]).slice(0, tdim)
			const x = Matrix.fromArray(platform.trainInput)
			platform.trainResult = x.col(idx).toArray()
		} else if (platform.datas.dimension <= 2) {
			const pred = tree.predict(platform.testInput(platform.datas.dimension === 1 ? 0.1 : 1))
			platform.testResult(pred)
		} else {
			const pred = tree.predict(platform.testInput(2))
			platform.testResult(pred)
		}
	}

	const methods = mode === 'CF' ? ['CART', 'ID3'] : ['CART']
	const method = controller.select(methods)
	controller.input.button('Initialize').on('click', () => {
		if (mode === 'CF') {
			tree = new DecisionTreeClassifier(method.value)
		} else {
			tree = new DecisionTreeRegression()
		}
		tree.init(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		dispRange()

		depth.value = tree.depth
	})
	controller.input.button('Separate').on('click', () => {
		if (!tree) {
			return
		}
		tree.fit()

		dispRange()

		depth.value = tree.depth
	})
	const depth = controller.text('0')
	controller.text(' depth ')
}
