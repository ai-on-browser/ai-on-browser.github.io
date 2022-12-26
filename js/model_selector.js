let ai_manager = null

const displaySelector = document.querySelector('#display')
displaySelector.onchange = () => {
	const v = displaySelector.value
	for (const di of document.querySelectorAll('#display-area > *')) {
		di.style.display = di.id === v ? 'block' : 'none'
	}
}

const AIData = {
	'': '',
	manual: 'manual',
	text: 'text',
	functional: 'function',
	camera: 'camera',
	capture: 'capture',
	microphone: 'microphone',
	upload: 'upload',
	air: 'air passenger',
	hr_diagram: 'HR Diagram',
	titanic: 'Titanic',
	uci: 'UCI',
	esl: 'ESL',
	statlib: 'StatLib',
	dashboard_estat: 'e-Stat',
	poke: 'Pokémon',
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
				{ value: 'weighted_kmeans', title: 'Weighted k-means' },
				{ value: 'isodata', title: 'ISODATA' },
				{ value: 'soft_kmeans', title: 'Soft K-Means' },
				{ value: 'fuzzy_cmeans', title: 'Fuzzy C-Means' },
				{ value: 'pcm', title: 'Possibilistic C-Means' },
				{ value: 'kernel_kmeans', title: 'Kernel K-Means' },
				{ value: 'genetic_kmeans', title: 'Genetic k-means' },
				{ value: 'lbg', title: 'Linde-Buzo-Gray' },
				{ value: 'pam', title: 'PAM / CLARA' },
				{ value: 'clarans', title: 'CLARANS' },
				{ value: 'som', title: 'Self-organizing map' },
				{ value: 'neural_gas', title: 'Neural Gas' },
				{ value: 'growing_som', title: 'Growing SOM' },
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
				{ value: 'c2p', title: 'C2P' },
				{ value: 'diana', title: 'DIANA' },
				{ value: 'monothetic', title: 'Monothetic' },
			],
			Distribution: [
				{ value: 'gmm', title: 'Gaussian mixture model' },
				{ value: 'vbgmm', title: 'Variational Bayesian GMM' },
			],
			Density: [
				{ value: 'mean_shift', title: 'Mean Shift' },
				{ value: 'dbscan', title: 'DBSCAN' },
				{ value: 'optics', title: 'OPTICS' },
				{ value: 'hdbscan', title: 'HDBSCAN' },
				{ value: 'denclue', title: 'DENCLUE' },
			],
			'': [
				{ value: 'mutual_knn', title: 'Mutual kNN' },
				{ value: 'art', title: 'Adaptive resonance theory' },
				//{ value: "sting", title: "STING" },
				{ value: 'svc', title: 'Support vector clustering' },
				{ value: 'affinity_propagation', title: 'Affinity Propagation' },
				{ value: 'cast', title: 'CAST' },
				{ value: 'clues', title: 'CLUES' },
				{ value: 'chameleon', title: 'CHAMELEON' },
				{ value: 'coll', title: 'COLL' },
				{ value: 'plsa', title: 'PLSA' },
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
				{ value: 'complement_naive_bayes', title: 'Complement Naive Bayes' },
				{ value: 'negation_naive_bayes', title: 'Negation Naive Bayes' },
				{ value: 'universal_set_naive_bayes', title: 'Universal-set Naive Bayes' },
				{ value: 'selective_naive_bayes', title: 'Selective Naive Bayes' },
				{ value: 'aode', title: 'AODE' },
			],
			'Decision Tree': [
				{ value: 'decision_tree', title: 'Decision Tree' },
				{ value: 'random_forest', title: 'Random Forest' },
				{ value: 'extra_trees', title: 'Extra Trees' },
				{ value: 'gbdt', title: 'GBDT' },
				{ value: 'xgboost', title: 'XGBoost' },
			],
			'Nearest neighbor': [
				{ value: 'knearestneighbor', title: 'k nearest neighbor' },
				{ value: 'radius_neighbor', title: 'Radius neighbor' },
				{ value: 'weighted_knn', title: 'Weighted KNN' },
				{ value: 'fuzzy_knearestneighbor', title: 'Fuzzy KNN' },
				{ value: 'enn', title: 'Extended Nearest Neighbor' },
				{ value: 'nnbca', title: 'NNBCA' },
				{ value: 'adamenn', title: 'Adaptive Metric Nearest Neighbor' },
				{ value: 'dann', title: 'Discriminant adaptive nearest neighbor' },
				{ value: 'iknn', title: 'IKNN' },
				{ value: 'lmnn', title: 'LMNN' },
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
				{ value: 'stoptron', title: 'Stoptron' },
				{ value: 'pegasos', title: 'Pegasos' },
				{ value: 'kernelized_pegasos', title: 'Kernelized Pegasos' },
				{ value: 'mira', title: 'MIRA' },
				{ value: 'forgetron', title: 'Forgetron' },
				{ value: 'projectron', title: 'Projectron / Projectron++' },
				{ value: 'selective_sampling_perceptron', title: 'Selective-sampling Perceptron' },
				{ value: 'selective_sampling_sop', title: 'Selective-sampling SOP' },
				{ value: 'voted_perceptron', title: 'Voted Perceptron' },
				{ value: 'kernelized_perceptron', title: 'Kernelized Perceptron' },
				{ value: 'budget_perceptron', title: 'Budget Perceptron' },
				{ value: 'margin_perceptron', title: 'Margin Perceptron' },
				{ value: 'paum', title: 'PAUM' },
				{ value: 'shifting_perceptron', title: 'Shifting Perceptron' },
				{ value: 'rbp', title: 'RBP' },
				{ value: 'banditron', title: 'Banditron' },
				{ value: 'ballseptron', title: 'Ballseptron' },
				{ value: 'tighter_perceptron', title: 'Tighter Perceptron' },
				{ value: 'tightest_perceptron', title: 'Tightest Perceptron' },
				{ value: 'bsgd', title: 'BSGD' },
				{ value: 'silk', title: 'ILK / SILK' },
				{ value: 'bpa', title: 'BPA' },
				{ value: 'bogd', title: 'BOGD' },
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
				{ value: 'nearest_centroid', title: 'Nearest Centroid' },
				{ value: 'logistic', title: 'Logistic regression' },
				{ value: 'probit', title: 'Probit' },
				{ value: 'svm', title: 'Support vector machine' },
				{ value: 'gaussian_process', title: 'Gaussian Process' },
				{ value: 'hmm', title: 'HMM' },
				{ value: 'crf', title: 'CRF' },
				{ value: 'bayesian_network', title: 'Bayesian Network' },
			],
		},
	},
	{
		group: 'SC',
		methods: [
			{ value: 'knearestneighbor', title: 'k nearest neighbor' },
			{ value: 'radius_neighbor', title: 'Radius neighbor' },
			{ value: 'label_propagation', title: 'Label propagation' },
			{ value: 'label_spreading', title: 'Label spreading' },
			{ value: 'kmeans', title: 'K-Means' },
			{ value: 'gmm', title: 'Gaussian mixture model' },
			{ value: 's3vm', title: 'Support vector machine' },
			{ value: 'ladder_network', title: 'Ladder network' },
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
				{ value: 'extra_trees', title: 'Extra Trees' },
				{ value: 'gbdt', title: 'GBDT' },
				{ value: 'xgboost', title: 'XGBoost' },
			],
			'Nearest neighbor': [
				{ value: 'knearestneighbor', title: 'k nearest neighbor' },
				{ value: 'radius_neighbor', title: 'Radius neighbor' },
				{ value: 'inverse_distance_weighting', title: 'IDW' },
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
				{ value: 'rbf', title: 'RBF Network' },
				{ value: 'rvm', title: 'RVM' },
				{ value: 'svr', title: 'Support vector regression' },
				{ value: 'mlp', title: 'Multi-layer perceptron' },
				{ value: 'neuralnetwork', title: 'Neuralnetwork' },
				{ value: 'gmm', title: 'Gaussian mixture regression' },
				{ value: 'isotonic', title: 'Isotonic' },
				{ value: 'ramer_douglas_peucker', title: 'Ramer Douglas Peucker' },
				{ value: 'theil_sen', title: 'Theil-Sen' },
				{ value: 'passing_bablok', title: 'Passing Bablok' },
				{ value: 'rmr', title: 'Repeated Median' },
			],
		},
	},
	{
		group: 'IN',
		methods: [
			{ value: 'knearestneighbor', title: 'nearest neighbor' },
			{ value: 'inverse_distance_weighting', title: 'IDW' },
			{ value: 'lerp', title: 'Linear' },
			{ value: 'slerp', title: 'Spherical linear' },
			{ value: 'brahmagupta_interpolation', title: 'Brahmagupta' },
			// { value: "slerp", title: "Slerp" },
			{ value: 'logarithmic_interpolation', title: 'Logarithmic' },
			{ value: 'cosine_interpolation', title: 'Cosine' },
			{ value: 'smoothstep', title: 'Smoothstep' },
			{ value: 'inverse_smoothstep', title: 'Inverse Smoothstep' },
			{ value: 'cubic_interpolation', title: 'Cubic' },
			{ value: 'cubic_hermite_spline', title: 'Cubic Hermite' },
			{ value: 'catmull_rom', title: 'Catmull Rom' },
			{ value: 'polynomial_interpolation', title: 'Polynomial' },
			{ value: 'lagrange', title: 'Lagrange' },
			{ value: 'trigonometric_interpolation', title: 'Trigonometric' },
			{ value: 'spline_interpolation', title: 'Spline' },
			{ value: 'rbf', title: 'RBF Network' },
			{ value: 'akima', title: 'Akima' },
			{ value: 'natural_neighbor_interpolation', title: 'Natural neighbor' },
			{ value: 'delaunay_interpolation', title: 'Delaunay' },
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
			{ value: 'cof', title: 'COF' },
			{ value: 'odin', title: 'ODIN' },
			{ value: 'ldof', title: 'LDOF' },
			{ value: 'inflo', title: 'INFLO' },
			{ value: 'loci', title: 'LOCI' },
			{ value: 'loop', title: 'LoOP' },
			{ value: 'ldf', title: 'LDF' },
			{ value: 'kdeos', title: 'KDEOS' },
			{ value: 'rdos', title: 'RDOS' },
			{ value: 'rkof', title: 'RKOF' },
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
			{ value: 'hlle', title: 'HLLE' },
			{ value: 'mlle', title: 'MLLE' },
			{ value: 'laplacian_eigenmaps', title: 'Laplacian eigenmaps' },
			{ value: 'isomap', title: 'Isomap' },
			{ value: 'ltsa', title: 'LTSA' },
			{ value: 'diffusion_map', title: 'Diffusion map' },
			{ value: 'tsne', title: 'SNE / t-SNE' },
			{ value: 'umap', title: 'UMAP' },
			{ value: 'som', title: 'Self-organizing map' },
			{ value: 'gtm', title: 'Generative Topographic Mapping' },
			{ value: 'nmf', title: 'NMF' },
			{ value: 'mod', title: 'Method of Optimal Direction' },
			{ value: 'ksvd', title: 'K-SVD' },
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
			{ value: 'naive_bayes', title: 'Naive Bayes' },
			{ value: 'gmm', title: 'Gaussian mixture model' },
			{ value: 'hmm', title: 'HMM' },
		],
	},
	{
		group: 'GR',
		methods: [
			{ value: 'mh', title: 'MH' },
			{ value: 'slice_sampling', title: 'Slice Sampling' },
			{ value: 'gmm', title: 'GMM' },
			{ value: 'rbm', title: 'GBRBM' },
			{ value: 'hmm', title: 'HMM' },
			{ value: 'vae', title: 'VAE' },
			{ value: 'gan', title: 'GAN' },
			{ value: 'nice', title: 'NICE' },
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
			{ value: 'cof', title: 'COF' },
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
				{ value: 'statistical_region_merging', title: 'Statistical Region Merging' },
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
			{ value: 'nlmeans', title: 'NL Means' },
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
		methods: [{ value: 'dqn', title: 'DQN / DDQN' }],
	},
	{
		group: 'RC',
		methods: [{ value: 'association_analysis', title: 'Association Analysis' }],
	},
]
for (const ag of AIMethods) {
	AIMethods[ag.group] = ag
}

const app = Vue.createApp({})

app.component('model-selector', {
	data: function () {
		return {
			aiData: AIData,
			aiTask: AITask,
			modelFilter: '',
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
						return document.querySelector('#rl_menu')
					},
				},
				ml: {
					get configElement() {
						return d3.select('#method_menu .buttons')
					},
					get modelName() {
						return _this.mlModel
					},
					set usage(value) {
						const elm = document.querySelector('#method_menu .usage-content')
						elm.querySelector('.usage').innerText = value
						if (value) {
							elm.classList.remove('hide')
						} else {
							elm.classList.add('hide')
						}
					},
					set draft(value) {
						if (value) {
							document.querySelector('#method_menu .draft').classList.remove('hide')
						} else {
							document.querySelector('#method_menu .draft').classList.add('hide')
						}
					},
					set require(value) {
						let txt = ''
						if (value?.dimension) {
							if (Array.isArray(value.dimension)) {
								if (value.dimension.indexOf(ai_manager.datas.dimension || 1) < 0) {
									txt += `This model works with ${value.dimension.join(' or ')}D data.`
								}
							} else if ((ai_manager.datas.dimension || 1) !== value.dimension) {
								txt += `This model works with ${value?.dimension}D data.`
							}
						}
						document.querySelector('#method_menu .require-info').innerText = txt
					},
					set detail(value) {
						const elm = document.querySelector('#method_menu .detail-content')
						const dtl = elm.querySelector('.detail')
						dtl.innerHTML = value
						if (value) {
							elm.classList.remove('hide')
						} else {
							elm.classList.add('hide')
						}
						MathJax.typesetPromise([dtl])
					},
					set reference(value) {
						const elm = document.querySelector('#method_menu .reference-content')
						let dtl = elm.querySelector('.reference')
						dtl.innerText = ''
						if (value) {
							if (value.url) {
								const a = document.createElement('a')
								a.href = value.url
								a.rel = 'noreferrer noopener'
								a.target = '_blank'
								dtl.appendChild(a)
								dtl = a
							}
							if (value.author) {
								dtl.innerText += value.author + ' '
							}
							dtl.innerText += '"' + value.title + '"'
							if (value.year) {
								dtl.innerText += ' (' + value.year + ')'
							}
							elm.classList.remove('hide')
						} else {
							elm.classList.add('hide')
						}
					},
					refresh() {
						_this.ready()
					},
				},
				data: {
					get configElement() {
						return document.querySelector('#data_menu')
					},
				},
				task: {
					get configElement() {
						return document.querySelector('#task_menu')
					},
				},
				render: {
					addItem(name) {
						document.querySelector('#display-type').style.display = 'block'
						const id = `${name}-area`
						const opt = document.createElement('option')
						opt.value = id
						opt.innerText = name
						displaySelector.appendChild(opt)
						const area = document.createElement('div')
						area.id = id
						if (displaySelector.options.length === 1) {
							document.querySelector('#display-type').style.display = 'none'
						} else {
							area.style.display = 'none'
						}
						document.querySelector('#display-area').appendChild(area)
						return area
					},
					selectItem(name) {
						const id = `${name}-area`
						for (const opt of displaySelector.options) {
							if (opt.value === id) {
								opt.selected = true
								displaySelector.onchange()
								return
							}
						}
					},
					removeItem(name) {
						const id = `${name}-area`
						const area = document.querySelector(`#display-area #${id}`)
						if (area) {
							area.remove()
						}
						let reset = false
						for (const opt of displaySelector.options) {
							if (opt.value === id) {
								displaySelector.removeChild(opt)
								reset = true
							}
						}
						if (reset && displaySelector.options.length > 0) {
							displaySelector.options[0].selected = true
							displaySelector.onchange()
						}
						if (displaySelector.options.length === 1) {
							document.querySelector('#display-type').style.display = 'none'
						}
					},
				},
				get footer() {
					return document.querySelector('#method_footer')
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
	`,
	created() {
		const state = {
			data: 'manual',
			task: '',
			model: '',
			...Object.fromEntries(new URLSearchParams(location.search).entries()),
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
		aiMethods() {
			if (this.modelFilter === '') {
				return AIMethods
			}
			const exp = new RegExp(this.modelFilter, 'i')
			const methods = []
			for (let i = 0; i < AIMethods.length; i++) {
				methods[i] = { group: AIMethods[i].group }
				if (Array.isArray(AIMethods[i].methods)) {
					methods[i].methods = AIMethods[i].methods.filter(m => exp.test(m.title))
				} else {
					methods[i].methods = {}
					for (const sub of Object.keys(AIMethods[i].methods)) {
						methods[i].methods[sub] = AIMethods[i].methods[sub].filter(m => exp.test(m.title))
					}
				}
				methods[AIMethods[i].group] = methods[i]
			}
			return methods
		},
		modelCounts() {
			const counts = {}
			for (let i = 0; i < this.aiMethods.length; i++) {
				const task = this.aiMethods[i].group
				if (Array.isArray(this.aiMethods[i].methods)) {
					counts[task] = this.aiMethods[i].methods.length
				} else {
					counts[task] = 0
					for (const sub of Object.keys(this.aiMethods[i].methods)) {
						counts[task] += this.aiMethods[i].methods[sub].length
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
			ai_manager?.setData(this.mlData).then(() => {
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
			let state = (this.state = {
				data: this.mlData,
				task: this.mlTask,
				model: this.mlModel,
				...ai_manager.datas?.params,
				...ai_manager.platform?.params,
			})
			Promise.resolve().then(() => {
				state = this.state = {
					data: this.mlData,
					task: this.mlTask,
					model: this.mlModel,
					...ai_manager.datas?.params,
					...ai_manager.platform?.params,
				}
				let sep = '?'
				const url = Object.keys(this.state).reduce((t, k) => {
					if (this.state[k] != null) {
						t += `${sep}${k}=${encodeURIComponent(this.state[k])}`
						sep = '&'
					}
					return t
				}, '/')
				window.history.pushState(state, '', url)
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
			const mlelem = document.querySelector('#method_menu')
			mlelem.querySelector('.buttons').replaceChildren()
			mlelem.querySelector('.draft').classList.add('hide')
			mlelem.querySelector('.require-info').innerText = ''
			mlelem.querySelector('.detail-content').classList.add('hide')
			mlelem.querySelector('.usage-content').classList.add('hide')
			mlelem.querySelector('.reference-content').classList.add('hide')

			const readyModel = () => {
				if (!mlModel) {
					ai_manager.setModel('')
					return
				}
				const loader = document.createElement('div')
				loader.classList.add('loader')
				mlelem.appendChild(loader)
				mlelem.querySelector('.buttons').replaceChildren()
				ai_manager.setModel(mlModel).then(() => {
					loader.remove()
				})
			}

			ai_manager.setTask(this.mlTask).then(() => {
				if (ai_manager.platform) {
					ai_manager.platform.params = this.state
				}
				readyModel()
			})
		},
	},
})

app.mount('#ml_selector')
