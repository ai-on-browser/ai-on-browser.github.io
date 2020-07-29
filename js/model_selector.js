
const points = [];

let rl_environment = null;

const AIMode = {
	"CT": "Clustering",
	"CF": "Classification",
	"RG": "Regression",
	"AD": "Anomaly Detection",
	"DR": "Dimention Reduction",
	"GR": "Generative",
	"RL": "Reinforcement",
	"TP": "Timeseries Prediction",
	"DE": "Dencity Estimation"
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
					group: "RL",
					methods: [
						{ value: "dynamic_programming", title: "DP", depend: ["q_learning"] },
						{ value: "monte_carlo", title: "MC", depend: ["q_learning"] },
						{ value: "q_learning", title: "Q Learning" },
						{ value: "sarsa", title: "SARSA", depend: ["q_learning"] },
						{ value: "policy_gradient", title: "Policy Gradient", depend: ["q_learning"] },
						{ value: "dqn", title: "DQN" },
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
			mlSelectType: "",
			rlEnvironment: "grid",
			env: {
				grid: {
					size: [20, 10]
				}
			}
		};
	},
	template: `
	<div>
		<div>{{ methodGroup }}</div>
		<select id="mlDisp" v-model="mlSelectType">
			<option value="">Select AI</option>
			<optgroup v-for="ag in aiMethods" :key="ag.group" :label="aiMode[ag.group]">
				<option v-for="itm in ag.methods" :key="itm.value" :value="itm.value + '/' + ag.group" :depend="(itm.depend || []).join(',')">{{ itm.title }}</option>
			</optgroup>
		</select>
		<div id="mlSetting">
			<div v-if="mlMode === 'RG'">
				Target dimension
				<input type="number" min="1" max="2" value="2" name="dimension">
			</div>
			<div v-else-if="mlMode === 'DR'">
				Reduce dimention to
				<input type="number" min="1" max="2" value="1" name="dimension">
			</div>
			<div v-else-if="mlMode === 'RL'">
				Environment
				<select v-model="rlEnvironment">
					<option v-for="itm in ['grid', 'cartpole', 'mountaincar', 'acrobot', 'pendulum', 'maze']" :key="itm" :value="itm">{{ itm }}</option>
				</select>
				<div v-if="rlEnvironment === 'grid'">
					Columns <input type="number" v-model.number="env.grid.size[0]" min="1" max="50" value="20">
					Rows <input type="number" v-model.number="env.grid.size[1]" min="1" max="50" value="10">
				</div>
			</div>
		</div>
		<div id="method_menu"></div>
	</div>
	`,
	computed: {
		mlMode() {
			return Object.keys(AIMode).find(k => AIMode[k] === this.methodGroup);
		},
		mlType() {
			return this.mlSelectType ? this.mlSelectType.split('/')[0] : null;
		},
		methodGroup() {
			return this.mlSelectType ? d3.select(d3.select("#mlDisp option:checked").node().parentNode).attr("label") : null;
		}
	},
	watch: {
		rlEnvironment(n, o) {
			rl_environment && rl_environment.clean();
			this.ready();
		},
		mlSelectType() {
			this.ready();
		},
		env: {
			handler() {
				rl_environment && rl_environment.clean();
				this.ready();
			},
			deep: true
		}
	},
	methods: {
		ready() {
			const svg = d3.select("svg");

			this.terminateFunction && this.terminateFunction()
			this.terminateFunction = null
			d3.selectAll(".ai-field").style("display", "none");

			if (!this.mlType) {
				return;
			}

			const _this = this
			const settings = {
				get dimension() {
					return _this.getDimension();
				},
				set terminate(value) {
					_this.terminateFunction = value;
				},
				points: points,
				get rlEnv() {
					return rl_environment
				},
				get rlConfig() {
					return _this.env[_this.rlEnvironment];
				},
				get svg() {
					return d3.select("svg");
				},
				get mlConfigElement() {
					return d3.select(`#${_this.mlType} div`)
				}
			}

			if (this.mlMode === 'RL') {
				rl_environment = new RLEnvironment(this.rlEnvironment, settings);
			} else {
				rl_environment && rl_environment.clean();
				rl_environment = null;
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

