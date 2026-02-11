import { KMeans, KMeanspp, KMedians, KMedoids, SemiSupervisedKMeansModel } from '../../lib/model/kmeans.js'
import Controller from '../controller.js'

export default function (platform) {
	if (platform.task !== 'SC') {
		platform.setting.ml.usage =
			'Click and add data point. Next, select "k-means", "k-means++", "k-medoids" or "k-medians" and click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.'
	} else {
		platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	}
	platform.setting.ml.detail = `
$ S_i $ as a set of datas in $ i $th cluster, the objective is to find
$$
  \\argmin_S \\sum_{i=1}^k \\sum_{x \\in S_i} \\| x - \\mu_i \\|^2
$$
where $ \\mu_i $ is the mean of points in $ S_i $.
<br>
The algorithm is simple.
<ol>
<li>Initialize $ \\mu_i $.</li>
<li>Assign the datas to the cluster $ S_i $ with the nearest mean $ \\mu_i $.</li>
<li>Update $ \\mu_i $.
$$
\\mu_i = \\frac{1}{|S_i|} \\sum_{x \\in S_i} x
$$
</li>
<li>Finish if $ \\mu_i $ does not change. Otherwise, go back to step 2.</li>
</ol>
`
	const controller = new Controller(platform)
	let model = platform.task === 'SC' ? new SemiSupervisedKMeansModel() : new KMeans()

	const init = () => {
		platform.init()
		if (platform.task !== 'SC') {
			model.clear()
			clusters.value = `${model.size} clusters`
		} else {
			model.init(
				platform.trainInput,
				platform.trainOutput.map(v => v[0])
			)
			const pred = model.predict(platform.trainInput)
			platform.trainResult = pred
			platform.centroids(model.centroids, model.categories, { line: true })
		}
	}
	const slbConf = controller.stepLoopButtons().init(init)
	let clusters = null
	if (platform.task !== 'SC') {
		const selectClasses = { 'k-means': KMeans, 'k-means++': KMeanspp, 'k-medoids': KMedoids, 'k-medians': KMedians }
		const cls = controller.select(['k-means', 'k-means++', 'k-medoids', 'k-medians']).on('change', () => {
			model = new selectClasses[cls.value]()
			init()
		})
		controller.input.button('Add centroid').on('click', () => {
			model.add(platform.trainInput)
			const pred = model.predict(platform.trainInput)
			platform.trainResult = pred.map(v => v + 1)
			platform.centroids(
				model.centroids,
				model.centroids.map((c, i) => i + 1),
				{ line: true }
			)
			clusters.value = `${model.size} clusters`
		})
		clusters = controller.text('0 clusters')
	}
	slbConf.step(async () => {
		if (model.size === 0) {
			return
		}
		model.fit(
			platform.trainInput,
			platform.trainOutput.map(v => v[0])
		)
		const pred = model.predict(platform.trainInput)
		platform.trainResult = platform.task !== 'SC' ? pred.map(v => v + 1) : pred
		platform.centroids(
			model.centroids,
			platform.task !== 'SC' ? model.centroids.map((c, i) => i + 1) : model.categories,
			{ line: true, duration: 1000 }
		)
		await new Promise(resolve => setTimeout(resolve, 1000))
	})
	controller.input.button('Skip').on('click', () => {
		const tx = platform.trainInput
		let ty = platform.trainOutput
		ty = ty.map(v => v[0])
		while (model.fit(tx, ty) > 1.0e-8);
		const pred = model.predict(tx)
		platform.trainResult = platform.task !== 'SC' ? pred.map(v => v + 1) : pred
		platform.centroids(
			model.centroids,
			platform.task !== 'SC' ? model.centroids.map((c, i) => i + 1) : model.categories,
			{ line: true, duration: 1000 }
		)
	})
	slbConf.enable = platform.task !== 'SC'
}
