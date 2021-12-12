let ai_manager = null

const AIData = {
	manual: 'manual',
	text: 'text',
	functional: 'function',
	air: 'air passenger',
	titanic: 'Titanic',
	uci: 'UCI',
	esl: 'ESL',
	upload: 'upload',
	camera: 'camera',
	capture: 'capture',
	microphone: 'microphone',
}

const AITask = {
	CT: 'Clustering',
	CF: 'Classification',
	SC: 'Semi-supervised Classification',
	RG: 'Regression',
	IN: 'Interpolation',
	AD: 'Anomaly Detection',
	DR: 'Dimension Reduction',
	FS: 'Feature Selection',
	TF: 'Transformation',
	GR: 'Generate',
	DE: 'Density Estimation',
	SM: 'Smoothing',
	TP: 'Timeseries Prediction',
	CP: 'Change Point Detection',
	FA: 'Frequency Analysis',
	MV: 'Missing Value Completion',
	IP: 'Image Processing',
	SG: 'Segmentation',
	DN: 'Denoising',
	ED: 'Edge Detection',
	NL: 'Natural Language Processing',
	WE: 'Word Embedding',
	WC: 'Word Cloud',
	RC: 'Recommendation',
	MD: 'Markov Decision Process',
	GM: 'Game',
}

const AIMethods = [
	{
		group: 'CT',
		methods: {
			Centroids: [
				{ value: 'kmeans', title: 'K-Means(++) / K-Medoids / K-Medians' },
				{ value: 'xmeans', title: 'X-Means' },
				{ value: 'gmeans', title: 'G-Means' },
				{ value: 'isodata', title: 'ISODATA' },
				{ value: 'soft_kmeans', title: 'Soft K-Means' },
				{ value: 'fuzzy_cmeans', title: 'Fuzzy C-Means' },
				{ value: 'pcm', title: 'Possibilistic C-Means' },
				{ value: 'kernel_kmeans', title: 'Kernel K-Means' },
				{ value: 'lbg', title: 'Linde-Buzo-Gray' },
				{ value: 'pam', title: 'PAM / CLARA' },
				{ value: 'clarans', title: 'CLARANS' },
				{ value: 'som', title: 'Self-organizing map' },
				{ value: 'neural_gas', title: 'Neural Gas' },
				{ value: 'growing_neural_gas', title: 'Growing Neural Gas' },
				{ value: 'growing_cell_structures', title: 'Growing Cell Structures' },
				{ value: 'gtm', title: 'Generative Topographic Mapping' },
				{ value: 'lvq', title: 'Learning vector quantization' },
				{ value: 'mountain', title: 'Mountain' },
				{ value: 'spectral', title: 'Spectral clustering' },
			],
			Hierarchy: [
				{ value: 'agglomerative', title: 'Agglomerative' },
				{ value: 'birch', title: 'BIRCH' },
				{ value: 'cure', title: 'CURE' },
				{ value: 'rock', title: 'ROCK' },
				{ value: 'diana', title: 'DIANA' },
			],
			Distribution: [
				{ value: 'gmm', title: 'Gaussian mixture model' },
				{ value: 'vbgmm', title: 'Variational Bayesian GMM' },
			],
			Density: [
				{ value: 'mean_shift', title: 'Mean Shift' },
				{ value: 'dbscan', title: 'DBSCAN' },
				{ value: 'optics', title: 'OPTICS' },
			],
			'': [
				//{ value: "sting", title: "STING" },
				{ value: 'affinity_propagation', title: 'Affinity Propagation' },
				{ value: 'cast', title: 'CAST' },
				{ value: 'latent_dirichlet_allocation', title: 'Latent Dirichlet Allocation' },
				{ value: 'nmf', title: 'NMF' },
				{ value: 'autoencoder', title: 'Autoencoder' },
			],
		},
	},
	{
		group: 'CF',
		methods: {
			'Discriminant Analysis': [
				{ value: 'lda', title: 'LDA / FLD' },
				{ value: 'quadratic_discriminant', title: 'Quadratic Discriminant' },
				{ value: 'mda', title: 'Mixture Discriminant' },
			],
			Bayes: [
				{ value: 'naive_bayes', title: 'Naive Bayes' },
				{ value: 'aode', title: 'AODE' },
			],
			'Decision Tree': [
				{ value: 'decision_tree', title: 'Decision Tree' },
				{ value: 'random_forest', title: 'Random Forest' },
				{ value: 'gbdt', title: 'GBDT' },
				{ value: 'xgboost', title: 'XGBoost' },
			],
			Online: [
				{ value: 'alma', title: 'ALMA' },
				{ value: 'romma', title: 'ROMMA' },
				{ value: 'ogd', title: 'Online Gradient Descent' },
				{ value: 'passive_aggressive', title: 'Passive Aggressive' },
				{ value: 'rls', title: 'Recursive Least Squares' },
				{ value: 'sop', title: 'Second Order Perceptron' },
				{ value: 'confidence_weighted', title: 'Confidence Weighted' },
				{ value: 'iellip', title: 'CELLIP / IELLIP' },
				{ value: 'arow', title: 'AROW' },
				{ value: 'narow', title: 'NAROW' },
				{ value: 'normal_herd', title: 'Normal HERD' },
			],
			Netrowk: [
				{ value: 'lvq', title: 'Learning vector quantization' },
				{ value: 'perceptron', title: 'Perceptron' },
				{ value: 'adaline', title: 'ADALINE' },
				{ value: 'mlp', title: 'Multi-layer perceptron' },
				{ value: 'neuralnetwork', title: 'Neuralnetwork' },
			],
			'': [
				{ value: 'least_square', title: 'Least squares' },
				{ value: 'ridge', title: 'Ridge' },
				{ value: 'knearestneighbor', title: 'k nearest neighbor' },
				{ value: 'nearest_centroid', title: 'Nearest Centroid' },
				{ value: 'logistic', title: 'Logistic regression' },
				{ value: 'probit', title: 'Probit' },
				{ value: 'svm', title: 'Support vector machine' },
				{ value: 'gaussian_process', title: 'Gaussian Process' },
				{ value: 'hmm', title: 'HMM' },
				{ value: 'crf', title: 'CRF' },
				{ value: 'bayesian_network', title: 'Bayesian Network' },
				{ value: 'lmnn', title: 'LMNN' },
			],
		},
	},
	{
		group: 'SC',
		methods: [
			{ value: 'knearestneighbor', title: 'k nearest neighbor' },
			{ value: 'label_propagation', title: 'Label propagation' },
			{ value: 'label_spreading', title: 'Label spreading' },
			{ value: 'kmeans', title: 'K-Means' },
			{ value: 'gmm', title: 'Gaussian mixture model' },
		],
	},
	{
		group: 'RG',
		methods: {
			'Least Square': [
				{ value: 'least_square', title: 'Least squares' },
				{ value: 'ridge', title: 'Ridge' },
				{ value: 'lasso', title: 'Lasso' },
				{ value: 'elastic_net', title: 'Elastic Net' },
				{ value: 'rls', title: 'Recursive Least Squares' },
				{ value: 'least_absolute', title: 'Least Absolute Deviations' },
				{ value: 'huber_regression', title: 'Huber' },
				{ value: 'tukey_regression', title: 'Tukey' },
				{ value: 'lts', title: 'Least Trimmed Squares' },
				{ value: 'lmeds', title: 'Least Median Squares' },
				{ value: 'lpnorm_linear', title: 'Lp norm linear' },
				{ value: 'sma', title: 'SMA' },
				{ value: 'deming', title: 'Deming' },
			],
			kernel: [
				{ value: 'nadaraya_watson', title: 'Nadaraya Watson' },
				{ value: 'priestley_chao', title: 'Priestley Chao' },
				{ value: 'gasser_muller', title: 'Gasser Muller' },
			],
			'Decision Tree': [
				{ value: 'decision_tree', title: 'Decision Tree' },
				{ value: 'random_forest', title: 'Random Forest' },
				{ value: 'gbdt', title: 'GBDT' },
				{ value: 'xgboost', title: 'XGBoost' },
			],
			'': [
				{ value: 'bayesian_linear', title: 'Bayesian Linear' },
				{ value: 'poisson', title: 'Poisson' },
				{ value: 'segmented', title: 'Segmented' },
				{ value: 'lowess', title: 'LOWESS' },
				{ value: 'spline', title: 'Spline' },
				{ value: 'gaussian_process', title: 'Gaussian Process' },
				{ value: 'pcr', title: 'Principal Components' },
				{ value: 'pls', title: 'Partial Least Squares' },
				{ value: 'ppr', title: 'Projection Pursuit' },
				{ value: 'quantile_regression', title: 'Quantile Regression' },
				{ value: 'knearestneighbor', title: 'k nearest neighbor' },
				{ value: 'inverse_distance_weighting', title: 'IDW' },
				{ value: 'rbf', title: 'RBF Network' },
				{ value: 'rvm', title: 'RVM' },
				{ value: 'svr', title: 'Support vector regression' },
				{ value: 'mlp', title: 'Multi-layer perceptron' },
				{ value: 'neuralnetwork', title: 'Neuralnetwork' },
				{ value: 'gmm', title: 'Gaussian mixture regression' },
				{ value: 'isotonic', title: 'Isotonic' },
				{ value: 'ramer_douglas_peucker', title: 'Ramer Douglas Peucker' },
				{ value: 'passing_bablok', title: 'Passing Bablok' },
			],
		},
	},
	{
		group: 'IN',
		methods: [
			{ value: 'knearestneighbor', title: 'nearest neighbor' },
			{ value: 'inverse_distance_weighting', title: 'IDW' },
			{ value: 'lerp', title: 'Linear' },
			{ value: 'brahmagupta_interpolation', title: 'Brahmagupta' },
			// { value: "slerp", title: "Slerp" },
			{ value: 'logarithmic_interpolation', title: 'Logarithmic' },
			{ value: 'cosine_interpolation', title: 'Cosine' },
			{ value: 'smoothstep', title: 'Smoothstep' },
			{ value: 'inverse_smoothstep', title: 'Inverse Smoothstep' },
			{ value: 'cubic_interpolation', title: 'Cubic' },
			{ value: 'catmull_rom', title: 'Catmull Rom' },
			{ value: 'hermit_interpolation', title: 'Hermit' },
			{ value: 'polynomial_interpolation', title: 'Polynomial' },
			{ value: 'lagrange', title: 'Lagrange' },
			{ value: 'trigonometric_interpolation', title: 'Trigonometric' },
			{ value: 'spline_interpolation', title: 'Spline' },
			{ value: 'rbf', title: 'RBF Network' },
			{ value: 'akima', title: 'Akima' },
		],
	},
	{
		group: 'AD',
		methods: [
			{ value: 'percentile', title: 'Percentile' },
			{ value: 'mad', title: 'MAD' },
			{ value: 'tukeys_fences', title: "Tukey's fences" },
			{ value: 'smirnov_grubbs', title: "Grubbs's test" },
			{ value: 'thompson', title: 'Thompson test' },
			{ value: 'tietjen_moore', title: 'Tietjen-Moore test' },
			{ value: 'generalized_esd', title: 'Generalized ESD' },
			{ value: 'hotelling', title: 'Hotelling' },
			{ value: 'mt', title: 'MT' },
			{ value: 'mcd', title: 'MCD' },
			{ value: 'knearestneighbor', title: 'k nearest neighbor' },
			{ value: 'lof', title: 'LOF' },
			{ value: 'pca', title: 'PCA' },
			{ value: 'ocsvm', title: 'One class SVM' },
			{ value: 'kernel_density_estimator', title: 'Kernel Density Estimator' },
			{ value: 'gmm', title: 'Gaussian mixture model' },
			{ value: 'isolation_forest', title: 'Isolation Forest' },
			{ value: 'autoencoder', title: 'Autoencoder' },
			{ value: 'gan', title: 'GAN' },
		],
	},
	{
		group: 'DR',
		methods: [
			{ value: 'random_projection', title: 'Random projection' },
			{ value: 'pca', title: 'PCA' },
			{ value: 'incremental_pca', title: 'Incremental PCA' },
			{ value: 'probabilistic_pca', title: 'Probabilistic PCA' },
			{ value: 'gplvm', title: 'GPLVM' },
			{ value: 'lsa', title: 'LSA' },
			{ value: 'mds', title: 'MDS' },
			{ value: 'lda', title: 'Linear Discriminant Analysis' },
			{ value: 'nca', title: 'NCA' },
			{ value: 'ica', title: 'ICA' },
			{ value: 'principal_curve', title: 'Principal curve' },
			{ value: 'sammon', title: 'Sammon' },
			{ value: 'fastmap', title: 'FastMap' },
			{ value: 'sir', title: 'Sliced Inverse Regression' },
			{ value: 'lle', title: 'LLE' },
			{ value: 'laplacian_eigenmaps', title: 'Laplacian eigenmaps' },
			{ value: 'isomap', title: 'Isomap' },
			{ value: 'tsne', title: 'SNE / t-SNE' },
			{ value: 'som', title: 'Self-organizing map' },
			{ value: 'gtm', title: 'Generative Topographic Mapping' },
			//{ value: "umap", title: "UMAP" },
			{ value: 'nmf', title: 'NMF' },
			{ value: 'autoencoder', title: 'Autoencoder' },
			{ value: 'vae', title: 'VAE' },
		],
	},
	{
		group: 'FS',
		methods: [
			{ value: 'mutual_information', title: 'Mutual Information' },
			{ value: 'ridge', title: 'Ridge' },
			{ value: 'lasso', title: 'Lasso' },
			{ value: 'elastic_net', title: 'Elastic Net' },
			{ value: 'decision_tree', title: 'Decision Tree' },
			{ value: 'nca', title: 'NCA' },
		],
	},
	{
		group: 'TF',
		methods: [
			{ value: 'box_cox', title: 'Box-Cox' },
			{ value: 'yeo_johnson', title: 'Yeo-Johnson' },
		],
	},
	{
		group: 'DE',
		methods: [
			{ value: 'histogram', title: 'Histogram' },
			{ value: 'average_shifted_histogram', title: 'Average Shifted Histogram' },
			{ value: 'polynomial_histogram', title: 'Polynomial Histogram' },
			{ value: 'maximum_likelihood', title: 'Maximum Likelihood' },
			{ value: 'kernel_density_estimator', title: 'Kernel Density Estimator' },
			{ value: 'knearestneighbor', title: 'k nearest neighbor' },
			{ value: 'gmm', title: 'Gaussian mixture model' },
			{ value: 'hmm', title: 'HMM' },
		],
	},
	{
		group: 'GR',
		methods: [
			{ value: 'mh', title: 'MH' },
			{ value: 'gmm', title: 'GMM' },
			{ value: 'rbm', title: 'GBRBM' },
			{ value: 'hmm', title: 'HMM' },
			{ value: 'vae', title: 'VAE' },
			{ value: 'gan', title: 'GAN' },
			//{ value: "flowbase", title: "Flow base" },
		],
	},
	{
		group: 'SM',
		methods: [
			{ value: 'moving_average', title: 'Moving Average' },
			{ value: 'exponential_average', title: 'Exponential Average' },
			{ value: 'moving_median', title: 'Moving Median' },
			{ value: 'cumulative_moving_average', title: 'Cumulative Moving Average' },
			{ value: 'kz', title: 'Kolmogorov-Zurbenko Filter' },
			{ value: 'savitzky_golay', title: 'Savitzky Golay Filter' },
			{ value: 'hampel', title: 'Hampel Filter' },
			{ value: 'kalman_filter', title: 'Kalman Filter' },
			{ value: 'particle_filter', title: 'Particle Filter' },
			{ value: 'lowpass', title: 'Lowpass Filter' },
			{ value: 'bessel', title: 'Bessel Filter' },
			{ value: 'butterworth', title: 'Butterworth Filter' },
			{ value: 'chebyshev', title: 'Chebyshev Filter' },
			{ value: 'elliptic_filter', title: 'Elliptic Filter' },
		],
	},
	{
		group: 'TP',
		methods: [
			{ value: 'holt_winters', title: 'Holt Winters' },
			{ value: 'ar', title: 'AR' },
			{ value: 'arma', title: 'ARMA' },
			{ value: 'sdar', title: 'SDAR' },
			{ value: 'var', title: 'VAR' },
			{ value: 'kalman_filter', title: 'Kalman Filter' },
			{ value: 'mlp', title: 'Multi-layer perceptron' },
			{ value: 'neuralnetwork', title: 'Neuralnetwork' },
			{ value: 'rnn', title: 'Recurrent neuralnetwork' },
		],
	},
	{
		group: 'CP',
		methods: [
			{ value: 'cumulative_sum', title: 'Cumulative Sum' },
			{ value: 'knearestneighbor', title: 'k nearest neighbor' },
			{ value: 'lof', title: 'LOF' },
			{ value: 'sst', title: 'SST' },
			{ value: 'kliep', title: 'KLIEP' },
			{ value: 'lsif', title: 'LSIF' },
			{ value: 'ulsif', title: 'uLSIF' },
			{ value: 'lsdd', title: 'LSDD' },
			{ value: 'hmm', title: 'HMM' },
			{ value: 'markov_switching', title: 'Markov Switching' },
			{ value: 'change_finder', title: 'Change Finder' },
		],
	},
	{
		group: 'SG',
		methods: {
			Thresholding: [
				{ value: 'ptile', title: 'P-Tile' },
				{ value: 'automatic_thresholding', title: 'Automatic Thresholding' },
				{ value: 'balanced_histogram', title: 'Balanced histogram thresholding' },
				{ value: 'otsu', title: 'Otsu' },
				{ value: 'sezan', title: 'Sezan' },
				{ value: 'adaptive_thresholding', title: 'Adaptive Thresholding' },
				{ value: 'bernsen', title: 'Bernsen' },
				{ value: 'niblack', title: 'Niblack' },
				{ value: 'sauvola', title: 'Sauvola' },
				{ value: 'phansalkar', title: 'Phansalkar' },
			],
			'': [
				{ value: 'split_merge', title: 'Split and merge' },
				{ value: 'mean_shift', title: 'Mean Shift' },
			],
		},
	},
	{
		group: 'ED',
		methods: [
			{ value: 'roberts', title: 'Roberts Cross' },
			{ value: 'sobel', title: 'Sobel' },
			{ value: 'prewitt', title: 'Prewitt' },
			{ value: 'laplacian', title: 'Laplacian' },
			{ value: 'log', title: 'Laplacian Of Gaussian' },
			{ value: 'canny', title: 'Canny' },
			{ value: 'snakes', title: 'Snakes' },
		],
	},
	{
		group: 'DN',
		methods: [
			{ value: 'hopfield', title: 'Hopfield network' },
			{ value: 'rbm', title: 'RBM / GBRBM' },
		],
	},
	{
		group: 'WE',
		methods: [{ value: 'word_to_vec', title: 'Word2Vec' }],
	},
	{
		group: 'MD',
		methods: [
			{ value: 'dynamic_programming', title: 'DP' },
			{ value: 'monte_carlo', title: 'MC' },
			{ value: 'q_learning', title: 'Q Learning' },
			{ value: 'sarsa', title: 'SARSA' },
			{ value: 'policy_gradient', title: 'Policy Gradient' },
			{ value: 'dqn', title: 'DQN / DDQN' },
			{ value: 'a2c', title: 'A2C' },
			{ value: 'genetic_algorithm', title: 'Genetic Algorithm' },
		],
	},
	{
		group: 'GM',
		methods: [],
	},
	{
		group: 'RC',
		methods: [{ value: 'association_analysis', title: 'Association Analysis' }],
	},
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
			stop: () => (isRunning = false),
			get epoch() {
				return count
			},
			set enable(value) {
				stepButton?.property('disabled', !value)
				runButton?.property('disabled', !value)
				skipButton?.property('disabled', !value)
			},
			init(cb) {
				this.initialize = cb
				const initButton = elm
					.append('input')
					.attr('type', 'button')
					.attr('value', 'Initialize')
					.on('click', () => {
						if (cb.length > 0) {
							initButton.property('disabled', true)
							this.enable = false
							cb(() => {
								initButton.property('disabled', false)
								this.enable = true
								epochText?.text((count = 0))
							})
						} else {
							cb()
							this.enable = true
							epochText?.text((count = 0))
						}
					})
				existInit = true
				return this
			},
			step(cb) {
				stepButton = elm
					.append('input')
					.attr('type', 'button')
					.attr('value', 'Step')
					.property('disabled', existInit)
					.on('click', () => {
						if (cb.length > 0) {
							this.enable = false
							cb(() => {
								this.enable = true
								epochText?.text((count = epochCb()))
							})
						} else {
							cb()
							epochText?.text((count = epochCb()))
						}
					})
				runButton = elm
					.append('input')
					.attr('type', 'button')
					.attr('value', 'Run')
					.property('disabled', existInit)
					.on('click', () => {
						isRunning = !isRunning
						runButton.attr('value', isRunning ? 'Stop' : 'Run')
						if (isRunning) {
							const stepLoop = () => {
								if (isRunning) {
									if (cb.length > 0) {
										cb(() => {
											epochText?.text((count = epochCb()))
											setTimeout(stepLoop, 0)
										})
									} else {
										cb()
										epochText?.text((count = epochCb()))
										setTimeout(stepLoop, 0)
									}
								}
								stepButton.property('disabled', isRunning)
								skipButton?.property('disabled', isRunning)
								runButton.property('disabled', false)
							}
							stepLoop()
						} else {
							runButton.property('disabled', true)
						}
					})
				stepCb = cb
				return this
			},
			skip(cb) {
				cb ||= stepCb
				skipButton = elm
					.append('input')
					.attr('type', 'button')
					.attr('value', 'Skip')
					.property('disabled', existInit)
					.on('click', () => {
						isRunning = !isRunning
						skipButton.attr('value', isRunning ? 'Stop' : 'Skip')
						if (isRunning) {
							let lastt = new Date().getTime()
							const stepLoop = () => {
								stepButton?.property('disabled', isRunning)
								runButton?.property('disabled', isRunning)
								skipButton.property('disabled', false)
								while (isRunning) {
									if (cb.length > 0) {
										cb(() => {
											epochText?.text((count = epochCb()))
											setTimeout(stepLoop, 0)
										})
										return
									} else {
										cb()
										epochText?.text((count = epochCb()))
										const curt = new Date().getTime()
										if (curt - lastt > 200) {
											lastt = curt
											setTimeout(stepLoop, 0)
											return
										}
									}
								}
							}
							stepLoop()
						} else {
							skipButton.property('disabled', true)
						}
					})
				return this
			},
			epoch(cb) {
				elm.append('span').text(' Epoch: ')
				epochText = elm.append('span').attr('name', 'epoch').text('0')
				if (cb) {
					epochCb = cb
				}
				return this
			},
			elm(cb) {
				cb(elm)
				return this
			},
		}
		this._terminators.push(loopButtons.stop)
		return loopButtons
	}
}

Vue.component('model-selector', {
	data: function () {
		return {
			aiMethods: AIMethods,
			aiData: AIData,
			aiTask: AITask,
			terminateFunction: [],
			state: {},
			mlData: 'manual',
			mlTask: '',
			mlModel: '',
			isLoadParam: false,
			historyWillPush: false,
			settings: (_this => ({
				vue: _this,
				set terminate(value) {
					_this.terminateFunction.push(value)
				},
				rl: {
					get configElement() {
						return d3.select('#rl_menu')
					},
				},
				get svg() {
					return d3.select('#plot-area svg g.flip')
				},
				ml: {
					get configElement() {
						return d3.select('#method_menu .buttons')
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
						const elm = d3.select('#method_menu .usage-content')
						elm.select('.usage').text(value)
						elm.classed('hide', !value)
					},
					set draft(value) {
						d3.select('#method_menu .draft').classed('hide', !value)
					},
					set detail(value) {
						const elm = d3.select('#method_menu .detail-content')
						const dtl = elm.select('.detail')
						dtl.html(value)
						elm.classed('hide', !value)
						MathJax.typesetPromise([dtl.node()])
					},
					refresh() {
						_this.ready()
					},
				},
				data: {
					get configElement() {
						return d3.select('#data_menu')
					},
				},
				task: {
					get configElement() {
						return d3.select('#task_menu')
					},
				},
				get footer() {
					return d3.select('#method_footer')
				},
			}))(this),
			initScripts: {},
			get availTask() {
				const tasks = ai_manager?.datas?.availTask || []
				if (tasks.length > 0 && tasks.indexOf(this.mlTask) < 0) {
					this.mlTask = ''
				}
				return tasks
			},
		}
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
						<option v-if="availTask.length === 0 || availTask.indexOf(ag.group) >= 0" :key="ag.group" :value="ag.group">{{ aiTask[ag.group] }} ({{ modelCounts[ag.group] }})</option>
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
			<div class="alert hide draft">This model may not be working properly.</div>
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
	</div>
	`,
	created() {
		const urlParam = location.search.substring(1)
		const state = {
			data: 'manual',
			task: '',
			model: '',
		}
		if (urlParam.length > 0) {
			const params = urlParam.split('&')
			for (const param of params) {
				const [k, v] = param.split('=')
				state[k] = decodeURIComponent(v)
			}
		}
		import('./manager.js').then(obj => {
			if (!ai_manager) {
				ai_manager = new obj.default(this.settings)
				this.$forceUpdate()
				this.setState(state)
			}
		})
		window.onpopstate = e => {
			this.setState(
				e.state || {
					data: 'manual',
					task: '',
					model: '',
				}
			)
		}
	},
	computed: {
		modelCounts() {
			const counts = {}
			for (const task of Object.keys(this.aiMethods)) {
				if (Array.isArray(this.aiMethods[task].methods)) {
					counts[task] = this.aiMethods[task].methods.length
				} else {
					counts[task] = 0
					for (const sub of Object.keys(this.aiMethods[task].methods)) {
						counts[task] += this.aiMethods[task].methods[sub].length
					}
				}
			}
			return counts
		},
	},
	watch: {
		mlData() {
			if (!this.isLoadParam) {
				this.mlTask = ''
				this.pushHistory()
			}
			ai_manager?.setData(this.mlData, () => {
				ai_manager.datas.params = this.state
				this.$forceUpdate()
			})
		},
		mlTask() {
			if (this.isLoadParam) return
			this.mlModel = ''
			this.pushHistory()
			this.ready()
		},
		mlModel() {
			if (this.isLoadParam) return
			this.pushHistory()
			this.ready()
		},
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
				...ai_manager.platform?.params,
			}
			Promise.resolve().then(() => {
				this.state = {
					data: this.mlData,
					task: this.mlTask,
					model: this.mlModel,
					...ai_manager.datas?.params,
					...ai_manager.platform?.params,
				}
				let sep = '?'
				const url = Object.keys(this.state).reduce((t, k) => {
					if (this.state[k]) {
						t += `${sep}${k}=${encodeURIComponent(this.state[k])}`
						sep = '&'
					}
					return t
				}, '/')
				window.history.pushState(this.state, '', url)
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
			let title = 'AI on Browser'
			let sep = ' - '
			for (const key of Object.keys(this.state)) {
				let value = this.state[key]
				if (value) {
					if (key === 'task') {
						value = this.aiTask[value]
					}
					title += sep + key.charAt(0).toUpperCase() + key.slice(1) + ' : ' + value
					sep = ', '
				}
			}
			return title
		},
		ready() {
			this.terminateFunction.forEach(t => t())
			this.terminateFunction = []

			const mlModel = this.mlModel
			const mlelem = d3.select('#method_menu')
			mlelem.selectAll('.buttons *').remove()
			mlelem.select('.draft').classed('hide', true)
			mlelem.select('.detail-content').classed('hide', true)
			mlelem.select('.usage-content').classed('hide', true)

			const readyModel = () => {
				if (!mlModel) return
				const loader = mlelem.append('div').classed('loader', true)
				mlelem.selectAll('.buttons *').remove()
				ai_manager.setModel(mlModel, () => {
					loader.remove()
				})
			}

			ai_manager.setTask(this.mlTask, () => {
				if (ai_manager.platform) {
					ai_manager.platform.params = this.state
				}
				readyModel()
			})
		},
	},
})

new Vue({
	el: '#ml_selector',
})
