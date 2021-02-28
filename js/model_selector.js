
let ai_manager = null;

const AIData = {
	"manual": "manual",
	"functional": "function",
	"swiss_roll": "Swiss roll",
	"air": "air passenger",
	"iris": "iris",
	"wine": "wine",
	"zoo": "zoo",
	"upload_csv": "upload"
};

const AITask = {
	"CT": "Clustering",
	"CF": "Classification",
	"SC": "Semi-supervised Classification",
	"RG": "Regression",
	"IN": "Interpolation",
	"AD": "Anomaly Detection",
	"DR": "Dimension Reduction",
	"FS": "Feature Selection",
	"SA": "Scaling",
	"GR": "Generate",
	"DE": "Density Estimation",
	"MD": "Markov Decision Process",
	"SM": "Smoothing",
	"TP": "Timeseries Prediction",
	"CP": "Change Point Detection",
	"FA": "Frequency Analysis",
	"MV": "Missing Value Completion",
	"IP": "Image Processing",
	"NL": "Natural Language Processing",
	"WE": "Word Embedding",
	"WC": "Word Cloud",
	"RC": "Recommend",
};

const AIMethods = [
	{
		group: "CT",
		methods: [
			{ value: "kmeans", title: "K-Means(++) / K-Medoids" },
			{ value: "xmeans", title: "X-Means" },
			{ value: "lbg", title: "Linde-Buzo-Gray" },
			{ value: "isodata", title: "ISODATA" },
			{ value: "fuzzy_cmeans", title: "Fuzzy C-Means" },
			{ value: "hierarchy", title: "Hierarchy" },
			{ value: "diana", title: "DIANA" },
			{ value: "mean_shift", title: "Mean Shift" },
			{ value: "dbscan", title: "DBSCAN" },
			{ value: "optics", title: "OPTICS" },
			{ value: "pam", title: "PAM / CLARA" },
			{ value: "clarans", title: "CLARANS" },
			{ value: "birch", title: "BIRCH" },
			{ value: "cure", title: "CURE" },
			//{ value: "sting", title: "STING" },
			{ value: "gmm", title: "Gaussian mixture model" },
			{ value: "vbgmm", title: "Variational Bayesian GMM" },
			{ value: "affinity_propagation", title: "Affinity Propagation" },
			{ value: "spectral", title: "Spectral clustering" },
			{ value: "mountain", title: "Mountain" },
			{ value: "som", title: "Self-organizing map" },
			{ value: "neural_gas", title: "Neural Gas" },
			{ value: "lvq", title: "Learning vector quantization" },
			{ value: "nmf", title: "NMF" },
			{ value: "autoencoder", title: "Autoencoder" },
		]
	},
	{
		group: "CF",
		methods: [
			{ value: "lda", title: "LDA / FLD" },
			{ value: "quadratic_discriminant", title: "Quadratic Discriminant" },
			{ value: "naive_bayes", title: "Naive Bayes" },
			{ value: "knearestneighbor", title: "k nearest neighbor" },
			{ value: "nearest_centroid", title: "Nearest Centroid" },
			{ value: "decision_tree", title: "Decision Tree" },
			{ value: "random_forest", title: "Random Forest" },
			{ value: "gbdt", title: "GBDT" },
			{ value: "passive_aggressive", title: "Passive Aggressive" },
			{ value: "arow", title: "AROW" },
			{ value: "confidence_weighted", title: "Confidence Weighted" },
			{ value: "logistic", title: "Multinomial logistic regression" },
			{ value: "probit", title: "Probit" },
			{ value: "svm", title: "Support vector machine" },
			{ value: "gaussian_process", title: "Gaussian Process" },
			{ value: "hmm", title: "HMM" },
			{ value: "lvq", title: "Learning vector quantization" },
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
			{ value: "spline", title: "Spline" },
			{ value: "gaussian_process", title: "Gaussian Process" },
			{ value: "pcr", title: "Principal Components" },
			{ value: "pls", title: "Partial Least Squares" },
			{ value: "knearestneighbor", title: "k nearest neighbor" },
			{ value: "nadaraya_watson", title: "Nadaraya Watson" },
			{ value: "rvm", title: "RVM" },
			{ value: "decision_tree", title: "Decision Tree" },
			{ value: "random_forest", title: "Random Forest" },
			{ value: "gbdt", title: "GBDT" },
			//{ value: "svm", title: "Support vector regression" },
			{ value: "mlp", title: "Multi-layer perceptron" },
			{ value: "isotonic", title: "Isotonic" },
		]
	},
	{
		group: "IN",
		methods: [
			{ value: "lerp", title: "Linear" },
			{ value: "lagrange", title: "Lagrange" },
			{ value: "spline_interpolation", title: "Spline" },
		]
	},
	{
		group: "AD",
		methods: [
			{ value: "percentile", title: "Percentile" },
			{ value: "mad", title: "MAD" },
			{ value: "smirnov_grubbs", title: "Grubbs's test" },
			{ value: "thompson", title: "Thompson test" },
			{ value: "tietjen_moore", title: "Tietjen-Moore test" },
			{ value: "generalized_esd", title: "Generalized ESD" },
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
			{ value: "ica", title: "ICA" },
			{ value: "principal_curve", title: "Principal curve" },
			{ value: "sammon", title: "Sammon" },
			{ value: "fastmap", title: "FastMap" },
			{ value: "lle", title: "LLE" },
			{ value: "laplacian_eigenmaps", title: "Laplacian eigenmaps" },
			{ value: "isomap", title: "Isomap" },
			{ value: "tsne", title: "t-SNE" },
			{ value: "som", title: "Self-organizing map" },
			//{ value: "umap", title: "UMAP" },
			{ value: "nmf", title: "NMF" },
			{ value: "autoencoder", title: "Autoencoder" },
			{ value: "vae", title: "VAE" },
		]
	},
	{
		group: "FS",
		methods: [
			{ value: "mutual_information", title: "Mutual Information" },
			{ value: "ridge", title: "Ridge" },
			{ value: "lasso", title: "Lasso" },
			{ value: "elastic_net", title: "Elastic Net" },
		]
	},
	{
		group: "DE",
		methods: [
			{ value: "histogram", title: "Histogram" },
			{ value: "average_shifted_histogram", title: "Average Shifted Histogram" },
			{ value: "kernel_density_estimator", title: "Kernel Density Estimator" },
			{ value: "knearestneighbor", title: "k nearest neighbor" },
			{ value: "gmm", title: "Gaussian mixture model" },
		]
	},
	{
		group: "GR",
		methods: [
			{ value: "vae", title: "VAE" },
			{ value: "gan", title: "GAN" },
			//{ value: "flowbase", title: "Flow base" },
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
			{ value: "dqn", title: "DQN / DDQN" },
			{ value: "genetic_algorithm", title: "Genetic Algorithm" }
		]
	},
	{
		group: "SM",
		methods: [
			{ value: "moving_average", title: "Moving Average" },
			{ value: "exponential_average", title: "Exponential Average" },
			{ value: "moving_median", title: "Moving Median" },
			{ value: "cumulative_moving_average", title: "Cumulative Moving Average" },
			{ value: "kalman_filter", title: "Kalman Filter" },
			{ value: "particle_filter", title: "Particle Filter" },
		]
	},
	{
		group: "TP",
		methods: [
			{ value: "holt_winters", title: "Holt Winters" },
			{ value: "ar", title: "AR" },
			{ value: "arma", title: "ARMA" },
			{ value: "sdar", title: "SDAR" },
			{ value: "kalman_filter", title: "Kalman Filter" },
			{ value: "mlp", title: "Multi-layer perceptron" },
		]
	},
	{
		group: "CP",
		methods: [
			{ value: "cumulative_sum", title: "Cumulative Sum" },
			{ value: "knearestneighbor", title: "k nearest neighbor" },
			{ value: "lof", title: "LOF" },
			{ value: "sst", title: "SST" },
			{ value: "ulsif", title: "uLSIF" },
			{ value: "hmm", title: "HMM" },
			{ value: "markov_switching", title: "Markov Switching" },
			{ value: "change_finder", title: "Change Finder" },
		]
	}
]
for (const ag of AIMethods) {
	AIMethods[ag.group] = ag
}

const AIEnv = ['grid', 'cartpole', 'mountaincar', 'acrobot', 'pendulum', 'maze', 'waterball']

class Controller {
	constructor(elm) {
		this._e = elm
		this._count = 0
	}

	stepLoopButtons(init, step, epoch = false) {
		if (init) {
			this._e.append("input")
				.attr("type", "button")
				.attr("value", "Initialize")
				.on("click", () => {
					init()
					if (epochText) {
						epochText.text(this._count = 0)
					}
				})
		}
		let isRunning = false;
		if (step) {
			const stepButton = this._e.append("input")
				.attr("type", "button")
				.attr("value", "Step")
				.on("click", () => {
					stepButton.property("disabled", true);
					runButton.property("disabled", true);
					step(() => {
						stepButton.property("disabled", false);
						runButton.property("disabled", false);
						epochText && epochText.text(++this._count)
					})
				});
			const runButton = this._e.append("input")
				.attr("type", "button")
				.attr("value", "Run")
				.on("click", () => {
					isRunning = !isRunning;
					runButton.attr("value", (isRunning) ? "Stop" : "Run");
					if (isRunning) {
						const stepLoop = () => {
							if (isRunning) {
								step(() => {
									epochText && epochText.text(++this._count)
									setTimeout(stepLoop, 0)
								});
							}
							stepButton.property("disabled", isRunning);
							runButton.property("disabled", false);
						}
						stepLoop()
					} else {
						runButton.property("disabled", true);
					}
				});
		}
		let epochText = null
		if (epoch) {
			this._e.append("span").text(" Epoch: ")
			epochText = this._e.append("span").attr("name", "epoch").text("0")
		}
		return () => {
			isRunning = false
		}
	}
}

Vue.component('model-selector', {
	data: function() {
		return {
			aiMethods: AIMethods,
			aiData: AIData,
			aiTask: AITask,
			aiEnv: AIEnv,
			terminateFunction: null,
			mlData: "manual",
			mlTask: "",
			mlModel: "",
			mlLock: false,
			rlEnvironment: "",
			settings: ((_this) => ({
				vue: _this,
				get dimension() {
					return _this.getDimension();
				},
				set terminate(value) {
					_this.terminateFunction = value;
				},
				rl: {
					get configElement() {
						return d3.select("#rl_menu");
					},
					get environmentName() {
						return _this.rlEnvironment
					}
				},
				get svg() {
					return d3.select("#plot-area svg g.flip");
				},
				ml: {
					get configElement() {
						return d3.select(`#${_this.mlModel} .buttons`);
					},
					get controller() {
						return new Controller(d3.select(`#${_this.mlModel} .buttons`))
					},
					get modelName() {
						return _this.mlModel
					},
					set usage(value) {
						d3.select(`#${_this.mlModel} .usage`).text(value)
					},
					set draft(value) {
						d3.select(`#${_this.mlModel} .draft`).classed("hide", !value)
					},
					set detail(value) {
						const elm = d3.select(`#${_this.mlModel} .detail-content`)
						const dtl = elm.select('.detail')
						dtl.html(value)
						elm.classed("hide", !value)
						MathJax.typesetPromise([dtl.node()])
					},
					refresh() {
						_this.ready(false)
					}
				},
				data: {
					get configElement() {
						return d3.select("#data_menu");
					}
				}
			}))(this),
			initScripts: {},
			get availTask() {
				return ai_manager ? ai_manager.datas.availTask : []
			}
		};
	},
	template: `
	<div>
		<div>
			Data
			<select v-model="mlData">
				<option v-for="(t, v) in aiData" :key="v" :value="v">{{ t }}</option>
			</select>
			<div id="data_menu"></div>
		</div>
		<div>
			Task
			<select v-model="mlTask">
				<option value=""></option>
				<template v-for="ag in aiMethods">
					<option v-if="availTask.length === 0 || availTask.indexOf(ag.group) >= 0" :key="ag.group" :value="ag.group">{{ aiTask[ag.group] }} ({{ aiMethods[ag.group].methods.length }})</option>
				</template>
			</select>
		</div>
		<div id="mlSetting">
			<div v-if="mlTask === 'DR' || mlTask === 'FS'">
				Target dimension
				<input type="number" min="1" max="2" value="2" name="dimension">
			</div>
			<div v-else-if="mlTask === 'MD'">
				Environment
				<select v-model="rlEnvironment">
					<option value=""></option>
					<option v-for="itm in aiEnv" :key="itm" :value="itm">{{ itm }}</option>
				</select>
				<div id="rl_menu"></div>
			</div>
		</div>
		<div v-if="mlTask !== ''">
			Model
			<select id="mlDisp" v-model="mlModel">
				<option value=""></option>
				<option v-for="itm in aiMethods[mlTask].methods" :key="itm.value" :value="itm.value">{{ itm.title }}</option>
			</select>
		</div>
		<div id="method_menu">
			<div v-for="method in new Set(aiMethods.reduce((s, m) => s.push(...m.methods.map(v => v.value)) && s, []))" :key="method" :id="method" class="ai-field hide">
				<div class="loader"></div>
				<div class="method_content">
					<div class="alert hide draft">This model may not be working properly.</div>
					<div class="detail-content hide">
						<input :id="'acd-' + method" type="checkbox" class="acd-check">
						<label :for="'acd-' + method" class="acd-label">Model algorithm</label>
						<div class="detail acd-content"></div>
					</div>
					<div>
						<input :id="'acd-usage-' + method" type="checkbox" class="acd-check" checked>
						<label :for="'acd-usage-' + method" class="acd-label">Usage</label>
						<div class="usage acd-content"></div>
					</div>
					<div class="buttons"></div>
				</div>
			</div>
		</div>
	</div>
	`,
	created() {
		import('../platform/base.js').then(obj => {
			if (!ai_manager) {
				ai_manager = new obj.default(this.settings)
				this.$forceUpdate()
			}
		})
	},
	watch: {
		rlEnvironment(n, o) {
			ai_manager && ai_manager.platform.clean();
			this.ready();
		},
		mlData() {
			this.mlTask = ""
			ai_manager && ai_manager.setData(this.mlData, () => {
				this.$forceUpdate()
			})
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
			d3.selectAll(".ai-field").classed("hide", true);

			const mlModel = this.mlModel
			const mlTask = this.mlTask
			const mlEnv = this.rlEnvironment

			const readyModel = () => {
				if (!mlModel) return
				const mlelem = d3.select("#" + mlModel)
				let loader = null
				if (mlelem.select(".loader").size() > 0) {
					loader = mlelem.select(".loader")
				}
				mlelem.selectAll(".buttons *").remove()
				mlelem.classed("hide", false)
				ai_manager.setModel(mlModel, () => {
					loader && loader.remove()
				})
			}

			if (refreshPlatform) {
				ai_manager.setTask(this.mlTask, () => {
					readyModel()
				})
				return
			}
			readyModel()
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

