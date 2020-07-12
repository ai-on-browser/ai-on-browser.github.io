
const points = [];

let rl_environment = null;

const AIMode = {
	"CT": "Clustering",
	"CF": "Classification",
	"RG": "Regression",
	"AD": "Anomaly Detection",
	"DR": "Dimention Reduction",
	"TP": "Timeseries Prediction",
	"GR": "Generative",
	"RL": "Reinforcement",
	"DE": "Dencity Estimation"
};

Vue.component('model-selector', {
	data: function() {
		return {
			terminateFunction: null,
			methodGroup: null,
			mlSelectType: "",
			aiMethods: [
				{
					group: "CT",
					methods: [
						{ value: "kmeans", title: "K-Means" },
						{ value: "hierarchy", title: "Hierarchy" },
						{ value: "mean_shift", title: "Mean Shift" },
						{ value: "gmm", title: "Gaussian mixture model" },
						{ value: "autoencoder", title: "Autoencoder" },
						{ value: "spectral", title: "Spectral clustering", depend: ["kmeans"] },
						{ value: "som", title: "Self-organizing map" },
						{ value: "neural_gas", title: "Neural Gas", depend: ["kmeans"] },
					]
				},
				{
					group: "CF",
					methods: [
						{ value: "linear_discriminant", title: "Linear Discriminant" },
						{ value: "naive_bayes", title: "Naive Bayes" },
						{ value: "decision_tree", title: "Decision Tree" },
						{ value: "random_forest", title: "Random Forest", depend: ["decision_tree"] },
						{ value: "knearestneighbor", title: "k nearest neighbor" },
						{ value: "logistic", title: "Multinomial logistic regression" },
						{ value: "svm", title: "Support vector machine" },
						{ value: "mlp", title: "Multi-layer perceptron" },
					]
				},
				{
					group: "RG",
					methods: [
						{ value: "polynomial", title: "Polynomial regression" },
						{ value: "ridge", title: "Ridge regression" },
						{ value: "lasso", title: "Lasso regression" },
						{ value: "elastic_net", title: "Elastic Net regression" },
						{ value: "knn_reg", title: "k nearest neignbor" },
						{ value: "decision_tree", title: "Decision Tree" },
						{ value: "random_forest", title: "Random Forest", depend: ["decision_tree"] },
						//{ value: "svm", title: "Support vector machine" },
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
						{ value: "knearestneighbor_anomaly", title: "k nearest neighbor" },
						{ value: "lof", title: "LOF" },
						//{ value: "svm", title: "One class support vector machine" },
						{ value: "gmm", title: "Gaussian mixture model" },
						{ value: "isolation_forest", title: "Isolation Forest" },
						{ value: "autoencoder", title: "Autoencoder" },
					]
				},
				{
					group: "DR",
					methods: [
						{ value: "random_projection_1to2", title: "Random projection" },
						{ value: "pca_1to2", title: "PCA" },
						{ value: "lsa_1to2", title: "LSA" },
						{ value: "mds_1to2", title: "MDS" },
						{ value: "lda_1to2", title: "Linear Discriminant Analysis" },
						//{ value: "ica_1to2", title: "ICA" },
						{ value: "lle_1to2", title: "LLE" },
						{ value: "tsne_1to2", title: "t-SNE" },
						{ value: "som", title: "Self-organizing map" },
						{ value: "autoencoder", title: "Autoencoder" },
						{ value: "vae", title: "VAE" },
					]
				},
				{
					group: "GR",
					methods: [
						//{ value: "vae", title: "VAE" },
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
						//{ value: "dqn", title: "DQN" },
					]
				},
				{
					group: "TP",
					methods: [
						// { value: "ar", title: "AR" },
					]
				},
				{
					group: "DE",
					methods: [
						// { value: "histogram", title: "Histogram" },
						// { value: "kde", title: "Kernel Dencity Estimation" },
					]
				}
			],
			aiMode: AIMode
		};
	},
	template: `
	<div>
		<div>{{ methodGroup }}</div>
		<select id="mlDisp" v-model="mlSelectType" v-on:change="onMlChange">
			<option value="">Select AI</option>
			<optgroup v-for="ag in aiMethods" :key="ag.group" :label="aiMode[ag.group]">
				<option v-for="itm in ag.methods" :key="itm.value" :value="itm.value + '/' + ag.group" :depend="(itm.depend || []).join(',')">{{ itm.title }}</option>
			</optgroup>
		</select>
		<div id="mlSetting">
			<div v-if="mlMode === 'RG'">
				Target dimension
				<input type="number" min="1" max="2" value="1" name="dimension">
			</div>
			<div v-else-if="mlMode === 'DR'">
				Reduce dimention to
				<input type="number" min="1" max="2" value="1" name="dimension">
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
		}
	},
	methods: {
		onMlChange() {
			const svg = d3.select("svg");

			this.terminateFunction && this.terminateFunction()
			d3.selectAll(".ai-field").style("display", "none");

			if (!this.mlType) {
				this.methodGroup = null;
				return;
			}
			this.methodGroup = d3.select(d3.select("#mlDisp option:checked").node().parentNode).attr("label");

			const settings = {
				dimension: this.getDimension.bind(this),
				setTerminate: (cb) => this.terminateFunction = cb,
				points: points
			}

			if (this.mlMode === 'RL') {
				rl_environment = new RLEnvironment('grid', svg, points, {});
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
		setTerminate(cb) {
			this.terminateFunction = cb
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

