
const points = [];

const AIMode = {
	"CT": "Clustering",
	"CF": "Classification",
	"RG": "Regression",
	"AD": "Anomaly Detection",
	"DR": "Dimention Reduction",
	"TP": "Timeseries Prediction",
	"GR": "Generative",
	"RF": "Reinforcement",
	"DE": "Dencity Estimation"
};

Vue.component('model-selector', {
	data: function() {
		return {
			terminateFunction: null,
			methodGroup: null,
			mlType: "",
			setting: {
				dimension: 0
			}
		};
	},
	template: `
	<div>
		<div>{{ methodGroup }}</div>
		<select id="mlDisp" v-model="mlType" v-on:change="onMlChange">
			<option value="">Select AI</option>
			<optgroup label="Clustering">
				<option value="kmeans">K-Means</option>
				<option value="hierarchy">Hierarchy</option>
				<option value="mean_shift">Mean Shift</option>
				<option value="gmm">Gaussian mixture model</option>
				<option value="autoencoder">Autoencoder</option>
				<option value="spectral" depend="kmeans">Spectral clustering</option>
				<option value="som">Self-organizing map</option>
			</optgroup>
			<optgroup label="Classification">
				<option value="naive_bayes">Naive Bayes</option>
				<option value="decision_tree">Decision Tree</option>
				<option value="random_forest" depend="decision_tree">Random Forest</option>
				<option value="knearestneighbor">k nearest neighbor</option>
				<option value="logistic">Multinomial logistic regression</option>
				<option value="mlp">Multi-layer perceptron</option>
				<option value="svm">Support vector machine</option>
			</optgroup>
			<optgroup label="Regression">
				<option value="mlp">Multi-layer perceptron</option>
				<option value="ridge">Ridge regression</option>
				<option value="lasso">Lasso regression</option>
				<option value="elastic_net">Elastic Net regression</option>
				<option value="knn_reg">k nearest neignbor</option>
				<option value="decision_tree">Decision Tree</option>
				<option value="random_forest" depend="decision_tree">Random Forest</option>
			</optgroup>
			<optgroup label="Anomaly Detection">
				<option value="percentile">Percentile</option>
				<option value="mt">MT</option>
				<!--<option value="robust_covariance">Robust covariance</option>-->
				<option value="mcd">MCD</option>
				<option value="knearestneighbor_anomaly">k nearest neighbor</option>
				<option value="lof">LOF</option>
				<!--<option value="svm">One class support vector machine</option>-->
				<option value="gmm">Gaussian mixture model</option>
				<option value="isolation_forest">Isolation Forest</option>
				<option value="autoencoder">Autoencoder</option>
			</optgroup>
			<optgroup label="Dimention Reduction">
				<option value="random_projection_1to2">Random projection</option>
				<option value="pca_1to2">PCA</option>
				<option value="lsa_1to2">LSA</option>
				<option value="mds_1to2">MDS</option>
				<option value="lda_1to2">Linear Discriminant Analysis</option>
				<!--<option value="ica_1to2">ICA</option>-->
				<option value="lle_1to2">LLE</option>
				<option value="tsne_1to2">t-SNE</option>
				<option value="autoencoder">Autoencoder</option>
				<option value="som">Self-organizing map</option>
			</optgroup>
			<optgroup label="Timeseries Prediction">
			</optgroup>
			<optgroup label="Generative">
			</optgroup>
			<optgroup label="Reinforcement">
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
				setTerminate: this.setTerminate.bind(this)
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
				const loadmlscript = (e) => {
					if (loaded_cnt < depend_cnt) {
						setTimeout(loadmlscript, 10, e);
						return;
					}
					window[this.mlType + "_init"](e.select("div"), this.mlMode, settings);
				}
				mlelem = ready_mlelm(this.mlType, loadmlscript);
			} else {
				window[this.mlType + "_init"](mlelem.select("div"), this.mlMode, settings);
			}
			mlelem.style("display", "inline");
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

