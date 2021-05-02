
let ai_manager = null;

const AIData = {
	"manual": "manual",
	"functional": "function",
	"air": "air passenger",
	"uci": "UCI",
	"upload": "upload",
	"camera": "camera",
	"microphone": "microphone"
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
	"SM": "Smoothing",
	"TP": "Timeseries Prediction",
	"CP": "Change Point Detection",
	"FA": "Frequency Analysis",
	"MV": "Missing Value Completion",
	"IP": "Image Processing",
	"SG": "Segmentation",
	"DN": "Denoising",
	"ED": "Edge Detection",
	"NL": "Natural Language Processing",
	"WE": "Word Embedding",
	"WC": "Word Cloud",
	"RC": "Recommend",
	"MD": "Markov Decision Process",
	"GM": "Game",
};

const AIMethods = [
	{
		group: "CT",
		methods: [
			{ value: "kmeans", title: "K-Means(++) / K-Medoids" },
			{ value: "xmeans", title: "X-Means" },
			{ value: "lbg", title: "Linde-Buzo-Gray" },
			{ value: "isodata", title: "ISODATA" },
			{ value: "soft_kmeans", title: "Soft K-Means" },
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
			{ value: "latent_dirichlet_allocation", title: "Latent Dirichlet Allocation" },
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
			{ value: "mda", title: "Mixture Discriminant" },
			{ value: "ridge", title: "Ridge" },
			{ value: "naive_bayes", title: "Naive Bayes" },
			{ value: "aode", title: "AODE" },
			{ value: "knearestneighbor", title: "k nearest neighbor" },
			{ value: "nearest_centroid", title: "Nearest Centroid" },
			{ value: "decision_tree", title: "Decision Tree" },
			{ value: "random_forest", title: "Random Forest" },
			{ value: "gbdt", title: "GBDT" },
			{ value: "xgboost", title: "XGBoost" },
			{ value: "passive_aggressive", title: "Passive Aggressive" },
			{ value: "arow", title: "AROW" },
			{ value: "confidence_weighted", title: "Confidence Weighted" },
			{ value: "logistic", title: "Logistic regression" },
			{ value: "probit", title: "Probit" },
			{ value: "svm", title: "Support vector machine" },
			{ value: "gaussian_process", title: "Gaussian Process" },
			{ value: "hmm", title: "HMM" },
			{ value: "lvq", title: "Learning vector quantization" },
			{ value: "perceptron", title: "Perceptron" },
			{ value: "adaline", title: "ADALINE" },
			{ value: "mlp", title: "Multi-layer perceptron" },
		]
	},
	{
		group: "SC",
		methods: [
			{ value: "knearestneighbor", title: "k nearest neighbor" },
			{ value: "label_propagation", title: "Label propagation" },
			{ value: "label_spreading", title: "Label spreading" },
			{ value: "kmeans", title: "K-Means" },
			{ value: "gmm", title: "Gaussian mixture model" },
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
			{ value: "bayesian_linear", title: "Bayesian Linear" },
			{ value: "poisson", title: "Poisson" },
			{ value: "segmented", title: "Segmented" },
			{ value: "lowess", title: "LOWESS" },
			{ value: "spline", title: "Spline" },
			{ value: "gaussian_process", title: "Gaussian Process" },
			{ value: "pcr", title: "Principal Components" },
			{ value: "pls", title: "Partial Least Squares" },
			{ value: "knearestneighbor", title: "k nearest neighbor" },
			{ value: "nadaraya_watson", title: "Nadaraya Watson" },
			{ value: "rbf", title: "RBF Network" },
			{ value: "rvm", title: "RVM" },
			{ value: "decision_tree", title: "Decision Tree" },
			{ value: "random_forest", title: "Random Forest" },
			{ value: "gbdt", title: "GBDT" },
			{ value: "xgboost", title: "XGBoost" },
			//{ value: "svm", title: "Support vector regression" },
			{ value: "mlp", title: "Multi-layer perceptron" },
			{ value: "isotonic", title: "Isotonic" },
			{ value: "ramer_douglas_peucker", title: "Ramer Douglas Peucker" }
		]
	},
	{
		group: "IN",
		methods: [
			{ value: "knearestneighbor", title: "nearest neighbor" },
			{ value: "lerp", title: "Linear" },
			{ value: "lagrange", title: "Lagrange" },
			{ value: "spline_interpolation", title: "Spline" },
			{ value: "rbf", title: "RBF Network" },
			{ value: "akima", title: "Akima" },
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
			{ value: "hotelling", title: "Hotelling" },
			{ value: "mt", title: "MT" },
			{ value: "mcd", title: "MCD" },
			{ value: "knearestneighbor", title: "k nearest neighbor" },
			{ value: "lof", title: "LOF" },
			{ value: "pca", title: "PCA" },
			//{ value: "svm", title: "One class SVM" },
			{ value: "kernel_density_estimator", title: "Kernel Density Estimator" },
			{ value: "gmm", title: "Gaussian mixture model" },
			{ value: "isolation_forest", title: "Isolation Forest" },
			{ value: "autoencoder", title: "Autoencoder" },
			{ value: "gan", title: "GAN" },
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
			{ value: "nca", title: "NCA" },
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
			{ value: "decision_tree", title: "Decision Tree" },
			{ value: "nca", title: "NCA" },
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
			{ value: "rbm", title: "GBRBM" },
			{ value: "vae", title: "VAE" },
			{ value: "gan", title: "GAN" },
			//{ value: "flowbase", title: "Flow base" },
		]
	},
	{
		group: "SM",
		methods: [
			{ value: "moving_average", title: "Moving Average" },
			{ value: "exponential_average", title: "Exponential Average" },
			{ value: "moving_median", title: "Moving Median" },
			{ value: "cumulative_moving_average", title: "Cumulative Moving Average" },
			{ value: "kz", title: "Kolmogorov-Zurbenko Filter" },
			{ value: "savitzky_golay", title: "Savitzky Golay Filter" },
			{ value: "hampel", title: "Hampel Filter" },
			{ value: "kalman_filter", title: "Kalman Filter" },
			{ value: "particle_filter", title: "Particle Filter" },
			{ value: "lowpass", title: "Lowpass Filter" },
			{ value: "butterworth", title: "Butterworth Filter" },
			{ value: "chebyshev", title: "Chebyshev Filter" },
			{ value: "elliptic_filter", title: "Elliptic Filter" },
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
	},
	{
		group: "SG",
		methods: [
			{ value: "automatic_thresholding", title: "Automatic Thresholding" },
			{ value: "balanced_histogram", title: "Balanced histogram thresholding" },
			{ value: "otsu", title: "Otsu" },
			{ value: "sezan", title: "Sezan" },
			{ value: "split_merge", title: "Split and merge" },
			{ value: "mean_shift", title: "Mean Shift" }
		]
	},
	{
		group: "ED",
		methods: [
			{ value: "sobel", title: "Sobel" },
			{ value: "prewitt", title: "Prewitt" },
			{ value: "laplacian", title: "Laplacian" },
			{ value: "canny", title: "Canny" }
		]
	},
	{
		group: "DN",
		methods: [
			{ value: "hopfield", title: "Hopfield network" },
			{ value: "rbm", title: "RBM / GBRBM" }
		]
	},
	{
		group: "WE",
		methods: [
			{ value: "word_to_vec", title: "Word2Vec" }
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
		group: "GM",
		methods: [
		]
	}
]
for (const ag of AIMethods) {
	AIMethods[ag.group] = ag
}

class Controller {
	constructor(elm) {
		this._e = elm
		this._terminators = []
	}

	terminate() {
		this._terminators.forEach(t => t())
	}

	stepLoopButtons() {
		let count = 0
		const elm = this._e
		let isRunning = false
		let stepButton = null
		let runButton = null
		let skipButton = null
		let epochText = null
		let epochCb = () => count + 1
		let existInit = false
		let stepCb = null
		const loopButtons = {
			initialize: null,
			stop: () => isRunning = false,
			get epoch() {
				return count
			},
			set enable(value) {
				stepButton?.property("disabled", !value)
				runButton?.property("disabled", !value)
				skipButton?.property("disabled", !value)
			},
			init(cb) {
				this.initialize = cb
				const initButton = elm.append("input")
					.attr("type", "button")
					.attr("value", "Initialize")
					.on("click", () => {
						if (cb.length > 0) {
							initButton.property("disabled", true)
							this.enable = false
							cb(() => {
								initButton.property("disabled", false)
								this.enable = true
								epochText?.text(count = 0)
							})
						} else {
							cb()
							this.enable = true
							epochText?.text(count = 0)
						}
					})
				existInit = true
				return this
			},
			step(cb) {
				stepButton = elm.append("input")
					.attr("type", "button")
					.attr("value", "Step")
					.property("disabled", existInit)
					.on("click", () => {
						if (cb.length > 0) {
							this.enable = false
							cb(() => {
								this.enable = true
								epochText?.text(count = epochCb())
							})
						} else {
							cb()
							epochText?.text(count = epochCb())
						}
					});
				runButton = elm.append("input")
					.attr("type", "button")
					.attr("value", "Run")
					.property("disabled", existInit)
					.on("click", () => {
						isRunning = !isRunning;
						runButton.attr("value", (isRunning) ? "Stop" : "Run");
						if (isRunning) {
							const stepLoop = () => {
								if (isRunning) {
									if (cb.length > 0) {
										cb(() => {
											epochText?.text(count = epochCb())
											setTimeout(stepLoop, 0)
										});
									} else {
										cb()
										epochText?.text(count = epochCb())
										setTimeout(stepLoop, 0)
									}
								}
								stepButton.property("disabled", isRunning);
								skipButton?.property("disabled", isRunning);
								runButton.property("disabled", false);
							}
							stepLoop()
						} else {
							runButton.property("disabled", true);
						}
					});
				stepCb = cb
				return this
			},
			skip(cb) {
				cb ||= stepCb
				skipButton = elm.append("input")
					.attr("type", "button")
					.attr("value", "Skip")
					.property("disabled", existInit)
					.on("click", () => {
						isRunning = !isRunning;
						skipButton.attr("value", (isRunning) ? "Stop" : "Skip");
						if (isRunning) {
							let lastt = new Date().getTime();
							const stepLoop = () => {
								stepButton?.property("disabled", isRunning);
								runButton?.property("disabled", isRunning);
								skipButton.property("disabled", false);
								while (isRunning) {
									if (cb.length > 0) {
										cb(() => {
											epochText?.text(count = epochCb())
											setTimeout(stepLoop, 0)
										});
										return
									} else {
										cb()
										epochText?.text(count = epochCb())
										const curt = new Date().getTime();
										if (curt - lastt > 200) {
											lastt = curt
											setTimeout(stepLoop, 0);
											return
										}
									}
								}
							}
							stepLoop()
						} else {
							skipButton.property("disabled", true);
						}
					});
				return this
			},
			epoch(cb) {
				elm.append("span").text(" Epoch: ")
				epochText = elm.append("span").attr("name", "epoch").text("0")
				if (cb) {
					epochCb = cb
				}
				return this
			},
			elm(cb) {
				cb(elm)
				return this
			}
		}
		this._terminators.push(loopButtons.stop)
		return loopButtons
	}
}

Vue.component('model-selector', {
	data: function() {
		return {
			aiMethods: AIMethods,
			aiData: AIData,
			aiTask: AITask,
			terminateFunction: [],
			state: {},
			mlData: "manual",
			mlTask: "",
			mlModel: "",
			isLoadParam: false,
			historyWillPush: false,
			settings: ((_this) => ({
				vue: _this,
				set terminate(value) {
					_this.terminateFunction.push(value);
				},
				rl: {
					get configElement() {
						return d3.select("#rl_menu");
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
						const cont = new Controller(this.configElement)
						_this.terminateFunction.push(cont.terminate.bind(cont))
						return cont
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
						_this.ready()
					}
				},
				data: {
					get configElement() {
						return d3.select("#data_menu");
					}
				},
				task: {
					get configElement() {
						return d3.select("#task_menu");
					}
				},
				get footer() {
					return d3.select("#method_footer")
				}
			}))(this),
			initScripts: {},
			get availTask() {
				const tasks = ai_manager?.datas?.availTask || []
				if (tasks.length > 0 && tasks.indexOf(this.mlTask) < 0) {
					this.mlTask = ""
				}
				return tasks
			}
		};
	},
	template: `
	<div>
		<dl>
			<dt>Data</dt>
			<dd>
				<select v-model="mlData">
					<option v-for="(t, v) in aiData" :key="v" :value="v">{{ t }}</option>
				</select>
			</dd>
			<dd>
				<div id="data_menu" class="sub-menu"></div>
			</dd>
			<dt>Task</dt>
			<dd>
				<select v-model="mlTask">
					<option value=""></option>
					<template v-for="ag in aiMethods">
						<option v-if="availTask.length === 0 || availTask.indexOf(ag.group) >= 0" :key="ag.group" :value="ag.group">{{ aiTask[ag.group] }} ({{ aiMethods[ag.group].methods.length }})</option>
					</template>
				</select>
			</dd>
			<dd>
				<div class="sub-menu">
					<div id="task_menu"></div>
					<div id="rl_menu" class="sub-menu"></div>
				</div>
			</dd>
			<div v-if="mlTask !== ''" class="model_selection">
				<div>
					<dt>Model</dt>
					<dd>
						<select id="mlDisp" v-model="mlModel">
							<option value=""></option>
							<option v-for="itm in aiMethods[mlTask].methods" :key="itm.value" :value="itm.value">{{ itm.title }}</option>
						</select>
					</dd>
				</div>
				<div v-if="mlModel !== ''">
					<a :href="'https://github.com/ai-on-browser/ai-on-browser.github.io/blob/master/model/' + mlModel + '.js'" rel="noreferrer noopener" target="_blank">source</a>
				</div>
			</div>
		</dl>
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
		const urlParam = location.search.substring(1)
		const state = {
			data: "manual",
			task: "",
			model: ""
		}
		if (urlParam.length > 0) {
			const params = urlParam.split('&')
			for (const param of params) {
				const [k, v] = param.split('=')
				state[k] = v
			}
		}
		import('../platform/base.js').then(obj => {
			if (!ai_manager) {
				ai_manager = new obj.default(this.settings)
				this.$forceUpdate()
				this.setState(state)
			}
		})
		window.onpopstate = e => {
			this.setState(e.state || {
				data: "manual",
				task: "",
				model: ""
			})
		}
	},
	watch: {
		mlData() {
			if (!this.isLoadParam) {
				this.mlTask = ""
				this.pushHistory()
			}
			ai_manager?.setData(this.mlData, () => {
				ai_manager.datas.params = this.state
				this.$forceUpdate()
			})
		},
		mlTask() {
			if (this.isLoadParam) return
			this.mlModel = ""
			this.pushHistory()
			this.ready()
		},
		mlModel() {
			if (this.isLoadParam) return
			this.pushHistory()
			this.ready()
		}
	},
	methods: {
		pushHistory() {
			if (this.historyWillPush || this.isLoadParam) {
				return
			}
			this.historyWillPush = true
			this.state = {
				data: this.mlData,
				task: this.mlTask,
				model: this.mlModel,
				...ai_manager.datas?.params,
				...ai_manager.platform?.params
			}
			Promise.resolve().then(() => {
				this.state = {
					data: this.mlData,
					task: this.mlTask,
					model: this.mlModel,
					...ai_manager.datas?.params,
					...ai_manager.platform?.params
				}
				let sep = '?'
				const url = Object.keys(this.state).reduce((t, k) => {
					if (this.state[k]) {
						t += `${sep}${k}=${this.state[k]}`
						sep = '&'
					}
					return t
				}, '/')
				window.history.pushState(this.state, "", url)
				document.title = this.title()
				this.historyWillPush = false
			})
		},
		setState(state) {
			this.isLoadParam = true
			this.state = state
			this.mlData = state.data
			this.mlTask = state.task
			this.mlModel = state.model
			if (ai_manager.datas) {
				ai_manager.datas.params = state
			}
			document.title = this.title()
			this.$nextTick(() => {
				this.isLoadParam = false
				this.ready()
			})
		},
		title() {
			let title = "AI on Browser"
			let sep = " - "
			for (const key of Object.keys(this.state)) {
				let value = this.state[key]
				if (value) {
					if (key === "task") {
						value = this.aiTask[value]
					}
					title += sep + key.charAt(0).toUpperCase() + key.slice(1) + " : " + value
					sep = ", "
				}
			}
			return title
		},
		ready() {
			this.terminateFunction.forEach(t => t())
			this.terminateFunction = []
			d3.selectAll(".ai-field").classed("hide", true);

			const mlModel = this.mlModel

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
					loader?.remove()
				})
			}

			ai_manager.setTask(this.mlTask, () => {
				if (ai_manager.platform) {
					ai_manager.platform.params = this.state
				}
				readyModel()
			})
		}
	}
});

new Vue({
	el: "#ml_selector"
});

