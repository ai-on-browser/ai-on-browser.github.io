let ai_manager=null;const AIData={manual:"manual",text:"text",functional:"function",air:"air passenger",titanic:"Titanic",uci:"UCI",esl:"ESL",upload:"upload",camera:"camera",capture:"capture",microphone:"microphone"},AITask={CT:"Clustering",CF:"Classification",SC:"Semi-supervised Classification",RG:"Regression",IN:"Interpolation",AD:"Anomaly Detection",DR:"Dimension Reduction",FS:"Feature Selection",TF:"Transformation",GR:"Generate",DE:"Density Estimation",SM:"Smoothing",TP:"Timeseries Prediction",CP:"Change Point Detection",FA:"Frequency Analysis",MV:"Missing Value Completion",IP:"Image Processing",SG:"Segmentation",DN:"Denoising",ED:"Edge Detection",NL:"Natural Language Processing",WE:"Word Embedding",WC:"Word Cloud",RC:"Recommendation",MD:"Markov Decision Process",GM:"Game"},AIMethods=[{group:"CT",methods:{Centroids:[{value:"kmeans",title:"K-Means(++) / K-Medoids / K-Medians"},{value:"xmeans",title:"X-Means"},{value:"gmeans",title:"G-Means"},{value:"isodata",title:"ISODATA"},{value:"soft_kmeans",title:"Soft K-Means"},{value:"fuzzy_cmeans",title:"Fuzzy C-Means"},{value:"pcm",title:"Possibilistic C-Means"},{value:"kernel_kmeans",title:"Kernel K-Means"},{value:"lbg",title:"Linde-Buzo-Gray"},{value:"pam",title:"PAM / CLARA"},{value:"clarans",title:"CLARANS"},{value:"som",title:"Self-organizing map"},{value:"neural_gas",title:"Neural Gas"},{value:"growing_neural_gas",title:"Growing Neural Gas"},{value:"growing_cell_structures",title:"Growing Cell Structures"},{value:"gtm",title:"Generative Topographic Mapping"},{value:"lvq",title:"Learning vector quantization"},{value:"mountain",title:"Mountain"},{value:"spectral",title:"Spectral clustering"}],Hierarchy:[{value:"agglomerative",title:"Agglomerative"},{value:"birch",title:"BIRCH"},{value:"cure",title:"CURE"},{value:"rock",title:"ROCK"},{value:"diana",title:"DIANA"}],Distribution:[{value:"gmm",title:"Gaussian mixture model"},{value:"vbgmm",title:"Variational Bayesian GMM"}],Density:[{value:"mean_shift",title:"Mean Shift"},{value:"dbscan",title:"DBSCAN"},{value:"optics",title:"OPTICS"}],"":[{value:"affinity_propagation",title:"Affinity Propagation"},{value:"cast",title:"CAST"},{value:"latent_dirichlet_allocation",title:"Latent Dirichlet Allocation"},{value:"nmf",title:"NMF"},{value:"autoencoder",title:"Autoencoder"}]}},{group:"CF",methods:{"Discriminant Analysis":[{value:"lda",title:"LDA / FLD"},{value:"quadratic_discriminant",title:"Quadratic Discriminant"},{value:"mda",title:"Mixture Discriminant"}],Bayes:[{value:"naive_bayes",title:"Naive Bayes"},{value:"aode",title:"AODE"}],"Decision Tree":[{value:"decision_tree",title:"Decision Tree"},{value:"random_forest",title:"Random Forest"},{value:"gbdt",title:"GBDT"},{value:"xgboost",title:"XGBoost"}],Online:[{value:"alma",title:"ALMA"},{value:"romma",title:"ROMMA"},{value:"ogd",title:"Online Gradient Descent"},{value:"passive_aggressive",title:"Passive Aggressive"},{value:"rls",title:"Recursive Least Squares"},{value:"sop",title:"Second Order Perceptron"},{value:"confidence_weighted",title:"Confidence Weighted"},{value:"iellip",title:"CELLIP / IELLIP"},{value:"arow",title:"AROW"},{value:"narow",title:"NAROW"},{value:"normal_herd",title:"Normal HERD"}],Netrowk:[{value:"lvq",title:"Learning vector quantization"},{value:"perceptron",title:"Perceptron"},{value:"adaline",title:"ADALINE"},{value:"mlp",title:"Multi-layer perceptron"}],"":[{value:"least_square",title:"Least squares"},{value:"ridge",title:"Ridge"},{value:"knearestneighbor",title:"k nearest neighbor"},{value:"nearest_centroid",title:"Nearest Centroid"},{value:"logistic",title:"Logistic regression"},{value:"probit",title:"Probit"},{value:"svm",title:"Support vector machine"},{value:"gaussian_process",title:"Gaussian Process"},{value:"hmm",title:"HMM"},{value:"crf",title:"CRF"},{value:"bayesian_network",title:"Bayesian Network"},{value:"lmnn",title:"LMNN"}]}},{group:"SC",methods:[{value:"knearestneighbor",title:"k nearest neighbor"},{value:"label_propagation",title:"Label propagation"},{value:"label_spreading",title:"Label spreading"},{value:"kmeans",title:"K-Means"},{value:"gmm",title:"Gaussian mixture model"}]},{group:"RG",methods:[{value:"least_square",title:"Least squares"},{value:"ridge",title:"Ridge"},{value:"lasso",title:"Lasso"},{value:"elastic_net",title:"Elastic Net"},{value:"rls",title:"Recursive Least Squares"},{value:"bayesian_linear",title:"Bayesian Linear"},{value:"poisson",title:"Poisson"},{value:"least_absolute",title:"Least Absolute Deviations"},{value:"lts",title:"Least Trimmed Squares"},{value:"lmeds",title:"Least Median Squares"},{value:"lpnorm_linear",title:"Lp norm linear"},{value:"sma",title:"SMA"},{value:"deming",title:"Deming"},{value:"segmented",title:"Segmented"},{value:"lowess",title:"LOWESS"},{value:"spline",title:"Spline"},{value:"gaussian_process",title:"Gaussian Process"},{value:"pcr",title:"Principal Components"},{value:"pls",title:"Partial Least Squares"},{value:"ppr",title:"Projection Pursuit"},{value:"quantile_regression",title:"Quantile Regression"},{value:"knearestneighbor",title:"k nearest neighbor"},{value:"inverse_distance_weighting",title:"IDW"},{value:"nadaraya_watson",title:"Nadaraya Watson"},{value:"priestley_chao",title:"Priestley Chao"},{value:"gasser_muller",title:"Gasser Muller"},{value:"rbf",title:"RBF Network"},{value:"rvm",title:"RVM"},{value:"decision_tree",title:"Decision Tree"},{value:"random_forest",title:"Random Forest"},{value:"gbdt",title:"GBDT"},{value:"xgboost",title:"XGBoost"},{value:"svr",title:"Support vector regression"},{value:"mlp",title:"Multi-layer perceptron"},{value:"gmm",title:"Gaussian mixture regression"},{value:"isotonic",title:"Isotonic"},{value:"ramer_douglas_peucker",title:"Ramer Douglas Peucker"},{value:"passing_bablok",title:"Passing Bablok"}]},{group:"IN",methods:[{value:"knearestneighbor",title:"nearest neighbor"},{value:"inverse_distance_weighting",title:"IDW"},{value:"lerp",title:"Linear"},{value:"brahmagupta_interpolation",title:"Brahmagupta"},{value:"logarithmic_interpolation",title:"Logarithmic"},{value:"cosine_interpolation",title:"Cosine"},{value:"smoothstep",title:"Smoothstep"},{value:"inverse_smoothstep",title:"Inverse Smoothstep"},{value:"cubic_interpolation",title:"Cubic"},{value:"catmull_rom",title:"Catmull Rom"},{value:"hermit_interpolation",title:"Hermit"},{value:"polynomial_interpolation",title:"Polynomial"},{value:"lagrange",title:"Lagrange"},{value:"trigonometric_interpolation",title:"Trigonometric"},{value:"spline_interpolation",title:"Spline"},{value:"rbf",title:"RBF Network"},{value:"akima",title:"Akima"}]},{group:"AD",methods:[{value:"percentile",title:"Percentile"},{value:"mad",title:"MAD"},{value:"tukeys_fences",title:"Tukey's fences"},{value:"smirnov_grubbs",title:"Grubbs's test"},{value:"thompson",title:"Thompson test"},{value:"tietjen_moore",title:"Tietjen-Moore test"},{value:"generalized_esd",title:"Generalized ESD"},{value:"hotelling",title:"Hotelling"},{value:"mt",title:"MT"},{value:"mcd",title:"MCD"},{value:"knearestneighbor",title:"k nearest neighbor"},{value:"lof",title:"LOF"},{value:"pca",title:"PCA"},{value:"ocsvm",title:"One class SVM"},{value:"kernel_density_estimator",title:"Kernel Density Estimator"},{value:"gmm",title:"Gaussian mixture model"},{value:"isolation_forest",title:"Isolation Forest"},{value:"autoencoder",title:"Autoencoder"},{value:"gan",title:"GAN"}]},{group:"DR",methods:[{value:"random_projection",title:"Random projection"},{value:"pca",title:"PCA"},{value:"incremental_pca",title:"Incremental PCA"},{value:"probabilistic_pca",title:"Probabilistic PCA"},{value:"gplvm",title:"GPLVM"},{value:"lsa",title:"LSA"},{value:"mds",title:"MDS"},{value:"lda",title:"Linear Discriminant Analysis"},{value:"nca",title:"NCA"},{value:"ica",title:"ICA"},{value:"principal_curve",title:"Principal curve"},{value:"sammon",title:"Sammon"},{value:"fastmap",title:"FastMap"},{value:"sir",title:"Sliced Inverse Regression"},{value:"lle",title:"LLE"},{value:"laplacian_eigenmaps",title:"Laplacian eigenmaps"},{value:"isomap",title:"Isomap"},{value:"tsne",title:"SNE / t-SNE"},{value:"som",title:"Self-organizing map"},{value:"gtm",title:"Generative Topographic Mapping"},{value:"nmf",title:"NMF"},{value:"autoencoder",title:"Autoencoder"},{value:"vae",title:"VAE"}]},{group:"FS",methods:[{value:"mutual_information",title:"Mutual Information"},{value:"ridge",title:"Ridge"},{value:"lasso",title:"Lasso"},{value:"elastic_net",title:"Elastic Net"},{value:"decision_tree",title:"Decision Tree"},{value:"nca",title:"NCA"}]},{group:"TF",methods:[{value:"box_cox",title:"Box-Cox"},{value:"yeo_johnson",title:"Yeo-Johnson"}]},{group:"DE",methods:[{value:"histogram",title:"Histogram"},{value:"average_shifted_histogram",title:"Average Shifted Histogram"},{value:"polynomial_histogram",title:"Polynomial Histogram"},{value:"maximum_likelihood",title:"Maximum Likelihood"},{value:"kernel_density_estimator",title:"Kernel Density Estimator"},{value:"knearestneighbor",title:"k nearest neighbor"},{value:"gmm",title:"Gaussian mixture model"},{value:"hmm",title:"HMM"}]},{group:"GR",methods:[{value:"mh",title:"MH"},{value:"gmm",title:"GMM"},{value:"rbm",title:"GBRBM"},{value:"hmm",title:"HMM"},{value:"vae",title:"VAE"},{value:"gan",title:"GAN"}]},{group:"SM",methods:[{value:"moving_average",title:"Moving Average"},{value:"exponential_average",title:"Exponential Average"},{value:"moving_median",title:"Moving Median"},{value:"cumulative_moving_average",title:"Cumulative Moving Average"},{value:"kz",title:"Kolmogorov-Zurbenko Filter"},{value:"savitzky_golay",title:"Savitzky Golay Filter"},{value:"hampel",title:"Hampel Filter"},{value:"kalman_filter",title:"Kalman Filter"},{value:"particle_filter",title:"Particle Filter"},{value:"lowpass",title:"Lowpass Filter"},{value:"bessel",title:"Bessel Filter"},{value:"butterworth",title:"Butterworth Filter"},{value:"chebyshev",title:"Chebyshev Filter"},{value:"elliptic_filter",title:"Elliptic Filter"}]},{group:"TP",methods:[{value:"holt_winters",title:"Holt Winters"},{value:"ar",title:"AR"},{value:"arma",title:"ARMA"},{value:"sdar",title:"SDAR"},{value:"var",title:"VAR"},{value:"kalman_filter",title:"Kalman Filter"},{value:"mlp",title:"Multi-layer perceptron"},{value:"rnn",title:"Recurrent neuralnetwork"}]},{group:"CP",methods:[{value:"cumulative_sum",title:"Cumulative Sum"},{value:"knearestneighbor",title:"k nearest neighbor"},{value:"lof",title:"LOF"},{value:"sst",title:"SST"},{value:"kliep",title:"KLIEP"},{value:"lsif",title:"LSIF"},{value:"ulsif",title:"uLSIF"},{value:"lsdd",title:"LSDD"},{value:"hmm",title:"HMM"},{value:"markov_switching",title:"Markov Switching"},{value:"change_finder",title:"Change Finder"}]},{group:"SG",methods:{Thresholding:[{value:"ptile",title:"P-Tile"},{value:"automatic_thresholding",title:"Automatic Thresholding"},{value:"balanced_histogram",title:"Balanced histogram thresholding"},{value:"otsu",title:"Otsu"},{value:"sezan",title:"Sezan"},{value:"adaptive_thresholding",title:"Adaptive Thresholding"},{value:"bernsen",title:"Bernsen"},{value:"niblack",title:"Niblack"},{value:"sauvola",title:"Sauvola"},{value:"phansalkar",title:"Phansalkar"}],"":[{value:"split_merge",title:"Split and merge"},{value:"mean_shift",title:"Mean Shift"}]}},{group:"ED",methods:[{value:"roberts",title:"Roberts Cross"},{value:"sobel",title:"Sobel"},{value:"prewitt",title:"Prewitt"},{value:"laplacian",title:"Laplacian"},{value:"log",title:"Laplacian Of Gaussian"},{value:"canny",title:"Canny"},{value:"snakes",title:"Snakes"}]},{group:"DN",methods:[{value:"hopfield",title:"Hopfield network"},{value:"rbm",title:"RBM / GBRBM"}]},{group:"WE",methods:[{value:"word_to_vec",title:"Word2Vec"}]},{group:"MD",methods:[{value:"dynamic_programming",title:"DP"},{value:"monte_carlo",title:"MC"},{value:"q_learning",title:"Q Learning"},{value:"sarsa",title:"SARSA"},{value:"policy_gradient",title:"Policy Gradient"},{value:"dqn",title:"DQN / DDQN"},{value:"a2c",title:"A2C"},{value:"genetic_algorithm",title:"Genetic Algorithm"}]},{group:"GM",methods:[]},{group:"RC",methods:[{value:"association_analysis",title:"Association Analysis"}]}];for(const t of AIMethods)AIMethods[t.group]=t;class Controller{constructor(t){this._e=t,this._terminators=[]}terminate(){this._terminators.forEach((t=>t()))}stepLoopButtons(){let t=0;const e=this._e;let a=!1,l=null,i=null,s=null,n=null,o=()=>t+1,r=!1,u=null;const m={initialize:null,stop:()=>a=!1,get epoch(){return t},set enable(t){l?.property("disabled",!t),i?.property("disabled",!t),s?.property("disabled",!t)},init(a){this.initialize=a;const l=e.append("input").attr("type","button").attr("value","Initialize").on("click",(()=>{a.length>0?(l.property("disabled",!0),this.enable=!1,a((()=>{l.property("disabled",!1),this.enable=!0,n?.text(t=0)}))):(a(),this.enable=!0,n?.text(t=0))}));return r=!0,this},step(m){return l=e.append("input").attr("type","button").attr("value","Step").property("disabled",r).on("click",(()=>{m.length>0?(this.enable=!1,m((()=>{this.enable=!0,n?.text(t=o())}))):(m(),n?.text(t=o()))})),i=e.append("input").attr("type","button").attr("value","Run").property("disabled",r).on("click",(()=>{if(a=!a,i.attr("value",a?"Stop":"Run"),a){const e=()=>{a&&(m.length>0?m((()=>{n?.text(t=o()),setTimeout(e,0)})):(m(),n?.text(t=o()),setTimeout(e,0))),l.property("disabled",a),s?.property("disabled",a),i.property("disabled",!1)};e()}else i.property("disabled",!0)})),u=m,this},skip(m){return m||=u,s=e.append("input").attr("type","button").attr("value","Skip").property("disabled",r).on("click",(()=>{if(a=!a,s.attr("value",a?"Stop":"Skip"),a){let e=(new Date).getTime();const r=()=>{for(l?.property("disabled",a),i?.property("disabled",a),s.property("disabled",!1);a;){if(m.length>0)return void m((()=>{n?.text(t=o()),setTimeout(r,0)}));{m(),n?.text(t=o());const a=(new Date).getTime();if(a-e>200)return e=a,void setTimeout(r,0)}}};r()}else s.property("disabled",!0)})),this},epoch(t){return e.append("span").text(" Epoch: "),n=e.append("span").attr("name","epoch").text("0"),t&&(o=t),this},elm(t){return t(e),this}};return this._terminators.push(m.stop),m}}Vue.component("model-selector",{data:function(){return{aiMethods:AIMethods,aiData:AIData,aiTask:AITask,terminateFunction:[],state:{},mlData:"manual",mlTask:"",mlModel:"",isLoadParam:!1,historyWillPush:!1,settings:(t=this,{vue:t,set terminate(e){t.terminateFunction.push(e)},rl:{get configElement(){return d3.select("#rl_menu")}},get svg(){return d3.select("#plot-area svg g.flip")},ml:{get configElement(){return d3.select("#method_menu .buttons")},get controller(){const e=new Controller(this.configElement);return t.terminateFunction.push(e.terminate.bind(e)),e},get modelName(){return t.mlModel},set usage(t){const e=d3.select("#method_menu .usage-content");e.select(".usage").text(t),e.classed("hide",!t)},set draft(t){d3.select("#method_menu .draft").classed("hide",!t)},set detail(t){const e=d3.select("#method_menu .detail-content"),a=e.select(".detail");a.html(t),e.classed("hide",!t),MathJax.typesetPromise([a.node()])},refresh(){t.ready()}},data:{get configElement(){return d3.select("#data_menu")}},task:{get configElement(){return d3.select("#task_menu")}},get footer(){return d3.select("#method_footer")}}),initScripts:{},get availTask(){const t=ai_manager?.datas?.availTask||[];return t.length>0&&t.indexOf(this.mlTask)<0&&(this.mlTask=""),t}};var t},template:'\n\t<div>\n\t\t<dl>\n\t\t\t<dt>Data</dt>\n\t\t\t<dd>\n\t\t\t\t<select v-model="mlData">\n\t\t\t\t\t<option v-for="(t, v) in aiData" :key="v" :value="v">{{ t }}</option>\n\t\t\t\t</select>\n\t\t\t</dd>\n\t\t\t<dd>\n\t\t\t\t<div id="data_menu" class="sub-menu"></div>\n\t\t\t</dd>\n\t\t\t<dt>Task</dt>\n\t\t\t<dd>\n\t\t\t\t<select v-model="mlTask">\n\t\t\t\t\t<option value=""></option>\n\t\t\t\t\t<template v-for="ag in aiMethods">\n\t\t\t\t\t\t<option v-if="availTask.length === 0 || availTask.indexOf(ag.group) >= 0" :key="ag.group" :value="ag.group">{{ aiTask[ag.group] }} ({{ modelCounts[ag.group] }})</option>\n\t\t\t\t\t</template>\n\t\t\t\t</select>\n\t\t\t</dd>\n\t\t\t<dd>\n\t\t\t\t<div class="sub-menu">\n\t\t\t\t\t<div id="task_menu"></div>\n\t\t\t\t\t<div id="rl_menu" class="sub-menu"></div>\n\t\t\t\t</div>\n\t\t\t</dd>\n\t\t\t<div v-if="mlTask !== \'\'" class="model_selection">\n\t\t\t\t<div>\n\t\t\t\t\t<dt>Model</dt>\n\t\t\t\t\t<dd>\n\t\t\t\t\t\t<select id="mlDisp" v-model="mlModel">\n\t\t\t\t\t\t\t<option value=""></option>\n\t\t\t\t\t\t\t<template v-if="Array.isArray(aiMethods[mlTask].methods)">\n\t\t\t\t\t\t\t\t<option v-for="itm in aiMethods[mlTask].methods" :key="itm.value" :value="itm.value">{{ itm.title }}</option>\n\t\t\t\t\t\t\t</template>\n\t\t\t\t\t\t\t<template v-else>\n\t\t\t\t\t\t\t\t<template v-for="submethods, group in aiMethods[mlTask].methods">\n\t\t\t\t\t\t\t\t\t<optgroup v-if="group.length > 0" :key="group" :label="group">\n\t\t\t\t\t\t\t\t\t\t<option v-for="itm in submethods" :key="itm.value" :value="itm.value">{{ itm.title }}</option>\n\t\t\t\t\t\t\t\t\t</optgroup>\n\t\t\t\t\t\t\t\t\t<template v-else>\n\t\t\t\t\t\t\t\t\t\t<option v-for="itm in submethods" :key="itm.value" :value="itm.value">{{ itm.title }}</option>\n\t\t\t\t\t\t\t\t\t</template>\n\t\t\t\t\t\t\t\t</template>\n\t\t\t\t\t\t\t</template>\n\t\t\t\t\t\t</select>\n\t\t\t\t\t</dd>\n\t\t\t\t</div>\n\t\t\t\t<div v-if="mlModel !== \'\'">\n\t\t\t\t\t<a :href="\'https://github.com/ai-on-browser/ai-on-browser.github.io/blob/main/lib/model/\' + mlModel + \'.js\'" rel="noreferrer noopener" target="_blank">source</a>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</dl>\n\t\t<div id="method_menu">\n\t\t\t<div class="alert hide draft">This model may not be working properly.</div>\n\t\t\t<div class="detail-content hide">\n\t\t\t\t<input id="acd-detail" type="checkbox" class="acd-check">\n\t\t\t\t<label for="acd-detail" class="acd-label">Model algorithm</label>\n\t\t\t\t<div class="detail acd-content"></div>\n\t\t\t</div>\n\t\t\t<div class="usage-content hide">\n\t\t\t\t<input id="acd-usage" type="checkbox" class="acd-check" checked>\n\t\t\t\t<label for="acd-usage" class="acd-label">Usage</label>\n\t\t\t\t<div class="usage acd-content"></div>\n\t\t\t</div>\n\t\t\t<div class="buttons"></div>\n\t\t</div>\n\t</div>\n\t',created(){const t=location.search.substring(1),e={data:"manual",task:"",model:""};if(t.length>0){const a=t.split("&");for(const t of a){const[a,l]=t.split("=");e[a]=decodeURIComponent(l)}}import("./manager.js").then((t=>{ai_manager||(ai_manager=new t.default(this.settings),this.$forceUpdate(),this.setState(e))})),window.onpopstate=t=>{this.setState(t.state||{data:"manual",task:"",model:""})}},computed:{modelCounts(){const t={};for(const e of Object.keys(this.aiMethods))if(Array.isArray(this.aiMethods[e].methods))t[e]=this.aiMethods[e].methods.length;else{t[e]=0;for(const a of Object.keys(this.aiMethods[e].methods))t[e]+=this.aiMethods[e].methods[a].length}return t}},watch:{mlData(){this.isLoadParam||(this.mlTask="",this.pushHistory()),ai_manager?.setData(this.mlData,(()=>{ai_manager.datas.params=this.state,this.$forceUpdate()}))},mlTask(){this.isLoadParam||(this.mlModel="",this.pushHistory(),this.ready())},mlModel(){this.isLoadParam||(this.pushHistory(),this.ready())}},methods:{pushHistory(){this.historyWillPush||this.isLoadParam||(this.historyWillPush=!0,this.state={data:this.mlData,task:this.mlTask,model:this.mlModel,...ai_manager.datas?.params,...ai_manager.platform?.params},Promise.resolve().then((()=>{this.state={data:this.mlData,task:this.mlTask,model:this.mlModel,...ai_manager.datas?.params,...ai_manager.platform?.params};let t="?";const e=Object.keys(this.state).reduce(((e,a)=>(this.state[a]&&(e+=`${t}${a}=${encodeURIComponent(this.state[a])}`,t="&"),e)),"/");window.history.pushState(this.state,"",e),document.title=this.title(),this.historyWillPush=!1})))},setState(t){this.isLoadParam=!0,this.state=t,this.mlData=t.data,this.mlTask=t.task,this.mlModel=t.model,ai_manager.datas&&(ai_manager.datas.params=t),document.title=this.title(),this.$nextTick((()=>{this.isLoadParam=!1,this.ready()}))},title(){let t="AI on Browser",e=" - ";for(const a of Object.keys(this.state)){let l=this.state[a];l&&("task"===a&&(l=this.aiTask[l]),t+=e+a.charAt(0).toUpperCase()+a.slice(1)+" : "+l,e=", ")}return t},ready(){this.terminateFunction.forEach((t=>t())),this.terminateFunction=[];const t=this.mlModel,e=d3.select("#method_menu");e.selectAll(".buttons *").remove(),e.select(".draft").classed("hide",!0),e.select(".detail-content").classed("hide",!0),e.select(".usage-content").classed("hide",!0);ai_manager.setTask(this.mlTask,(()=>{ai_manager.platform&&(ai_manager.platform.params=this.state),(()=>{if(!t)return;const a=e.append("div").classed("loader",!0);e.selectAll(".buttons *").remove(),ai_manager.setModel(t,(()=>{a.remove()}))})()}))}}}),new Vue({el:"#ml_selector"});