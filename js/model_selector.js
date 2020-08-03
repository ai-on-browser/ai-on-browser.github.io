
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
						{ value: "xmeans", title: "X-Means", depend: ["kmeans"] },
						{ value: "hierarchy", title: "Hierarchy" },
						{ value: "mean_shift", title: "Mean Shift" },
						{ value: "dbscan", title: "DBSCAN" },
						{ value: "optics", title: "OPTICS" },
						{ value: "clarans", title: "CLARANS" },
						{ value: "birch", title: "BIRCH", depend: ["kmeans"] },
						//{ value: "sting", title: "STING" },
						{ value: "gmm", title: "Gaussian mixture model" },
						{ value: "affinity_propagation", title: "Affinity Propagation" },
						{ value: "spectral", title: "Spectral clustering", depend: ["kmeans"] },
						{ value: "som", title: "Self-organizing map" },
						{ value: "neural_gas", title: "Neural Gas", depend: ["kmeans"] },
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
						{ value: "decision_tree", title: "Decision Tree" },
						{ value: "random_forest", title: "Random Forest", depend: ["decision_tree"] },
						{ value: "logistic", title: "Multinomial logistic regression" },
						{ value: "svm", title: "Support vector machine" },
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
						{ value: "pcr", title: "Principal Components", depend: ["pca"] },
						{ value: "pls", title: "Partial Least Squares" },
						{ value: "knearestneighbor", title: "k nearest neignbor" },
						{ value: "decision_tree", title: "Decision Tree" },
						{ value: "random_forest", title: "Random Forest", depend: ["decision_tree"] },
						//{ value: "svm", title: "Support vector regression" },
						{ value: "mlp", title: "Multi-layer perceptron" },
					]
				},
				{
					group: "AD",
					methods: [
						{ value: "percentile", title: "Percentile" },
						{ value: "mt", title: "MT" },
						//{ value: "robust_covariance", title: "Robust covariance" },
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
						{ value: "dynamic_programming", title: "DP", depend: ["q_learning"] },
						{ value: "monte_carlo", title: "MC", depend: ["q_learning"] },
						{ value: "q_learning", title: "Q Learning" },
						{ value: "sarsa", title: "SARSA", depend: ["q_learning"] },
						{ value: "policy_gradient", title: "Policy Gradient", depend: ["q_learning"] },
						{ value: "dqn", title: "DQN" },
						{ value: "genetic_algorithm", title: "Genetic Algorithm", depend: ["q_learning"] }
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
			mlMode: "",
			mlType: "",
			rlEnvironment: "",
		};
	},
	template: `
	<div>
		<div>
			<select v-model="mlMode">
				<option value="">Select AI</option>
				<option v-for="ag in aiMethods" :key="ag.group" :value="ag.group">{{ aiMode[ag.group] }}</option>
			</select>
		</div>
		<div id="mlSetting">
			<div v-if="mlMode === 'RG'">
				Target dimension
				<input type="number" min="1" max="2" value="2" name="dimension">
			</div>
			<div v-else-if="mlMode === 'DR'">
				Reduce dimention to
				<input type="number" min="1" max="2" value="1" name="dimension">
			</div>
			<div v-else-if="mlMode === 'MD'">
				Environment
				<select v-model="rlEnvironment">
					<option value=""></option>
					<option v-for="itm in ['grid', 'cartpole', 'mountaincar', 'acrobot', 'pendulum', 'maze']" :key="itm" :value="itm">{{ itm }}</option>
				</select>
				<div id="rl_menu"></div>
			</div>
		</div>
		<div>
			<select id="mlDisp" v-if="mlMode !== ''" v-model="mlType">
				<option v-for="itm in aiMethods.find(v => v.group === mlMode).methods" :key="itm.value" :depend="(itm.depend || []).join(',')" :value="itm.value">{{ itm.title }}</option>
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
		mlMode() {
			this.mlType = ""
			this.$nextTick(() => {
				this.ready();
			})
		},
		mlType() {
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
						return d3.select(`#${_this.mlType} div`)
					},
					refresh() {
						_this.ready(false)
					}
				}
			}

			if (refreshRl) {
				d3.selectAll("#rl_menu *").remove()
				if (this.mlMode === 'MD') {
					rl_environment = new RLEnvironment(this.rlEnvironment, settings);
					if (!this.mlType) rl_environment.render()
				} else {
					rl_environment && rl_environment.clean();
					rl_environment = null;
				}
			}

			if (!this.mlType) {
				return;
			}

			let mlelem = d3.select("#" + this.mlType);
			if (mlelem.size() == 0) {
				const ready_mlelm = function(t, load_cb) {
					const elem = d3.select("#method_menu").append("div")
						.attr("id", t)
						.classed("ai-field", true);
					elem.append("script").attr("type", "text/javascript")
						.attr("src", "model/" + t + ".js")
						.on("load", () => load_cb(elem));
					elem.append("div");
					return elem;
				};
				const depend = d3.select("#mlDisp option:checked").attr('depend');
				let loaded_cnt = 0;
				let depend_cnt = 0;
				if (depend) {
					const depends = depend.split(',');
					depend_cnt = depends.length;
					depends.forEach(d => {
						if (d3.select("#" + d).size() == 0) {
							ready_mlelm(d, () => loaded_cnt++);
						} else {
							loaded_cnt++;
						}
					});
				}
				const loadmlscript = () => {
					if (loaded_cnt < depend_cnt) {
						setTimeout(loadmlscript, 10);
						return;
					}
					const mlelem = ready_mlelm(this.mlType, (e) => {
						window[this.mlType + "_init"](e.select("div"), this.mlMode, settings);
					});
					mlelem.style("display", "inline");
				}
				loadmlscript();
			} else {
				window[this.mlType + "_init"](mlelem.select("div"), this.mlMode, settings);
				mlelem.style("display", "inline");
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

