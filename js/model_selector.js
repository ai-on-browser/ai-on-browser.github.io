var r=Object.defineProperty;var s=(l,e)=>r(l,"name",{value:e,configurable:!0});let ai_manager=null;const displaySelector=document.querySelector("#display");displaySelector.onchange=()=>{const l=displaySelector.value;for(const e of document.querySelectorAll("#display-area > *"))e.style.display=e.id===l?"block":"none"};const AIData={"":"",manual:"manual",text:"text",functional:"function",camera:"camera",capture:"capture",microphone:"microphone",upload:"upload",air:"air passenger",hr_diagram:"HR Diagram",titanic:"Titanic",uci:"UCI",esl:"ESL",statlib:"StatLib",mnist:"MNIST",dashboard_estat:"e-Stat",eurostat:"Eurostat",poke:"Pok\xE9mon"},AITask={CT:"Clustering",CF:"Classification",SC:"Semi-supervised Classification",RG:"Regression",IN:"Interpolation",RL:"Ranking Learning",AD:"Anomaly Detection",DR:"Dimension Reduction",FS:"Feature Selection",TF:"Transformation",GR:"Generate",DE:"Density Estimation",SM:"Smoothing",TP:"Timeseries Prediction",CP:"Change Point Detection",FA:"Frequency Analysis",MV:"Missing Value Completion",IP:"Image Processing",SG:"Segmentation",DN:"Denoising",ED:"Edge Detection",NL:"Natural Language Processing",WE:"Word Embedding",WC:"Word Cloud",RC:"Recommendation",MD:"Markov Decision Process",GM:"Game"},AIPreprocess={function:{title:"Basis function",tasks:["CF","SC","RG","IN","RL","AD","DR","CP"]},transform:{title:"Transformers",tasks:["CT","CF","SC","RG","IN","RL","AD","DR","FS","SM","TP","CP"]}};for(const l of Object.keys(AIPreprocess))for(const e of AIPreprocess[l].tasks)AIPreprocess[e]||(AIPreprocess[e]=[]),AIPreprocess[e].push(l);const AIMethods=[{group:"CT",methods:{Centroids:[{value:"kmeans",title:"K-Means(++) / K-Medoids / K-Medians"},{value:"xmeans",title:"X-Means"},{value:"gmeans",title:"G-Means"},{value:"weighted_kmeans",title:"Weighted k-means"},{value:"isodata",title:"ISODATA"},{value:"soft_kmeans",title:"Soft K-Means"},{value:"fuzzy_cmeans",title:"Fuzzy C-Means"},{value:"pcm",title:"Possibilistic C-Means"},{value:"kernel_kmeans",title:"Kernel K-Means"},{value:"genetic_kmeans",title:"Genetic k-means"},{value:"lbg",title:"Linde-Buzo-Gray"},{value:"pam",title:"PAM / CLARA"},{value:"clarans",title:"CLARANS"},{value:"macqueen_kmeans",title:"MacQueen's k-Means"},{value:"bisecting_kmeans",title:"Bisecting k-Means"},{value:"hartigan_wong_kmeans",title:"Hartigan-Wong k-Means"},{value:"kharmonic",title:"k-Harmonic Means"},{value:"elkan_kmeans",title:"Elkan's k-Means"},{value:"hamelry_kmeans",title:"Hamelry's k-Means"},{value:"drake_kmeans",title:"Drake's k-Means"},{value:"yinyang_kmeans",title:"Yinyang k-Means"},{value:"som",title:"Self-organizing map"},{value:"neural_gas",title:"Neural Gas"},{value:"growing_som",title:"Growing SOM"},{value:"growing_neural_gas",title:"Growing Neural Gas"},{value:"growing_cell_structures",title:"Growing Cell Structures"},{value:"gtm",title:"Generative Topographic Mapping"},{value:"lvq",title:"Learning vector quantization"},{value:"mountain",title:"Mountain"},{value:"spectral",title:"Spectral clustering"}],Hierarchy:[{value:"agglomerative",title:"Agglomerative"},{value:"birch",title:"BIRCH"},{value:"cure",title:"CURE"},{value:"rock",title:"ROCK"},{value:"c2p",title:"C2P"},{value:"diana",title:"DIANA"},{value:"monothetic",title:"Monothetic"}],Distribution:[{value:"gmm",title:"Gaussian mixture model"},{value:"vbgmm",title:"Variational Bayesian GMM"}],Density:[{value:"mean_shift",title:"Mean Shift"},{value:"dbscan",title:"DBSCAN"},{value:"optics",title:"OPTICS"},{value:"hdbscan",title:"HDBSCAN"},{value:"denclue",title:"DENCLUE"},{value:"dbclasd",title:"DBCLASD"},{value:"bridge",title:"BRIDGE"}],"":[{value:"mutual_knn",title:"Mutual kNN"},{value:"art",title:"Adaptive resonance theory"},{value:"svc",title:"Support vector clustering"},{value:"affinity_propagation",title:"Affinity Propagation"},{value:"cast",title:"CAST"},{value:"clues",title:"CLUES"},{value:"chameleon",title:"CHAMELEON"},{value:"coll",title:"COLL"},{value:"clique",title:"CLIQUE"},{value:"proclus",title:"PROCLUS"},{value:"orclus",title:"ORCLUS"},{value:"findit",title:"FINDIT"},{value:"plsa",title:"PLSA"},{value:"latent_dirichlet_allocation",title:"Latent Dirichlet Allocation"},{value:"nmf",title:"NMF"},{value:"autoencoder",title:"Autoencoder"}]}},{group:"CF",methods:{"Discriminant Analysis":[{value:"lda",title:"LDA / FLD"},{value:"quadratic_discriminant",title:"Quadratic Discriminant"},{value:"mda",title:"Mixture Discriminant"}],Bayes:[{value:"naive_bayes",title:"Naive Bayes"},{value:"complement_naive_bayes",title:"Complement Naive Bayes"},{value:"negation_naive_bayes",title:"Negation Naive Bayes"},{value:"universal_set_naive_bayes",title:"Universal-set Naive Bayes"},{value:"selective_naive_bayes",title:"Selective Naive Bayes"},{value:"aode",title:"AODE"}],"Decision Tree":[{value:"decision_tree",title:"Decision Tree"},{value:"random_forest",title:"Random Forest"},{value:"extra_trees",title:"Extra Trees"},{value:"gbdt",title:"GBDT"},{value:"xgboost",title:"XGBoost"}],"Nearest neighbor":[{value:"knearestneighbor",title:"k nearest neighbor"},{value:"radius_neighbor",title:"Radius neighbor"},{value:"weighted_knn",title:"Weighted KNN"},{value:"fuzzy_knearestneighbor",title:"Fuzzy KNN"},{value:"enn",title:"Extended Nearest Neighbor"},{value:"enan",title:"Extended Natural Neighbor"},{value:"nnbca",title:"NNBCA"},{value:"adamenn",title:"Adaptive Metric Nearest Neighbor"},{value:"dann",title:"Discriminant adaptive nearest neighbor"},{value:"iknn",title:"IKNN"},{value:"lmnn",title:"LMNN"}],Online:[{value:"alma",title:"ALMA"},{value:"romma",title:"ROMMA"},{value:"ogd",title:"Online Gradient Descent"},{value:"passive_aggressive",title:"Passive Aggressive"},{value:"rls",title:"Recursive Least Squares"},{value:"sop",title:"Second Order Perceptron"},{value:"confidence_weighted",title:"Confidence Weighted"},{value:"iellip",title:"CELLIP / IELLIP"},{value:"arow",title:"AROW"},{value:"narow",title:"NAROW"},{value:"normal_herd",title:"Normal HERD"},{value:"stoptron",title:"Stoptron"},{value:"pegasos",title:"Pegasos"},{value:"kernelized_pegasos",title:"Kernelized Pegasos"},{value:"mira",title:"MIRA"},{value:"forgetron",title:"Forgetron"},{value:"projectron",title:"Projectron / Projectron++"},{value:"selective_sampling_perceptron",title:"Selective-sampling Perceptron"},{value:"selective_sampling_sop",title:"Selective-sampling SOP"},{value:"voted_perceptron",title:"Voted Perceptron"},{value:"kernelized_perceptron",title:"Kernelized Perceptron"},{value:"budget_perceptron",title:"Budget Perceptron"},{value:"margin_perceptron",title:"Margin Perceptron"},{value:"paum",title:"PAUM"},{value:"shifting_perceptron",title:"Shifting Perceptron"},{value:"rbp",title:"RBP"},{value:"banditron",title:"Banditron"},{value:"ballseptron",title:"Ballseptron"},{value:"tighter_perceptron",title:"Tighter Perceptron"},{value:"tightest_perceptron",title:"Tightest Perceptron"},{value:"bsgd",title:"BSGD"},{value:"silk",title:"ILK / SILK"},{value:"bpa",title:"BPA"},{value:"bogd",title:"BOGD"}],Netrowk:[{value:"lvq",title:"Learning vector quantization"},{value:"perceptron",title:"Perceptron"},{value:"adaline",title:"ADALINE"},{value:"madaline",title:"MADALINE"},{value:"mlp",title:"Multi-layer perceptron"},{value:"elm",title:"Extreme learning machine"},{value:"neuralnetwork",title:"Neuralnetwork"}],"":[{value:"least_square",title:"Least squares"},{value:"ridge",title:"Ridge"},{value:"nearest_centroid",title:"Nearest Centroid"},{value:"logistic",title:"Logistic regression"},{value:"probit",title:"Probit"},{value:"svm",title:"Support vector machine"},{value:"gaussian_process",title:"Gaussian Process"},{value:"hmm",title:"HMM"},{value:"crf",title:"CRF"},{value:"bayesian_network",title:"Bayesian Network"}]}},{group:"SC",methods:[{value:"knearestneighbor",title:"k nearest neighbor"},{value:"radius_neighbor",title:"Radius neighbor"},{value:"label_propagation",title:"Label propagation"},{value:"label_spreading",title:"Label spreading"},{value:"kmeans",title:"K-Means"},{value:"gmm",title:"Gaussian mixture model"},{value:"s3vm",title:"Support vector machine"},{value:"ladder_network",title:"Ladder network"}]},{group:"RG",methods:{"Least Square":[{value:"least_square",title:"Least squares"},{value:"ridge",title:"Ridge"},{value:"lasso",title:"Lasso"},{value:"elastic_net",title:"Elastic Net"},{value:"rls",title:"Recursive Least Squares"},{value:"least_absolute",title:"Least Absolute Deviations"},{value:"huber_regression",title:"Huber"},{value:"tukey_regression",title:"Tukey"},{value:"lts",title:"Least Trimmed Squares"},{value:"lmeds",title:"Least Median Squares"},{value:"lpnorm_linear",title:"Lp norm linear"},{value:"sma",title:"SMA"},{value:"deming",title:"Deming"}],kernel:[{value:"nadaraya_watson",title:"Nadaraya Watson"},{value:"priestley_chao",title:"Priestley Chao"},{value:"gasser_muller",title:"Gasser Muller"}],"Decision Tree":[{value:"decision_tree",title:"Decision Tree"},{value:"random_forest",title:"Random Forest"},{value:"extra_trees",title:"Extra Trees"},{value:"gbdt",title:"GBDT"},{value:"xgboost",title:"XGBoost"}],"Nearest neighbor":[{value:"knearestneighbor",title:"k nearest neighbor"},{value:"radius_neighbor",title:"Radius neighbor"},{value:"inverse_distance_weighting",title:"IDW"}],"":[{value:"bayesian_linear",title:"Bayesian Linear"},{value:"poisson",title:"Poisson"},{value:"segmented",title:"Segmented"},{value:"lowess",title:"LOWESS"},{value:"loess",title:"LOESS"},{value:"spline",title:"Spline"},{value:"naive_bayes_regression",title:"Naive Bayes"},{value:"gaussian_process",title:"Gaussian Process"},{value:"pcr",title:"Principal Components"},{value:"pls",title:"Partial Least Squares"},{value:"ppr",title:"Projection Pursuit"},{value:"quantile_regression",title:"Quantile Regression"},{value:"rbf",title:"RBF Network"},{value:"rvm",title:"RVM"},{value:"svr",title:"Support vector regression"},{value:"mlp",title:"Multi-layer perceptron"},{value:"elm",title:"Extreme learning machine"},{value:"neuralnetwork",title:"Neuralnetwork"},{value:"gmm",title:"Gaussian mixture regression"},{value:"isotonic",title:"Isotonic"},{value:"ramer_douglas_peucker",title:"Ramer Douglas Peucker"},{value:"theil_sen",title:"Theil-Sen"},{value:"passing_bablok",title:"Passing Bablok"},{value:"rmr",title:"Repeated Median"}]}},{group:"IN",methods:[{value:"knearestneighbor",title:"nearest neighbor"},{value:"inverse_distance_weighting",title:"IDW"},{value:"lerp",title:"Linear"},{value:"slerp",title:"Spherical linear"},{value:"brahmagupta_interpolation",title:"Brahmagupta"},{value:"logarithmic_interpolation",title:"Logarithmic"},{value:"cosine_interpolation",title:"Cosine"},{value:"smoothstep",title:"Smoothstep"},{value:"inverse_smoothstep",title:"Inverse Smoothstep"},{value:"cubic_interpolation",title:"Cubic"},{value:"cubic_hermite_spline",title:"Cubic Hermite"},{value:"catmull_rom",title:"Catmull Rom"},{value:"polynomial_interpolation",title:"Polynomial"},{value:"lagrange",title:"Lagrange"},{value:"trigonometric_interpolation",title:"Trigonometric"},{value:"spline_interpolation",title:"Spline"},{value:"rbf",title:"RBF Network"},{value:"akima",title:"Akima"},{value:"natural_neighbor_interpolation",title:"Natural neighbor"},{value:"delaunay_interpolation",title:"Delaunay"}]},{group:"RL",methods:[{value:"ordered_logistic",title:"Ordered logistic regression"},{value:"ordered_probit",title:"Ordered probit regression"},{value:"prank",title:"PRank"},{value:"oapbpm",title:"OAP-BPM"},{value:"ranknet",title:"RankNet"}]},{group:"AD",methods:[{value:"percentile",title:"Percentile"},{value:"mad",title:"MAD"},{value:"tukeys_fences",title:"Tukey's fences"},{value:"smirnov_grubbs",title:"Grubbs's test"},{value:"thompson",title:"Thompson test"},{value:"tietjen_moore",title:"Tietjen-Moore test"},{value:"generalized_esd",title:"Generalized ESD"},{value:"hotelling",title:"Hotelling"},{value:"mt",title:"MT"},{value:"mcd",title:"MCD"},{value:"knearestneighbor",title:"k nearest neighbor"},{value:"lof",title:"LOF"},{value:"cof",title:"COF"},{value:"odin",title:"ODIN"},{value:"ldof",title:"LDOF"},{value:"inflo",title:"INFLO"},{value:"loci",title:"LOCI"},{value:"loop",title:"LoOP"},{value:"rdf",title:"RDF"},{value:"ldf",title:"LDF"},{value:"kdeos",title:"KDEOS"},{value:"rdos",title:"RDOS"},{value:"nof",title:"NOF"},{value:"rkof",title:"RKOF"},{value:"abod",title:"ABOD"},{value:"pca",title:"PCA"},{value:"ocsvm",title:"One class SVM"},{value:"kernel_density_estimator",title:"Kernel Density Estimator"},{value:"gmm",title:"Gaussian mixture model"},{value:"isolation_forest",title:"Isolation Forest"},{value:"autoencoder",title:"Autoencoder"},{value:"gan",title:"GAN"}]},{group:"DR",methods:[{value:"random_projection",title:"Random projection"},{value:"pca",title:"PCA"},{value:"incremental_pca",title:"Incremental PCA"},{value:"probabilistic_pca",title:"Probabilistic PCA"},{value:"gplvm",title:"GPLVM"},{value:"lsa",title:"LSA"},{value:"mds",title:"MDS"},{value:"lda",title:"Linear Discriminant Analysis"},{value:"nca",title:"NCA"},{value:"ica",title:"ICA"},{value:"principal_curve",title:"Principal curve"},{value:"sammon",title:"Sammon"},{value:"fastmap",title:"FastMap"},{value:"sir",title:"Sliced Inverse Regression"},{value:"lle",title:"LLE"},{value:"hlle",title:"HLLE"},{value:"mlle",title:"MLLE"},{value:"laplacian_eigenmaps",title:"Laplacian eigenmaps"},{value:"isomap",title:"Isomap"},{value:"ltsa",title:"LTSA"},{value:"diffusion_map",title:"Diffusion map"},{value:"tsne",title:"SNE / t-SNE"},{value:"umap",title:"UMAP"},{value:"som",title:"Self-organizing map"},{value:"gtm",title:"Generative Topographic Mapping"},{value:"nmf",title:"NMF"},{value:"mod",title:"Method of Optimal Direction"},{value:"ksvd",title:"K-SVD"},{value:"autoencoder",title:"Autoencoder"},{value:"vae",title:"VAE"}]},{group:"FS",methods:[{value:"mutual_information",title:"Mutual Information"},{value:"ridge",title:"Ridge"},{value:"lasso",title:"Lasso"},{value:"elastic_net",title:"Elastic Net"},{value:"decision_tree",title:"Decision Tree"},{value:"nca",title:"NCA"}]},{group:"TF",methods:[{value:"box_cox",title:"Box-Cox"},{value:"yeo_johnson",title:"Yeo-Johnson"}]},{group:"DE",methods:[{value:"histogram",title:"Histogram"},{value:"average_shifted_histogram",title:"Average Shifted Histogram"},{value:"polynomial_histogram",title:"Polynomial Histogram"},{value:"maximum_likelihood",title:"Maximum Likelihood"},{value:"kernel_density_estimator",title:"Kernel Density Estimator"},{value:"knearestneighbor",title:"k nearest neighbor"},{value:"naive_bayes",title:"Naive Bayes"},{value:"gmm",title:"Gaussian mixture model"},{value:"hmm",title:"HMM"}]},{group:"GR",methods:[{value:"mh",title:"MH"},{value:"slice_sampling",title:"Slice Sampling"},{value:"gmm",title:"GMM"},{value:"rbm",title:"GBRBM"},{value:"hmm",title:"HMM"},{value:"vae",title:"VAE"},{value:"gan",title:"GAN"},{value:"nice",title:"NICE"}]},{group:"SM",methods:[{value:"moving_average",title:"Moving Average"},{value:"exponential_average",title:"Exponential Average"},{value:"moving_median",title:"Moving Median"},{value:"cumulative_moving_average",title:"Cumulative Moving Average"},{value:"kz",title:"Kolmogorov-Zurbenko Filter"},{value:"savitzky_golay",title:"Savitzky Golay Filter"},{value:"hampel",title:"Hampel Filter"},{value:"kalman_filter",title:"Kalman Filter"},{value:"particle_filter",title:"Particle Filter"},{value:"lowpass",title:"Lowpass Filter"},{value:"bessel",title:"Bessel Filter"},{value:"butterworth",title:"Butterworth Filter"},{value:"chebyshev",title:"Chebyshev Filter"},{value:"elliptic_filter",title:"Elliptic Filter"}]},{group:"TP",methods:[{value:"holt_winters",title:"Holt Winters"},{value:"ar",title:"AR"},{value:"arma",title:"ARMA"},{value:"sdar",title:"SDAR"},{value:"var",title:"VAR"},{value:"kalman_filter",title:"Kalman Filter"},{value:"mlp",title:"Multi-layer perceptron"},{value:"neuralnetwork",title:"Neuralnetwork"},{value:"rnn",title:"Recurrent neuralnetwork"}]},{group:"CP",methods:[{value:"cumulative_sum",title:"Cumulative Sum"},{value:"knearestneighbor",title:"k nearest neighbor"},{value:"lof",title:"LOF"},{value:"cof",title:"COF"},{value:"sst",title:"SST"},{value:"kliep",title:"KLIEP"},{value:"lsif",title:"LSIF"},{value:"ulsif",title:"uLSIF"},{value:"lsdd",title:"LSDD"},{value:"hmm",title:"HMM"},{value:"markov_switching",title:"Markov Switching"},{value:"change_finder",title:"Change Finder"}]},{group:"SG",methods:{Thresholding:[{value:"ptile",title:"P-Tile"},{value:"automatic_thresholding",title:"Automatic Thresholding"},{value:"balanced_histogram",title:"Balanced histogram thresholding"},{value:"otsu",title:"Otsu"},{value:"sezan",title:"Sezan"},{value:"adaptive_thresholding",title:"Adaptive Thresholding"},{value:"bernsen",title:"Bernsen"},{value:"niblack",title:"Niblack"},{value:"sauvola",title:"Sauvola"},{value:"phansalkar",title:"Phansalkar"}],"":[{value:"split_merge",title:"Split and merge"},{value:"statistical_region_merging",title:"Statistical Region Merging"},{value:"mean_shift",title:"Mean Shift"}]}},{group:"ED",methods:[{value:"roberts",title:"Roberts Cross"},{value:"sobel",title:"Sobel"},{value:"prewitt",title:"Prewitt"},{value:"laplacian",title:"Laplacian"},{value:"log",title:"Laplacian Of Gaussian"},{value:"canny",title:"Canny"},{value:"snakes",title:"Snakes"}]},{group:"DN",methods:[{value:"nlmeans",title:"NL Means"},{value:"hopfield",title:"Hopfield network"},{value:"rbm",title:"RBM / GBRBM"}]},{group:"WE",methods:[{value:"word_to_vec",title:"Word2Vec"}]},{group:"MD",methods:[{value:"dynamic_programming",title:"DP"},{value:"monte_carlo",title:"MC"},{value:"q_learning",title:"Q Learning"},{value:"sarsa",title:"SARSA"},{value:"policy_gradient",title:"Policy Gradient"},{value:"dqn",title:"DQN / DDQN"},{value:"a2c",title:"A2C"},{value:"genetic_algorithm",title:"Genetic Algorithm"}]},{group:"GM",methods:[{value:"dqn",title:"DQN / DDQN"}]},{group:"RC",methods:[{value:"association_analysis",title:"Association Analysis"}]}];for(const l of AIMethods)AIMethods[l.group]=l;const app=Vue.createApp({});app.component("model-selector",{data:s(function(){return{aiData:AIData,aiTask:AITask,aiPreprocess:AIPreprocess,modelFilter:"",state:{},mlData:"manual",mlTask:"",mlPreprocess:"",mlModel:"",isLoadParam:!1,historyWillPush:!1,settings:(l=>({rl:{get configElement(){return document.querySelector("#rl_menu")}},ml:{get configElement(){return d3.select("#method_menu .buttons")},get modelName(){return l.mlModel},set usage(e){const t=document.querySelector("#method_menu .usage-content");t.querySelector(".usage").innerText=e,e?t.classList.remove("hide"):t.classList.add("hide")},set draft(e){e?document.querySelector("#method_menu .draft").classList.remove("hide"):document.querySelector("#method_menu .draft").classList.add("hide")},set require(e){let t="";e?.dimension&&(Array.isArray(e.dimension)?e.dimension.includes(ai_manager.datas.dimension||1)||(t+=`This model works with ${e.dimension.join(" or ")}D data.`):(ai_manager.datas.dimension||1)!==e.dimension&&(t+=`This model works with ${e?.dimension}D data.`)),document.querySelector("#method_menu .require-info").innerText=t},set detail(e){const t=document.querySelector("#method_menu .detail-content"),a=t.querySelector(".detail");a.innerHTML=e,e?t.classList.remove("hide"):t.classList.add("hide"),MathJax.typesetPromise([a])},set reference(e){const t=document.querySelector("#method_menu .reference-content");let a=t.querySelector(".reference");if(a.innerText="",e){if(e.url){const i=document.createElement("a");i.href=e.url,i.rel="noreferrer noopener",i.target="_blank",a.appendChild(i),a=i}e.author&&(a.innerText+=e.author+" "),a.innerText+='"'+e.title+'"',e.year&&(a.innerText+=" ("+e.year+")"),t.classList.remove("hide")}else t.classList.add("hide")},refresh(){l.ready()}},data:{get configElement(){return document.querySelector("#data_menu")}},task:{get configElement(){return document.querySelector("#task_menu")}},preprocess:{get configElement(){return document.querySelector("#preprocess_menu")}},render:{addItem(e){document.querySelector("#display-type").style.display="block";const t=`${e}-area`,a=document.createElement("option");a.value=t,a.innerText=e,displaySelector.appendChild(a);const i=document.createElement("div");return i.id=t,displaySelector.options.length===1?document.querySelector("#display-type").style.display="none":i.style.display="none",document.querySelector("#display-area").appendChild(i),i},selectItem(e){const t=`${e}-area`;for(const a of displaySelector.options)if(a.value===t){a.selected=!0,displaySelector.onchange();return}},removeItem(e){const t=`${e}-area`,a=document.querySelector(`#display-area #${t}`);a&&a.remove();let i=!1;for(const o of displaySelector.options)o.value===t&&(displaySelector.removeChild(o),i=!0);i&&displaySelector.options.length>0&&(displaySelector.options[0].selected=!0,displaySelector.onchange()),displaySelector.options.length===1&&(document.querySelector("#display-type").style.display="none")}},get footer(){return document.querySelector("#method_footer")},$forceUpdate(){return l.$forceUpdate()},pushHistory(){return l.pushHistory()}}))(this),initScripts:{},get availTask(){const l=ai_manager?.datas?.availTask||[];return l.length>0&&!l.includes(this.mlTask)&&(this.mlTask=""),l}}},"data"),template:`
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
						<option v-if="availTask.length === 0 || availTask.includes(ag.group)" :key="ag.group" :value="ag.group">{{ aiTask[ag.group] }} ({{ modelCounts[ag.group] }})</option>
					</template>
				</select>
				<dd>
					Filter
					<div class="clearable-text">
						<input class="clear-box" type="text" v-model="modelFilter" />
						<div class="clear-text" v-on:click="modelFilter = ''" />
					</div>
				</dd>
			</dd>
			<dd>
				<div class="sub-menu">
					<div id="task_menu"></div>
					<div id="rl_menu" class="sub-menu"></div>
				</div>
			</dd>
			<template v-if="aiPreprocess[mlTask]">
				<dt>Preprocess</dt>
				<dd>
					<select v-model="mlPreprocess">
						<option value=""></option>
						<option v-for="itm in aiPreprocess[mlTask]" :key="itm" :value="itm">{{ aiPreprocess[itm].title }}</option>
					</select>
				</dd>
				<dd>
					<div id="preprocess_menu" class="sub-menu"></div>
				</dd>
			</template>
			<div v-if="mlTask !== ''" class="model_selection">
				<div>
					<dt>Model</dt>
					<dd>
						<select id="mlDisp" v-model="mlModel">
							<option value=""></option>
							<template v-if="Array.isArray(aiMethods[mlTask].methods)">
								<option v-for="itm in aiMethods[mlTask].methods" :key="itm.value" :value="itm.value">{{ itm.title }}</option>
							</template>
							<template v-else>
								<template v-for="submethods, group in aiMethods[mlTask].methods">
									<optgroup v-if="group.length > 0" :key="group" :label="group">
										<option v-for="itm in submethods" :key="itm.value" :value="itm.value">{{ itm.title }}</option>
									</optgroup>
									<template v-else>
										<option v-for="itm in submethods" :key="itm.value" :value="itm.value">{{ itm.title }}</option>
									</template>
								</template>
							</template>
						</select>
					</dd>
				</div>
				<div v-if="mlModel !== ''">
					<a :href="'https://github.com/ai-on-browser/ai-on-browser.github.io/blob/main/lib/model/' + mlModel + '.js'" rel="noreferrer noopener" target="_blank">source</a>
				</div>
			</div>
		</dl>
		<div id="method_menu">
			<div class="reference-content hide">
				<input id="acd-reference" type="checkbox" class="acd-check" checked>
				<label for="acd-reference" class="acd-label">References</label>
				<div class="reference acd-content"></div>
			</div>
			<div class="alert hide draft">This model may not be working properly.</div>
			<div class="alert require-info"></div>
			<div class="detail-content hide">
				<input id="acd-detail" type="checkbox" class="acd-check">
				<label for="acd-detail" class="acd-label">Model algorithm</label>
				<div class="detail acd-content"></div>
			</div>
			<div class="usage-content hide">
				<input id="acd-usage" type="checkbox" class="acd-check" checked>
				<label for="acd-usage" class="acd-label">Usage</label>
				<div class="usage acd-content"></div>
			</div>
			<div class="buttons"></div>
		</div>
	`,created(){const l={data:"manual",task:"",model:"",...Object.fromEntries(new URLSearchParams(location.search).entries())};import("./manager.js").then(e=>{ai_manager||(ai_manager=new e.default(this.settings),this.$forceUpdate(),this.setState(l))}),window.onpopstate=e=>{this.setState(e.state||{data:"manual",task:"",model:""})}},computed:{aiMethods(){if(this.modelFilter==="")return AIMethods;const l=new RegExp(this.modelFilter,"i"),e=[];for(let t=0;t<AIMethods.length;t++){if(e[t]={group:AIMethods[t].group},Array.isArray(AIMethods[t].methods))e[t].methods=AIMethods[t].methods.filter(a=>l.test(a.title));else{e[t].methods={};for(const a of Object.keys(AIMethods[t].methods))e[t].methods[a]=AIMethods[t].methods[a].filter(i=>l.test(i.title))}e[AIMethods[t].group]=e[t]}return e},modelCounts(){const l={};for(let e=0;e<this.aiMethods.length;e++){const t=this.aiMethods[e].group;if(Array.isArray(this.aiMethods[e].methods))l[t]=this.aiMethods[e].methods.length;else{l[t]=0;for(const a of Object.keys(this.aiMethods[e].methods))l[t]+=this.aiMethods[e].methods[a].length}}return l}},watch:{mlData(){this.isLoadParam||(this.mlTask="",this.pushHistory()),ai_manager?.setData(this.mlData).then(()=>{ai_manager.datas.params=this.state,this.$forceUpdate()})},mlTask(){this.isLoadParam||(this.mlModel="",this.mlPreprocess="",this.pushHistory(),this.ready())},mlPreprocess(){this.isLoadParam||(this.pushHistory(),this.ready())},mlModel(){this.isLoadParam||(this.pushHistory(),this.ready())}},methods:{pushHistory(){if(this.historyWillPush||this.isLoadParam)return;this.historyWillPush=!0;let l=this.state={data:this.mlData,task:this.mlTask,preprocess:this.mlPreprocess,model:this.mlModel,...ai_manager.datas?.params,...ai_manager.platform?.params};Promise.resolve().then(()=>{l=this.state={data:this.mlData,task:this.mlTask,preprocess:this.mlPreprocess,model:this.mlModel,...ai_manager.datas?.params,...ai_manager.platform?.params};let e="?";const t=Object.keys(this.state).reduce((a,i)=>(this.state[i]!=null&&(a+=`${e}${i}=${encodeURIComponent(this.state[i])}`,e="&"),a),"/");window.history.pushState(l,"",t),document.title=this.title(),this.historyWillPush=!1})},setState(l){this.isLoadParam=!0,this.state=l,this.mlData=l.data,this.mlTask=l.task,this.mlPreprocess=l.preprocess,this.mlModel=l.model,ai_manager.datas&&(ai_manager.datas.params=l),document.title=this.title(),this.$nextTick(()=>{this.isLoadParam=!1,this.ready()})},title(){let l="AI on Browser",e=" - ";for(const t of Object.keys(this.state)){let a=this.state[t];a&&(t==="task"&&(a=this.aiTask[a]),l+=e+t.charAt(0).toUpperCase()+t.slice(1)+" : "+a,e=", ")}return l},ready(){const l=this.mlModel,e=document.querySelector("#method_menu");e.querySelector(".buttons").replaceChildren(),e.querySelector(".draft").classList.add("hide"),e.querySelector(".require-info").innerText="",e.querySelector(".detail-content").classList.add("hide"),e.querySelector(".usage-content").classList.add("hide"),e.querySelector(".reference-content").classList.add("hide");const t=s(()=>{if(!l){ai_manager.setModel("");return}const a=document.createElement("div");a.classList.add("loader"),e.appendChild(a),e.querySelector(".buttons").replaceChildren(),ai_manager.setModel(l).then(()=>{a.remove()})},"readyModel");ai_manager.setTask(this.mlTask).then(()=>{ai_manager.platform&&(ai_manager.platform.params=this.state),ai_manager.setPreprocess(this.mlPreprocess),t()})}}}),app.mount("#ml_selector");
