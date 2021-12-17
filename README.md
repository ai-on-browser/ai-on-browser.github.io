# AI on Browser

[![npm version](https://badge.fury.io/js/@ai-on-browser%2Fdata-analysis-models.svg)](https://badge.fury.io/js/@ai-on-browser%2Fdata-analysis-models)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Javascript AI package and online demo.

## Features

- Most of the models are completed in a single file and implemented in a simple way.
- The machine learning part of the code does not use any external libraries.
- All processing in the demo is done in client-side JavaScript.

## Links

- [Online demo](https://ai-on-browser.github.io/)
- [Package document](https://ai-on-browser.github.io/docs)
- [Package release notes](https://github.com/ai-on-browser/ai-on-browser.github.io/releases)

## Caution

- The code is not practical in terms of speed, memory usage, etc.

## Models (with demo)

| task | model |
| ---- | ----- |
| clustering | k-means, k-means++, k-medois, k-medians, x-means, G-means, LBG, ISODATA, Soft k-means, Fuzzy c-means, Possibilistic c-means, Kernel k-means, Agglomerative (complete linkage, single linkage, group average, Ward's, centroid, weighted average, median), DIANA, Mean shift, DBSCAN, OPTICS, PAM, CLARA, CLARANS, BIRCH, CURE, ROCK, Latent dirichlet allocation, GMM, VBGMM, Affinity propagation, Spectral clustering, Mountain, SOM, GTM, (Growing) Neural gas, Growing cell structures, LVQ, CAST, NMF, Autoencoder |
| classification | Linear discriminant (FLD, LDA), Quadratic discriminant, Mixture discriminant, Least squares, Ridge, (Complement / Negation / Universal-set / Selective) Naive Bayes (gaussian), AODE, k nearest neighbor, Nearest centroid, Decision tree, Random forest, GBDT, XGBoost, ALMA, ROMMA, Online gradient descent, Passive aggressive, RLS, Second order perceptron, AROW, NAROW, Confidence weighted, CELLIP, IELLIP, Normal herd, (Multinomial) Logistic regression, (Multinomial) Probit, SVM, Gaussian process, HMM, CRF, Bayesian Network, LVQ, Perceptron, ADALINE, MLP, LMNN |
| semi-supervised classification | k nearest neighbor, Label propagation, Label spreading, k-means, GMM |
| regression | Least squares, Ridge, Lasso, Elastic net, RLS, Bayesian linear, Poisson, Least absolute deviations, Huber, Tukey, Least trimmed squares, Least median squares, Lp norm linear, SMA, Deming, Segmented, LOWESS, spline, Gaussian process, Principal components, Partial least squares, Projection pursuit, Quantile regression, k nearest neighbor, IDW, Nadaraya Watson, Priestley Chao, Gasser Muller, RBF Network, RVM, Decision tree, Random forest, GBDT, XGBoost, SVR, MLP, GMR, Isotonic, Ramer Douglas Peucker, Passing-Bablok, Repeated median |
| interpolation | Nearest neighbor, IDW, Linear, Brahmagupta, Logarithmic, Cosine, (Inverse) Smoothstep, Cubic, (Centripetal) Catmull-Rom, Hermit, Polynomial, Lagrange, Trigonometric, Spline, RBF Network, Akima, Delaunay |
| anomaly detection | Percentile, MAD, Tukey's fences, Grubbs's test, Thompson test, Tietjen Moore test, Generalized ESD, Hotelling, MT, MCD, k nearest neighbor, LOF, PCA, OCSVM, KDE, GMM, Isolation forest, Autoencoder, GAN |
| dimensionality reduction | Random projection, (Dual/Kernel) PCA, Incremental PCA, Probabilistic PCA, GPLVM, LSA, MDS, Linear discriminant analysis, NCA, ICA, Principal curve, Sammon, FastMap, Sliced inverse regression, LLE, Laplacian eigenmaps, Isomap, SNE, t-SNE, SOM, GTM, NMF, Autoencoder, VAE |
| feature selection | Mutual information, Ridge, Lasso, Elastic net, Decision tree, NCA |
| transformation | Box-Cox, Yeo-Johnson |
| density estimation | Histogram, Average shifted histogram, Polynomial histogram, Maximum likelihood, Kernel density estimation, k nearest neighbor, Naive Bayes, GMM, HMM |
| generate | MH, GMM, GBRBM, HMM, VAE, GAN |
| smoothing | Moving average (simple, linear weighted, triangular), Exponential average, Moving median, Cumulative moving average, KZ filter, Savitzky Golay filter, Hampel filter, Kalman filter, Particle filter, Lowpass filter, Bessel filter, Butterworth filter, Chebyshev filter, Elliptic filter |
| timeseries prediction | Holt winters, AR, ARMA, SDAR, VAR, Kalman filter, MLP, RNN |
| change point detection | Cumulative sum, k nearest neighbor, LOF, SST, KLIEP, LSIF, uLSIF, LSDD, HMM, Markov switching |
| segmentation | P-Tile, Automatic thresholding, Balanced histogram thresholding, Otsu's method, Sezan, Adaptive thresholding, Bernsen, Niblack, Sauvola, Phansalkar, Split and merge, Mean shift |
| denoising | Hopfield network, RBM, GBRBM |
| edge detection | Roberts cross, Sobel, Prewitt, Laplacian, LoG, Canny, Snakes |
| word embedding | Word2Vec |
| recommendation | association analysis |
| markov decision process | Dynamic programming, Monte carlo, Q learning, SARSA, Policy gradient, DQN, DDQN, A2C, Genetic algorithm |
| game | |

## Models (only in package)

| type | model |
| ---- | ----- |
| clustering | k-modes, k-prototypes |
| semi-supervised classification | Self-training |
| regression | Weighted least squares |
| interpolation | Slerp |
| scaling | Max absolute scaler, Minmax normalization, Robust scaler, Standardization |
| density ratio | RuLSIF |

## Datas

| name | description |
| ---- | ----------- |
| manual | Create 2D or 1D data manually. |
| text | Create text data manually. |
| function | Create from a expression like `exp(-(x ^ 2 + y ^ 2) / 2)`. |
| camera | Images taken with a web camera |
| capture | Images captured from a window |
| microphone | Audio recorded with a microphone |
| upload | Uploaded Text/CSV/Image file |
| Air passenger | Famous 1D time series data |
| Titanic | Titanic data |
| UCI | Data from UCI Machine Learning Repository |
| ESL | Data from The Elements of Statistical Learning |

## Reinforcement learning environment

| name | description |
| ---- | ----------- |
| grid | A simple maze on 2D grid world. |
| cartpole | Stand the pole on the cart. |
| mountain car | Drive the car up the hill. |
| acrobot | Lift the double pendulum. |
| pendulum | Lift the pendulum. |
| maze | A maze on a fine grid plane. |
| waterball | Moving amidst the drift of bait and poison. |
| draughts | Draughts game. |
| reversi | Reversi game. |
| gomoku | Gomoku game. |
| breaker | Breaker game. |

## NeuralNetwork layers

| type | name |
| ---- | ---- |
| basic | input, output, supervisor, include, const, random, variable, activation |
| function | abs, batch_normalization, conv, elu, exp, full, gaussian, leaky_relu, linear, log, negative, power, prelu, relu, rrelu, sigmoid, softmax, softplus, softsign, sqrt, square, tanh |
| operator | add, sub, mult, div, matmul |
| recurrent | gru, lstm, rnn |
| reduce | sum, mean, variance, argmax, softargmax |
| loss | huber, mse |
| other | concat, split, detach, clip, dropout, onehot, reshape, flatten, transpose, reverse, sparce, cond, less |

## Contact

Twitter : [@mirasunimoni](https://twitter.com/mirasunimoni)
