
const points = [];

let rl_environment = null;

const AIMode = {
	"CT": "Clustering",
	"CF": "Classification",
	"RG": "Regression",
	"AD": "Anomaly Detection",
	"DR": "Dimention Reduction",
	"GR": "Generate",
	"DE": "Dencity Estimation",
	"MD": "Markov Decision Process",
	"TP": "Timeseries Prediction",
	"CP": "Change Point Detection",
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
					group: "TP",
					methods: [
						// { value: "ar", title: "AR" },
					]
				}
			],
			aiMode: AIMode,
			terminateFunction: null,
			mlTask: "",
			mlModel: "",
			rlEnvironment: "",
			initScripts: {}
		};
	},
	template: `
	<div>
		<div>
			Task
			<select v-model="mlTask">
				<option value="">Select Task</option>
				<option v-for="ag in aiMethods" :key="ag.group" :value="ag.group">{{ aiMode[ag.group] }}</option>
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
					<option value="">Select Environment</option>
					<option v-for="itm in ['grid', 'cartpole', 'mountaincar', 'acrobot', 'pendulum', 'maze', 'waterball']" :key="itm" :value="itm">{{ itm }}</option>
				</select>
				<div id="rl_menu"></div>
			</div>
		</div>
		<div v-if="mlTask !== ''">
			Model
			<select id="mlDisp" v-model="mlModel">
				<option value="">Select Model</option>
				<option v-for="itm in aiMethods.find(v => v.group === mlTask).methods" :key="itm.value" :depend="(itm.depend || []).join(',')" :value="itm.value">{{ itm.title }}</option>
			</select>
		</div>
		<div id="method_menu"></div>
	</div>
	`,
	computed: {
	},
	watch: {
		rlEnvironment(n, o) {
			rl_environment && rl_environment.clean();
			this.ready();
		},
		mlTask() {
			this.mlModel = ""
			this.$nextTick(() => {
				this.ready();
			})
		},
		mlModel() {
			this.$nextTick(() => {
				this.ready();
			})
		}
	},
	methods: {
		ready(refreshRl = true) {
			const svg = d3.select("svg");

			this.terminateFunction && this.terminateFunction()
			this.terminateFunction = null
			d3.selectAll(".ai-field").style("display", "none");

			const _this = this
			const settings = {
				get dimension() {
					return _this.getDimension();
				},
				set terminate(value) {
					_this.terminateFunction = value;
				},
				points: points,
				rl: {
					get env() {
						return rl_environment
					},
					get configElement() {
						return d3.select("#rl_menu");
					}
				},
				get svg() {
					return d3.select("svg");
				},
				ml: {
					get configElement() {
						return d3.select(`#${_this.mlModel} div`)
					},
					refresh() {
						_this.ready(false)
					}
				}
			}

			const readyModel = () => {
				const mlelem = d3.select("#" + this.mlModel);
				if (mlelem.size() == 0) {
					const elem = d3.select("#method_menu").append("div")
						.attr("id", this.mlModel)
						.classed("ai-field", true);
					import(`../model/${this.mlModel}.js`).then(obj => {
						this.initScripts[this.mlModel] = obj.default;
						obj.default(elem, this.mlTask, settings)
					})
				} else {
					this.initScripts[this.mlModel](mlelem, this.mlTask, settings);
				}
				mlelem.style("display", "block");
			}

			if (refreshRl) {
				d3.selectAll("#rl_menu *").remove()
				rl_environment && rl_environment.clean();
				if (this.mlTask === 'MD') {
					new RLPlatform(this.rlEnvironment, settings, (env) => {
						rl_environment = env
						if (!this.mlModel) env.render()
						else readyModel()
					});
					return
				} else {
					rl_environment = null;
				}
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

