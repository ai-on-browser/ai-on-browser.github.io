import SplitAndMerge from '../../lib/model/split_merge.js'
import Controller from '../controller.js'

export default function (platform) {
	platform.setting.ml.usage = 'Click "Fit" button.'
	platform.setting.ml.reference = {
		title: 'Split and merge segmentation (Wikipedia)',
		url: 'https://en.wikipedia.org/wiki/Split_and_merge_segmentation',
	}
	const controller = new Controller(platform)
	const fitModel = () => {
		const model = new SplitAndMerge(method.value, threshold.value)
		const orgStep = platform._step
		platform._step = 4
		const y = model.predict(platform.trainInput)
		platform.trainResult = y.flat()
		platform._step = orgStep
	}

	const method = controller.select(['uniformity', 'variance'])
	const threshold = controller.input
		.number({ label: ' threshold = ', min: 0, max: 100, step: 0.1, value: 10 })
		.on('change', fitModel)
	controller.input.button('Fit').on('click', fitModel)
}
