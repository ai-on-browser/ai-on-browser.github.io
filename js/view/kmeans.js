import { KMeans, KMeanspp, KMedoids, KMedians, SemiSupervisedKMeansModel } from '../../lib/model/kmeans.js'
import Controller from '../controller.js'

var dispKMeans = function (elm, platform) {
	const controller = new Controller(platform)
	let model = platform.task === 'SC' ? new SemiSupervisedKMeansModel() : new KMeans()

	const init = () => {
		platform.init()
		if (platform.task !== 'SC') {
			model.clear()
			elm.select('[name=clusternumber]').text(model.size + ' clusters')
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
	if (platform.task !== 'SC') {
		elm.append('select')
			.on('change', function () {
				const slct = d3.select(this)
				slct.selectAll('option')
					.filter(d => d['value'] === slct.property('value'))
					.each(d => (model = new d['class']()))
				init()
			})
			.selectAll('option')
			.data([
				{
					value: 'k-means',
					class: KMeans,
				},
				{
					value: 'k-means++',
					class: KMeanspp,
				},
				{
					value: 'k-medoids',
					class: KMedoids,
				},
				{
					value: 'k-medians',
					class: KMedians,
				},
			])
			.enter()
			.append('option')
			.attr('value', d => d['value'])
			.text(d => d['value'])
		elm.append('input')
			.attr('type', 'button')
			.attr('value', 'Add centroid')
			.on('click', () => {
				model.add(platform.trainInput)
				const pred = model.predict(platform.trainInput)
				platform.trainResult = pred.map(v => v + 1)
				platform.centroids(
					model.centroids,
					model.centroids.map((c, i) => i + 1),
					{ line: true }
				)
				elm.select('[name=clusternumber]').text(model.size + ' clusters')
			})
		elm.append('span').attr('name', 'clusternumber').style('padding', '0 10px').text('0 clusters')
	}
	slbConf.step(cb => {
		if (model.size === 0) {
			cb && cb()
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
			const tx = platform.trainInput
			let ty = platform.trainOutput
			ty = ty.map(v => v[0])
			while (model.fit(tx, ty) > 1.0e-8);
			const pred = model.predict(tx)
			platform.trainResult = platform.task !== 'SC' ? pred.map(v => v + 1) : pred
			platform.centroids(
				model.centroids,
				platform.task !== 'SC' ? model.centroids.map((c, i) => i + 1) : model.categories,
				{
					line: true,
					duration: 1000,
				}
			)
		})
	slbConf.enable = platform.task !== 'SC'
}

export default function (platform) {
	if (platform.task !== 'SC') {
		platform.setting.ml.usage =
			'Click and add data point. Next, select "k-means", "k-means++", "k-medoids" or "k-medians" and click "Add centroid" to add centroid. Finally, click "Step" button repeatedly.'
	} else {
		platform.setting.ml.usage = 'Click and add data point. Then, click "Step" button repeatedly.'
	}
	dispKMeans(platform.setting.ml.configElement, platform)
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
}
