import { Tree, Tensor, Matrix } from './util/math.js'
import EnsembleBinaryModel from './util/ensemble.js'

const def = {
	Tree: Tree,
	Tensor: Tensor,
	Matrix: Matrix,
	models: {},
	EnsembleBinaryModel: EnsembleBinaryModel,
}

const modelFiles = [
	'adaline',
	'adaptive_thresholding',
	'affinity_propagation',
	'akima',
	'alma',
	'aode',
	'ar',
	'arma',
	'arow',
	'autoencoder',
	'automatic_thresholding',
	'average_shifted_histogram',
	'balanced_histogram',
	'bayesian_linear',
	'bernsen',
	'bessel',
	'birch',
	'box_cox',
	'brahmagupta_interpolation',
	'butterworth',
	'canny',
	'catmull_rom',
	'cda',
	'change_finder',
	'chebyshev',
	'clarans',
	'confidence_weighted',
	'cosine_interpolation',
	'crf',
	'cubic_interpolation',
	'cumulative_moving_average',
	'cumulative_sum',
	'cure',
	'dbscan',
	'decision_tree',
	'diana',
	'dqn',
	'dynamic_programming',
	'elastic_net',
	'elliptic_filter',
	'exponential_average',
	'fastmap',
	'fuzzy_cmeans',
	'gan',
	'gaussian_process',
	'gbdt',
	'generalized_esd',
	'genetic_algorithm',
	'gmm',
	'growing_cell_structures',
	'growing_neural_gas',
	'gtm',
	'hampel',
	'hermit_interpolation',
	'hierarchy',
	'histogram',
	'hmm',
	'holt_winters',
	'hopfield',
	'hotelling',
	'ica',
	'iellip',
	'incremental_pca',
	'inverse_distance_weighting',
	'inverse_smoothstep',
	'isodata',
	'isolation_forest',
	'isomap',
	'isotonic',
	'kalman_filter',
	'kernel_density_estimator',
	'kernel_kmeans',
	'kliep',
	'kmeans',
	'knearestneighbor',
	'kz',
	'label_propagation',
	'label_spreading',
	'lagrange',
	'laplacian_eigenmaps',
	'laplacian',
	'lasso',
	'latent_dirichlet_allocation',
	'lbg',
	'lda',
	'least_absolute',
	'least_square',
	'lerp',
	'lle',
	'lmeds',
	'lof',
	'logarithmic_interpolation',
	'logistic',
	'log',
	'lowess',
	'lowpass',
	'lpnorm_linear',
	'lsa',
	'lsdd',
	'lts',
	'lvq',
	'mad',
	'markov_switching',
	'maximum_likelihood',
	'mcd',
	'mda',
	'mds',
	'mean_shift',
	'mlp',
	'monte_carlo',
	'mountain',
	'moving_average',
	'moving_median',
	'mt',
	'mutual_information',
	'nadaraya_watson',
	'naive_bayes',
	'narow',
	'nca',
	'nearest_centroid',
	'neural_gas',
	'neuralnetwork',
	'niblack',
	'nmf',
	'normal_herd',
	'ocsvm',
	'ogd',
	'optics',
	'otsu',
	'pam',
	'particle_filter',
	'passive_aggressive',
	'pca',
	'pcm',
	'pcr',
	'percentile',
	'perceptron',
	'phansalkar',
	'pls',
	'poisson',
	'policy_gradient',
	'polynomial_histogram',
	'polynomial_interpolation',
	'ppr',
	'prewitt',
	'priestley_chao',
	'principal_curve',
	'probit',
	'ptile',
	'q_learning',
	'quadratic_discriminant',
	'quantile_regression',
	'ramer_douglas_peucker',
	'random_forest',
	'random_projection',
	'rbf',
	'rbm',
	'ridge',
	'rls',
	'roberts',
	'rock',
	'romma',
	'rvm',
	'sammon',
	'sarsa',
	'sauvola',
	'savitzky_golay',
	'sdar',
	'segmented',
	'sezan',
	'sir',
	'slerp',
	'smirnov_grubbs',
	'smoothstep',
	'snakes',
	'sobel',
	'soft_kmeans',
	'som',
	'sop',
	'spectral',
	'spline_interpolation',
	'spline',
	'split_merge',
	'sst',
	'sting',
	'svm',
	'svr',
	'thompson',
	'tietjen_moore',
	'trigonometric_interpolation',
	'tsne',
	'ulsif',
	'vae',
	'vbgmm',
	'weighted_least_squares',
	'word_to_vec',
	'xgboost',
	'xmeans',
	'yeo_johnson',
	'zero_inflated',
]

for (const modelName of modelFiles) {
	const mod = await import(`./model/${modelName}.js`)
	for (const name of Object.keys(mod)) {
		if (name === 'default') {
			def.models[mod.default.name] = mod.default
		} else {
			def.models[name] = mod[name]
		}
	}
}

export default def