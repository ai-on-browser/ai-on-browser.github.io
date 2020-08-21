
let ai_platform = null;

const AIMode = {
	"CT": "Clustering",
	"CF": "Classification",
	"SC": "Semi-supervised Classification",
	"RG": "Regression",
	"AD": "Anomaly Detection",
	"DR": "Dimention Reduction",
	"GR": "Generate",
	"DE": "Dencity Estimation",
	"MD": "Markov Decision Process",
	"SM": "Smoothing",
	"TP": "Timeseries Prediction",
	"CP": "Change Point Detection",
	"MV": "Missing Value Completion",
	"IP": "Image Processing",
	"NL": "Natural Language Processing",
};

Vue.component('model-selector', {
	data: function() {
		return {
			aiMethods: [
				{
					group: "CT",
					methods: [
						{ value: "kmeans", title: "K-Means" },
						{ value: "xmeans", title: "X-Means" },
						{ value: "hierarchy", title: "Hierarchy" },
						{ value: "mean_shift", title: "Mean Shift" },
						{ value: "dbscan", title: "DBSCAN" },
						{ value: "optics", title: "OPTICS" },
						{ value: "clarans", title: "CLARANS" },
						{ value: "birch", title: "BIRCH" },
						//{ value: "sting", title: "STING" },
						{ value: "gmm", title: "Gaussian mixture model" },
						{ value: "affinity_propagation", title: "Affinity Propagation" },
						{ value: "spectral", title: "Spectral clustering" },
						{ value: "som", title: "Self-organizing map" },
						{ value: "neural_gas", title: "Neural Gas" },
						{ value: "autoencoder", title: "Autoencoder" },
					]
				},
				{
					group: "CF",
					methods: [
						{ value: "linear_discriminant", title: "Linear Discriminant" },
						{ value: "quadratic_discriminant", title: "Quadratic Discriminant" },
						{ value: "naive_bayes", title: "Naive Bayes" },
						{ value: "knearestneighbor", title: "k nearest neighbor" },
						{ value: "nearest_centroid", title: "Nearest Centroid" },
						{ value: "decision_tree", title: "Decision Tree" },
						{ value: "random_forest", title: "Random Forest" },
						{ value: "passive_aggressive", title: "Passive Aggressive" },
						{ value: "arow", title: "AROW" },
						{ value: "logistic", title: "Multinomial logistic regression" },
						{ value: "svm", title: "Support vector machine" },
						{ value: "gaussian_process", title: "Gaussian Process" },
						{ value: "mlp", title: "Multi-layer perceptron" },
					]
				},
				{
					group: "RG",
					methods: [
						{ value: "linear_regression", title: "Linear" },
						{ value: "polynomial", title: "Polynomial" },
						{ value: "ridge", title: "Ridge" },
						{ value: "lasso", title: "Lasso" },
						{ value: "elastic_net", title: "Elastic Net" },
						{ value: "gaussian_process", title: "Gaussian Process" },
						{ value: "pcr", title: "Principal Components" },
						{ value: "pls", title: "Partial Least Squares" },
						{ value: "knearestneighbor", title: "k nearest neignbor" },
						{ value: "decision_tree", title: "Decision Tree" },
						{ value: "random_forest", title: "Random Forest" },
						//{ value: "svm", title: "Support vector regression" },
						{ value: "mlp", title: "Multi-layer perceptron" },
					]
				},
				{
					group: "AD",
					methods: [
						{ value: "percentile", title: "Percentile" },
						{ value: "mt", title: "MT" },
						{ value: "mcd", title: "MCD" },
						{ value: "knearestneighbor", title: "k nearest neighbor" },
						{ value: "lof", title: "LOF" },
						//{ value: "svm", title: "One class SVM" },
						{ value: "gmm", title: "Gaussian mixture model" },
						{ value: "isolation_forest", title: "Isolation Forest" },
						{ value: "autoencoder", title: "Autoencoder" },
					]
				},
				{
					group: "DR",
					methods: [
						{ value: "random_projection", title: "Random projection" },
						{ value: "pca", title: "PCA" },
						{ value: "lsa", title: "LSA" },
						{ value: "mds", title: "MDS" },
						{ value: "lda", title: "Linear Discriminant Analysis" },
						//{ value: "ica", title: "ICA" },
						{ value: "lle", title: "LLE" },
						{ value: "tsne", title: "t-SNE" },
						{ value: "som", title: "Self-organizing map" },
						{ value: "autoencoder", title: "Autoencoder" },
						{ value: "vae", title: "VAE" },
					]
				},
				{
					group: "DE",
					methods: [
						{ value: "histogram", title: "Histogram" },
						{ value: "kernel_density_estimator", title: "Kernel Density Estimator" },
						{ value: "gmm", title: "Gaussian mixture model" },
					]
				},
				{
					group: "GR",
					methods: [
						{ value: "vae", title: "VAE" },
						{ value: "gan", title: "GAN" },
					]
				},
				{
					group: "MD",
					methods: [
						{ value: "dynamic_programming", title: "DP" },
						{ value: "monte_carlo", title: "MC" },
						{ value: "q_learning", title: "Q Learning" },
						{ value: "sarsa", title: "SARSA" },
						{ value: "policy_gradient", title: "Policy Gradient" },
						{ value: "dqn", title: "DQN" },
						{ value: "genetic_algorithm", title: "Genetic Algorithm" }
					]
				},
				{
					group: "SM",
					methods: [
						{ value: "moving_average", title: "Moving Average" },
						{ value: "moving_median", title: "Moving Median" },
					]
				},
				{
					group: "TP",
					methods: [
						{ value: "ar", title: "AR" },
						{ value: "sdar", title: "SDAR" },
					]
				},
				{
					group: "CP",
					methods: [
						{ value: "cumulative_sum", title: "Cumulative Sum" },
						{ value: "knearestneighbor", title: "k nearest neighbor" },
						{ value: "lof", title: "LOF" },
						{ value: "sst", title: "SST" },
						{ value: "change_finder", title: "Change Finder" },
					]
				}
			],
			aiMode: AIMode,
			terminateFunction: null,
			mlTask: "",
			mlModel: "",
			mlLock: false,
			rlEnvironment: "",
			settings: ((_this) => ({
				get dimension() {
					return _this.getDimension();
				},
				set terminate(value) {
					_this.terminateFunction = value;
				},
				datas: datas,
				get platform() {
					return ai_platform
				},
				rl: {
					get configElement() {
						return d3.select("#rl_menu");
					}
				},
				get svg() {
					return d3.select("svg");
				},
				ml: {
					get configElement() {
						return d3.select("#" + _this.mlModel);
					},
					refresh() {
						_this.ready(false)
					}
				}
			}))(this),
			initScripts: {}
		};
	},
	template: `
	<div>
		<div>
			Task
			<select v-model="mlTask">
				<option value=""></option>
				<option v-for="ag in aiMethods" :key="ag.group" :value="ag.group">{{ aiMode[ag.group] }} ({{ aiMethods.find(v => v.group === ag.group).methods.length }})</option>
			</select>
		</div>
		<div id="mlSetting">
			<div v-if="mlTask === 'RG'">
				Target dimension
				<input type="number" min="1" max="2" value="2" name="dimension">
			</div>
			<div v-else-if="mlTask === 'DR'">
				Reduce dimention to
				<input type="number" min="1" max="2" value="1" name="dimension">
			</div>
			<div v-else-if="mlTask === 'MD'">
				Environment
				<select v-model="rlEnvironment">
					<option value=""></option>
					<option v-for="itm in ['grid', 'cartpole', 'mountaincar', 'acrobot', 'pendulum', 'maze', 'waterball']" :key="itm" :value="itm">{{ itm }}</option>
				</select>
				<div id="rl_menu"></div>
			</div>
		</div>
		<div v-if="mlTask !== ''">
			Model
			<select id="mlDisp" v-model="mlModel">
				<option value=""></option>
				<option v-for="itm in aiMethods.find(v => v.group === mlTask).methods" :key="itm.value" :depend="(itm.depend || []).join(',')" :value="itm.value">{{ itm.title }}</option>
			</select>
		</div>
		<div id="method_menu"></div>
	</div>
	`,
	watch: {
		rlEnvironment(n, o) {
			ai_platform && ai_platform.clean();
			this.ready();
		},
		mlTask() {
			this.mlModel = ""
			if (this.mlLock) return
			this.mlLock = true
			this.$nextTick(() => {
				this.mlLock = false
				this.ready();
			})
		},
		mlModel() {
			if (this.mlLock) return
			this.mlLock = true
			this.$nextTick(() => {
				this.mlLock = false
				this.ready();
			})
		}
	},
	methods: {
		ready(refreshPlatform = true) {
			const svg = d3.select("svg");

			this.terminateFunction && this.terminateFunction()
			this.terminateFunction = null
			d3.selectAll(".ai-field").style("display", "none");
			let mlelem;

			const mlModel = this.mlModel
			const mlTask = this.mlTask
			const mlEnv = this.rlEnvironment

			const readyModel = () => {
				mlelem = d3.select("#" + mlModel);
				if (mlelem.size() == 0) {
					mlelem = d3.select("#method_menu").append("div")
						.attr("id", mlModel)
						.classed("ai-field", true);
					import(`../model/${mlModel}.js`).then(obj => {
						this.initScripts[mlModel] = obj.default;
						obj.default(ai_platform)
					})
				} else {
					this.initScripts[mlModel](ai_platform);
				}
				mlelem.style("display", "block");
			}
			const readTask = () => {
				const platformClass = this.initScripts[mlTask]
				if (mlTask === 'MD') {
					new platformClass(mlTask, mlEnv, this.settings, (env) => {
						ai_platform = env
						if (!mlModel) env.render()
						else readyModel()
					});
					return
				}
				ai_platform = new platformClass(mlTask, this.settings)
				if (mlModel) {
					readyModel()
				}
			}

			if (refreshPlatform) {
				ai_platform && ai_platform.close();
				ai_platform = null
				if (!this.mlTask) {
					return
				}
				if (this.initScripts[this.mlTask]) {
					readTask()
					return
				}
				let filename = '../platform/base.js'
				if (this.mlTask === 'MD') {
					filename = '../platform/rl.js'
				} else if (this.mlTask === 'TP' || this.mlTask === 'SM' || this.mlTask === 'CP') {
					filename = '../platform/series.js'
				}
				import(filename).then(obj => {
					this.initScripts[mlTask] = obj.default
					readTask()
				})
				return
			}
			if (this.mlModel) {
				readyModel()
			}
		},
		getDimension() {
			const elm = d3.select("#mlSetting [name=dimension]");
			return elm.node() ? +elm.property("value") : undefined;
		}
	}
});

new Vue({
	el: "#ml_selector"
});

