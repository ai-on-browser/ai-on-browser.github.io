let ai_manager=null;const displaySelector=document.querySelector("#display");displaySelector.onchange=()=>{const e=displaySelector.value;for(const t of document.querySelectorAll("#display-area > *"))t.style.display=t.id===e?"block":"none"};const AIData={"":"",manual:"manual",text:"text",functional:"function",camera:"camera",capture:"capture",microphone:"microphone",upload:"upload",air:"air passenger",hr_diagram:"HR Diagram",titanic:"Titanic",uci:"UCI",esl:"ESL",statlib:"StatLib",dashboard_estat:"e-Stat",poke:"Pokémon"},AITask={CT:"Clustering",CF:"Classification",SC:"Semi-supervised Classification",RG:"Regression",IN:"Interpolation",AD:"Anomaly Detection",DR:"Dimension Reduction",FS:"Feature Selection",TF:"Transformation",GR:"Generate",DE:"Density Estimation",SM:"Smoothing",TP:"Timeseries Prediction",CP:"Change Point Detection",FA:"Frequency Analysis",MV:"Missing Value Completion",IP:"Image Processing",SG:"Segmentation",DN:"Denoising",ED:"Edge Detection",NL:"Natural Language Processing",WE:"Word Embedding",WC:"Word Cloud",RC:"Recommendation",MD:"Markov Decision Process",GM:"Game"},AIMethods=[{group:"CT",methods:{Centroids:[{value:"kmeans",title:"K-Means(++) / K-Medoids / K-Medians"},{value:"xmeans",title:"X-Means"},{value:"gmeans",title:"G-Means"},{value:"weighted_kmeans",title:"Weighted k-means"},{value:"isodata",title:"ISODATA"},{value:"soft_kmeans",title:"Soft K-Means"},{value:"fuzzy_cmeans",title:"Fuzzy C-Means"},{value:"pcm",title:"Possibilistic C-Means"},{value:"kernel_kmeans",title:"Kernel K-Means"},{value:"genetic_kmeans",title:"Genetic k-means"},{value:"lbg",title:"Linde-Buzo-Gray"},{value:"pam",title:"PAM / CLARA"},{value:"clarans",title:"CLARANS"},{value:"som",title:"Self-organizing map"},{value:"neural_gas",title:"Neural Gas"},{value:"growing_neural_gas",title:"Growing Neural Gas"},{value:"growing_cell_structures",title:"Growing Cell Structures"},{value:"gtm",title:"Generative Topographic Mapping"},{value:"lvq",title:"Learning vector quantization"},{value:"mountain",title:"Mountain"},{value:"spectral",title:"Spectral clustering"}],Hierarchy:[{value:"agglomerative",title:"Agglomerative"},{value:"birch",title:"BIRCH"},{value:"cure",title:"CURE"},{value:"rock",title:"ROCK"},{value:"c2p",title:"C2P"},{value:"diana",title:"DIANA"},{value:"monothetic",title:"Monothetic"}],Distribution:[{value:"gmm",title:"Gaussian mixture model"},{value:"vbgmm",title:"Variational Bayesian GMM"}],Density:[{value:"mean_shift",title:"Mean Shift"},{value:"dbscan",title:"DBSCAN"},{value:"optics",title:"OPTICS"},{value:"hdbscan",title:"HDBSCAN"},{value:"denclue",title:"DENCLUE"}],"":[{value:"mutual_knn",title:"Mutual kNN"},{value:"art",title:"Adaptive resonance theory"},{value:"svc",title:"Support vector clustering"},{value:"affinity_propagation",title:"Affinity Propagation"},{value:"cast",title:"CAST"},{value:"plsa",title:"PLSA"},{value:"latent_dirichlet_allocation",title:"Latent Dirichlet Allocation"},{value:"nmf",title:"NMF"},{value:"autoencoder",title:"Autoencoder"}]}},{group:"CF",methods:{"Discriminant Analysis":[{value:"lda",title:"LDA / FLD"},{value:"quadratic_discriminant",title:"Quadratic Discriminant"},{value:"mda",title:"Mixture Discriminant"}],Bayes:[{value:"naive_bayes",title:"Naive Bayes"},{value:"complement_naive_bayes",title:"Complement Naive Bayes"},{value:"negation_naive_bayes",title:"Negation Naive Bayes"},{value:"universal_set_naive_bayes",title:"Universal-set Naive Bayes"},{value:"selective_naive_bayes",title:"Selective Naive Bayes"},{value:"aode",title:"AODE"}],"Decision Tree":[{value:"decision_tree",title:"Decision Tree"},{value:"random_forest",title:"Random Forest"},{value:"extra_trees",title:"Extra Trees"},{value:"gbdt",title:"GBDT"},{value:"xgboost",title:"XGBoost"}],Online:[{value:"alma",title:"ALMA"},{value:"romma",title:"ROMMA"},{value:"ogd",title:"Online Gradient Descent"},{value:"passive_aggressive",title:"Passive Aggressive"},{value:"rls",title:"Recursive Least Squares"},{value:"sop",title:"Second Order Perceptron"},{value:"confidence_weighted",title:"Confidence Weighted"},{value:"iellip",title:"CELLIP / IELLIP"},{value:"arow",title:"AROW"},{value:"narow",title:"NAROW"},{value:"normal_herd",title:"Normal HERD"}],Netrowk:[{value:"lvq",title:"Learning vector quantization"},{value:"perceptron",title:"Perceptron"},{value:"adaline",title:"ADALINE"},{value:"mlp",title:"Multi-layer perceptron"},{value:"neuralnetwork",title:"Neuralnetwork"}],"":[{value:"least_square",title:"Least squares"},{value:"ridge",title:"Ridge"},{value:"knearestneighbor",title:"k nearest neighbor"},{value:"radius_neighbor",title:"Radius neighbor"},{value:"nearest_centroid",title:"Nearest Centroid"},{value:"fuzzy_knearestneighbor",title:"Fuzzy KNN"},{value:"enn",title:"Extended Nearest Neighbor"},{value:"dann",title:"Discriminant adaptive nearest neighbor"},{value:"logistic",title:"Logistic regression"},{value:"probit",title:"Probit"},{value:"svm",title:"Support vector machine"},{value:"gaussian_process",title:"Gaussian Process"},{value:"hmm",title:"HMM"},{value:"crf",title:"CRF"},{value:"bayesian_network",title:"Bayesian Network"},{value:"lmnn",title:"LMNN"}]}},{group:"SC",methods:[{value:"knearestneighbor",title:"k nearest neighbor"},{value:"radius_neighbor",title:"Radius neighbor"},{value:"label_propagation",title:"Label propagation"},{value:"label_spreading",title:"Label spreading"},{value:"kmeans",title:"K-Means"},{value:"gmm",title:"Gaussian mixture model"},{value:"s3vm",title:"Support vector machine"},{value:"ladder_network",title:"Ladder network"}]},{group:"RG",methods:{"Least Square":[{value:"least_square",title:"Least squares"},{value:"ridge",title:"Ridge"},{value:"lasso",title:"Lasso"},{value:"elastic_net",title:"Elastic Net"},{value:"rls",title:"Recursive Least Squares"},{value:"least_absolute",title:"Least Absolute Deviations"},{value:"huber_regression",title:"Huber"},{value:"tukey_regression",title:"Tukey"},{value:"lts",title:"Least Trimmed Squares"},{value:"lmeds",title:"Least Median Squares"},{value:"lpnorm_linear",title:"Lp norm linear"},{value:"sma",title:"SMA"},{value:"deming",title:"Deming"}],kernel:[{value:"nadaraya_watson",title:"Nadaraya Watson"},{value:"priestley_chao",title:"Priestley Chao"},{value:"gasser_muller",title:"Gasser Muller"}],"Decision Tree":[{value:"decision_tree",title:"Decision Tree"},{value:"random_forest",title:"Random Forest"},{value:"extra_trees",title:"Extra Trees"},{value:"gbdt",title:"GBDT"},{value:"xgboost",title:"XGBoost"}],"":[{value:"bayesian_linear",title:"Bayesian Linear"},{value:"poisson",title:"Poisson"},{value:"segmented",title:"Segmented"},{value:"lowess",title:"LOWESS"},{value:"spline",title:"Spline"},{value:"gaussian_process",title:"Gaussian Process"},{value:"pcr",title:"Principal Components"},{value:"pls",title:"Partial Least Squares"},{value:"ppr",title:"Projection Pursuit"},{value:"quantile_regression",title:"Quantile Regression"},{value:"knearestneighbor",title:"k nearest neighbor"},{value:"radius_neighbor",title:"Radius neighbor"},{value:"inverse_distance_weighting",title:"IDW"},{value:"rbf",title:"RBF Network"},{value:"rvm",title:"RVM"},{value:"svr",title:"Support vector regression"},{value:"mlp",title:"Multi-layer perceptron"},{value:"neuralnetwork",title:"Neuralnetwork"},{value:"gmm",title:"Gaussian mixture regression"},{value:"isotonic",title:"Isotonic"},{value:"ramer_douglas_peucker",title:"Ramer Douglas Peucker"},{value:"theil_sen",title:"Theil-Sen"},{value:"passing_bablok",title:"Passing Bablok"},{value:"rmr",title:"Repeated Median"}]}},{group:"IN",methods:[{value:"knearestneighbor",title:"nearest neighbor"},{value:"inverse_distance_weighting",title:"IDW"},{value:"lerp",title:"Linear"},{value:"slerp",title:"Spherical linear"},{value:"brahmagupta_interpolation",title:"Brahmagupta"},{value:"logarithmic_interpolation",title:"Logarithmic"},{value:"cosine_interpolation",title:"Cosine"},{value:"smoothstep",title:"Smoothstep"},{value:"inverse_smoothstep",title:"Inverse Smoothstep"},{value:"cubic_interpolation",title:"Cubic"},{value:"cubic_hermite_spline",title:"Cubic Hermite"},{value:"catmull_rom",title:"Catmull Rom"},{value:"polynomial_interpolation",title:"Polynomial"},{value:"lagrange",title:"Lagrange"},{value:"trigonometric_interpolation",title:"Trigonometric"},{value:"spline_interpolation",title:"Spline"},{value:"rbf",title:"RBF Network"},{value:"akima",title:"Akima"},{value:"natural_neighbor_interpolation",title:"Natural neighbor"},{value:"delaunay_interpolation",title:"Delaunay"}]},{group:"AD",methods:[{value:"percentile",title:"Percentile"},{value:"mad",title:"MAD"},{value:"tukeys_fences",title:"Tukey's fences"},{value:"smirnov_grubbs",title:"Grubbs's test"},{value:"thompson",title:"Thompson test"},{value:"tietjen_moore",title:"Tietjen-Moore test"},{value:"generalized_esd",title:"Generalized ESD"},{value:"hotelling",title:"Hotelling"},{value:"mt",title:"MT"},{value:"mcd",title:"MCD"},{value:"knearestneighbor",title:"k nearest neighbor"},{value:"lof",title:"LOF"},{value:"cof",title:"COF"},{value:"odin",title:"ODIN"},{value:"ldof",title:"LDOF"},{value:"inflo",title:"INFLO"},{value:"loci",title:"LOCI"},{value:"loop",title:"LoOP"},{value:"ldf",title:"LDF"},{value:"kdeos",title:"KDEOS"},{value:"rdos",title:"RDOS"},{value:"rkof",title:"RKOF"},{value:"pca",title:"PCA"},{value:"ocsvm",title:"One class SVM"},{value:"kernel_density_estimator",title:"Kernel Density Estimator"},{value:"gmm",title:"Gaussian mixture model"},{value:"isolation_forest",title:"Isolation Forest"},{value:"autoencoder",title:"Autoencoder"},{value:"gan",title:"GAN"}]},{group:"DR",methods:[{value:"random_projection",title:"Random projection"},{value:"pca",title:"PCA"},{value:"incremental_pca",title:"Incremental PCA"},{value:"probabilistic_pca",title:"Probabilistic PCA"},{value:"gplvm",title:"GPLVM"},{value:"lsa",title:"LSA"},{value:"mds",title:"MDS"},{value:"lda",title:"Linear Discriminant Analysis"},{value:"nca",title:"NCA"},{value:"ica",title:"ICA"},{value:"principal_curve",title:"Principal curve"},{value:"sammon",title:"Sammon"},{value:"fastmap",title:"FastMap"},{value:"sir",title:"Sliced Inverse Regression"},{value:"lle",title:"LLE"},{value:"hlle",title:"HLLE"},{value:"laplacian_eigenmaps",title:"Laplacian eigenmaps"},{value:"isomap",title:"Isomap"},{value:"diffusion_map",title:"Diffusion map"},{value:"tsne",title:"SNE / t-SNE"},{value:"umap",title:"UMAP"},{value:"som",title:"Self-organizing map"},{value:"gtm",title:"Generative Topographic Mapping"},{value:"nmf",title:"NMF"},{value:"mod",title:"Method of Optimal Direction"},{value:"ksvd",title:"K-SVD"},{value:"autoencoder",title:"Autoencoder"},{value:"vae",title:"VAE"}]},{group:"FS",methods:[{value:"mutual_information",title:"Mutual Information"},{value:"ridge",title:"Ridge"},{value:"lasso",title:"Lasso"},{value:"elastic_net",title:"Elastic Net"},{value:"decision_tree",title:"Decision Tree"},{value:"nca",title:"NCA"}]},{group:"TF",methods:[{value:"box_cox",title:"Box-Cox"},{value:"yeo_johnson",title:"Yeo-Johnson"}]},{group:"DE",methods:[{value:"histogram",title:"Histogram"},{value:"average_shifted_histogram",title:"Average Shifted Histogram"},{value:"polynomial_histogram",title:"Polynomial Histogram"},{value:"maximum_likelihood",title:"Maximum Likelihood"},{value:"kernel_density_estimator",title:"Kernel Density Estimator"},{value:"knearestneighbor",title:"k nearest neighbor"},{value:"naive_bayes",title:"Naive Bayes"},{value:"gmm",title:"Gaussian mixture model"},{value:"hmm",title:"HMM"}]},{group:"GR",methods:[{value:"mh",title:"MH"},{value:"slice_sampling",title:"Slice Sampling"},{value:"gmm",title:"GMM"},{value:"rbm",title:"GBRBM"},{value:"hmm",title:"HMM"},{value:"vae",title:"VAE"},{value:"gan",title:"GAN"},{value:"nice",title:"NICE"}]},{group:"SM",methods:[{value:"moving_average",title:"Moving Average"},{value:"exponential_average",title:"Exponential Average"},{value:"moving_median",title:"Moving Median"},{value:"cumulative_moving_average",title:"Cumulative Moving Average"},{value:"kz",title:"Kolmogorov-Zurbenko Filter"},{value:"savitzky_golay",title:"Savitzky Golay Filter"},{value:"hampel",title:"Hampel Filter"},{value:"kalman_filter",title:"Kalman Filter"},{value:"particle_filter",title:"Particle Filter"},{value:"lowpass",title:"Lowpass Filter"},{value:"bessel",title:"Bessel Filter"},{value:"butterworth",title:"Butterworth Filter"},{value:"chebyshev",title:"Chebyshev Filter"},{value:"elliptic_filter",title:"Elliptic Filter"}]},{group:"TP",methods:[{value:"holt_winters",title:"Holt Winters"},{value:"ar",title:"AR"},{value:"arma",title:"ARMA"},{value:"sdar",title:"SDAR"},{value:"var",title:"VAR"},{value:"kalman_filter",title:"Kalman Filter"},{value:"mlp",title:"Multi-layer perceptron"},{value:"neuralnetwork",title:"Neuralnetwork"},{value:"rnn",title:"Recurrent neuralnetwork"}]},{group:"CP",methods:[{value:"cumulative_sum",title:"Cumulative Sum"},{value:"knearestneighbor",title:"k nearest neighbor"},{value:"lof",title:"LOF"},{value:"cof",title:"COF"},{value:"sst",title:"SST"},{value:"kliep",title:"KLIEP"},{value:"lsif",title:"LSIF"},{value:"ulsif",title:"uLSIF"},{value:"lsdd",title:"LSDD"},{value:"hmm",title:"HMM"},{value:"markov_switching",title:"Markov Switching"},{value:"change_finder",title:"Change Finder"}]},{group:"SG",methods:{Thresholding:[{value:"ptile",title:"P-Tile"},{value:"automatic_thresholding",title:"Automatic Thresholding"},{value:"balanced_histogram",title:"Balanced histogram thresholding"},{value:"otsu",title:"Otsu"},{value:"sezan",title:"Sezan"},{value:"adaptive_thresholding",title:"Adaptive Thresholding"},{value:"bernsen",title:"Bernsen"},{value:"niblack",title:"Niblack"},{value:"sauvola",title:"Sauvola"},{value:"phansalkar",title:"Phansalkar"}],"":[{value:"split_merge",title:"Split and merge"},{value:"statistical_region_merging",title:"Statistical Region Merging"},{value:"mean_shift",title:"Mean Shift"}]}},{group:"ED",methods:[{value:"roberts",title:"Roberts Cross"},{value:"sobel",title:"Sobel"},{value:"prewitt",title:"Prewitt"},{value:"laplacian",title:"Laplacian"},{value:"log",title:"Laplacian Of Gaussian"},{value:"canny",title:"Canny"},{value:"snakes",title:"Snakes"}]},{group:"DN",methods:[{value:"nlmeans",title:"NL Means"},{value:"hopfield",title:"Hopfield network"},{value:"rbm",title:"RBM / GBRBM"}]},{group:"WE",methods:[{value:"word_to_vec",title:"Word2Vec"}]},{group:"MD",methods:[{value:"dynamic_programming",title:"DP"},{value:"monte_carlo",title:"MC"},{value:"q_learning",title:"Q Learning"},{value:"sarsa",title:"SARSA"},{value:"policy_gradient",title:"Policy Gradient"},{value:"dqn",title:"DQN / DDQN"},{value:"a2c",title:"A2C"},{value:"genetic_algorithm",title:"Genetic Algorithm"}]},{group:"GM",methods:[{value:"dqn",title:"DQN / DDQN"}]},{group:"RC",methods:[{value:"association_analysis",title:"Association Analysis"}]}];for(const e of AIMethods)AIMethods[e.group]=e;const app=Vue.createApp({});app.component("model-selector",{data:function(){return{aiData:AIData,aiTask:AITask,modelFilter:"",terminateFunction:[],state:{},mlData:"manual",mlTask:"",mlModel:"",isLoadParam:!1,historyWillPush:!1,settings:(e=this,{vue:e,set terminate(t){e.terminateFunction.push(t)},rl:{get configElement(){return document.querySelector("#rl_menu")}},ml:{get configElement(){return d3.select("#method_menu .buttons")},get modelName(){return e.mlModel},set usage(e){const t=document.querySelector("#method_menu .usage-content");t.querySelector(".usage").innerText=e,e?t.classList.remove("hide"):t.classList.add("hide")},set draft(e){e?document.querySelector("#method_menu .draft").classList.remove("hide"):document.querySelector("#method_menu .draft").classList.add("hide")},set require(e){let t="";e?.dimension&&(Array.isArray(e.dimension)?e.dimension.indexOf(ai_manager.datas.dimension||1)<0&&(t+=`This model works with ${e.dimension.join(" or ")}D data.`):(ai_manager.datas.dimension||1)!==e.dimension&&(t+=`This model works with ${e?.dimension}D data.`)),document.querySelector("#method_menu .require-info").innerText=t},set detail(e){const t=document.querySelector("#method_menu .detail-content"),a=t.querySelector(".detail");a.innerHTML=e,e?t.classList.remove("hide"):t.classList.add("hide"),MathJax.typesetPromise([a])},refresh(){e.ready()}},data:{get configElement(){return document.querySelector("#data_menu")}},task:{get configElement(){return document.querySelector("#task_menu")}},render:{addItem(e){document.querySelector("#display-type").style.display="block";const t=`${e}-area`,a=document.createElement("option");a.value=t,a.innerText=e,displaySelector.appendChild(a);const l=document.createElement("div");return l.id=t,1===displaySelector.options.length?document.querySelector("#display-type").style.display="none":l.style.display="none",document.querySelector("#display-area").appendChild(l),l},selectItem(e){const t=`${e}-area`;for(const e of displaySelector.options)if(e.value===t)return e.selected=!0,void displaySelector.onchange()},removeItem(e){const t=`${e}-area`,a=document.querySelector(`#display-area #${t}`);a&&a.remove();let l=!1;for(const e of displaySelector.options)e.value===t&&(displaySelector.removeChild(e),l=!0);l&&displaySelector.options.length>0&&(displaySelector.options[0].selected=!0,displaySelector.onchange()),1===displaySelector.options.length&&(document.querySelector("#display-type").style.display="none")}},get footer(){return document.querySelector("#method_footer")}}),initScripts:{},get availTask(){const e=ai_manager?.datas?.availTask||[];return e.length>0&&e.indexOf(this.mlTask)<0&&(this.mlTask=""),e}};var e},template:'\n\t\t<dl>\n\t\t\t<dt>Data</dt>\n\t\t\t<dd>\n\t\t\t\t<select v-model="mlData">\n\t\t\t\t\t<option v-for="(t, v) in aiData" :key="v" :value="v">{{ t }}</option>\n\t\t\t\t</select>\n\t\t\t</dd>\n\t\t\t<dd>\n\t\t\t\t<div id="data_menu" class="sub-menu"></div>\n\t\t\t</dd>\n\t\t\t<dt>Task</dt>\n\t\t\t<dd>\n\t\t\t\t<select v-model="mlTask">\n\t\t\t\t\t<option value=""></option>\n\t\t\t\t\t<template v-for="ag in aiMethods">\n\t\t\t\t\t\t<option v-if="availTask.length === 0 || availTask.indexOf(ag.group) >= 0" :key="ag.group" :value="ag.group">{{ aiTask[ag.group] }} ({{ modelCounts[ag.group] }})</option>\n\t\t\t\t\t</template>\n\t\t\t\t</select>\n\t\t\t\t<dd>\n\t\t\t\t\tFilter\n\t\t\t\t\t<div class="clearable-text">\n\t\t\t\t\t\t<input class="clear-box" type="text" v-model="modelFilter" />\n\t\t\t\t\t\t<div class="clear-text" v-on:click="modelFilter = \'\'" />\n\t\t\t\t\t</div>\n\t\t\t\t</dd>\n\t\t\t</dd>\n\t\t\t<dd>\n\t\t\t\t<div class="sub-menu">\n\t\t\t\t\t<div id="task_menu"></div>\n\t\t\t\t\t<div id="rl_menu" class="sub-menu"></div>\n\t\t\t\t</div>\n\t\t\t</dd>\n\t\t\t<div v-if="mlTask !== \'\'" class="model_selection">\n\t\t\t\t<div>\n\t\t\t\t\t<dt>Model</dt>\n\t\t\t\t\t<dd>\n\t\t\t\t\t\t<select id="mlDisp" v-model="mlModel">\n\t\t\t\t\t\t\t<option value=""></option>\n\t\t\t\t\t\t\t<template v-if="Array.isArray(aiMethods[mlTask].methods)">\n\t\t\t\t\t\t\t\t<option v-for="itm in aiMethods[mlTask].methods" :key="itm.value" :value="itm.value">{{ itm.title }}</option>\n\t\t\t\t\t\t\t</template>\n\t\t\t\t\t\t\t<template v-else>\n\t\t\t\t\t\t\t\t<template v-for="submethods, group in aiMethods[mlTask].methods">\n\t\t\t\t\t\t\t\t\t<optgroup v-if="group.length > 0" :key="group" :label="group">\n\t\t\t\t\t\t\t\t\t\t<option v-for="itm in submethods" :key="itm.value" :value="itm.value">{{ itm.title }}</option>\n\t\t\t\t\t\t\t\t\t</optgroup>\n\t\t\t\t\t\t\t\t\t<template v-else>\n\t\t\t\t\t\t\t\t\t\t<option v-for="itm in submethods" :key="itm.value" :value="itm.value">{{ itm.title }}</option>\n\t\t\t\t\t\t\t\t\t</template>\n\t\t\t\t\t\t\t\t</template>\n\t\t\t\t\t\t\t</template>\n\t\t\t\t\t\t</select>\n\t\t\t\t\t</dd>\n\t\t\t\t</div>\n\t\t\t\t<div v-if="mlModel !== \'\'">\n\t\t\t\t\t<a :href="\'https://github.com/ai-on-browser/ai-on-browser.github.io/blob/main/lib/model/\' + mlModel + \'.js\'" rel="noreferrer noopener" target="_blank">source</a>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</dl>\n\t\t<div id="method_menu">\n\t\t\t<div class="alert hide draft">This model may not be working properly.</div>\n\t\t\t<div class="alert require-info"></div>\n\t\t\t<div class="detail-content hide">\n\t\t\t\t<input id="acd-detail" type="checkbox" class="acd-check">\n\t\t\t\t<label for="acd-detail" class="acd-label">Model algorithm</label>\n\t\t\t\t<div class="detail acd-content"></div>\n\t\t\t</div>\n\t\t\t<div class="usage-content hide">\n\t\t\t\t<input id="acd-usage" type="checkbox" class="acd-check" checked>\n\t\t\t\t<label for="acd-usage" class="acd-label">Usage</label>\n\t\t\t\t<div class="usage acd-content"></div>\n\t\t\t</div>\n\t\t\t<div class="buttons"></div>\n\t\t</div>\n\t',created(){const e={data:"manual",task:"",model:"",...Object.fromEntries(new URLSearchParams(location.search).entries())};import("./manager.js").then((t=>{ai_manager||(ai_manager=new t.default(this.settings),this.$forceUpdate(),this.setState(e))})),window.onpopstate=e=>{this.setState(e.state||{data:"manual",task:"",model:""})}},computed:{aiMethods(){if(""===this.modelFilter)return AIMethods;const e=new RegExp(this.modelFilter,"i"),t=[];for(let a=0;a<AIMethods.length;a++){if(t[a]={group:AIMethods[a].group},Array.isArray(AIMethods[a].methods))t[a].methods=AIMethods[a].methods.filter((t=>e.test(t.title)));else{t[a].methods={};for(const l of Object.keys(AIMethods[a].methods))t[a].methods[l]=AIMethods[a].methods[l].filter((t=>e.test(t.title)))}t[AIMethods[a].group]=t[a]}return t},modelCounts(){const e={};for(let t=0;t<this.aiMethods.length;t++){const a=this.aiMethods[t].group;if(Array.isArray(this.aiMethods[t].methods))e[a]=this.aiMethods[t].methods.length;else{e[a]=0;for(const l of Object.keys(this.aiMethods[t].methods))e[a]+=this.aiMethods[t].methods[l].length}}return e}},watch:{mlData(){this.isLoadParam||(this.mlTask="",this.pushHistory()),ai_manager?.setData(this.mlData).then((()=>{ai_manager.datas.params=this.state,this.$forceUpdate()}))},mlTask(){this.isLoadParam||(this.mlModel="",this.pushHistory(),this.ready())},mlModel(){this.isLoadParam||(this.pushHistory(),this.ready())}},methods:{pushHistory(){if(this.historyWillPush||this.isLoadParam)return;this.historyWillPush=!0;let e=this.state={data:this.mlData,task:this.mlTask,model:this.mlModel,...ai_manager.datas?.params,...ai_manager.platform?.params};Promise.resolve().then((()=>{e=this.state={data:this.mlData,task:this.mlTask,model:this.mlModel,...ai_manager.datas?.params,...ai_manager.platform?.params};let t="?";const a=Object.keys(this.state).reduce(((e,a)=>(null!=this.state[a]&&(e+=`${t}${a}=${encodeURIComponent(this.state[a])}`,t="&"),e)),"/");window.history.pushState(e,"",a),document.title=this.title(),this.historyWillPush=!1}))},setState(e){this.isLoadParam=!0,this.state=e,this.mlData=e.data,this.mlTask=e.task,this.mlModel=e.model,ai_manager.datas&&(ai_manager.datas.params=e),document.title=this.title(),this.$nextTick((()=>{this.isLoadParam=!1,this.ready()}))},title(){let e="AI on Browser",t=" - ";for(const a of Object.keys(this.state)){let l=this.state[a];l&&("task"===a&&(l=this.aiTask[l]),e+=t+a.charAt(0).toUpperCase()+a.slice(1)+" : "+l,t=", ")}return e},ready(){this.terminateFunction.forEach((e=>e())),this.terminateFunction=[];const e=this.mlModel,t=document.querySelector("#method_menu");t.querySelector(".buttons").replaceChildren(),t.querySelector(".draft").classList.add("hide"),t.querySelector(".require-info").innerText="",t.querySelector(".detail-content").classList.add("hide"),t.querySelector(".usage-content").classList.add("hide");ai_manager.setTask(this.mlTask).then((()=>{ai_manager.platform&&(ai_manager.platform.params=this.state),(()=>{if(!e)return void ai_manager.setModel("");const a=document.createElement("div");a.classList.add("loader"),t.appendChild(a),t.querySelector(".buttons").replaceChildren(),ai_manager.setModel(e).then((()=>{a.remove()}))})()}))}}}),app.mount("#ml_selector");