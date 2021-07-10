# [AI on Browser](https://ai-on-browser.github.io/)

## Abstract

This is a site where you can easily try out AI in your browser.

## Features

- All processing is done in client-side JavaScript.
- The machine learning part of the code does not use any external libraries.

## Caution

- The code is not practical in terms of speed, memory usage, etc.

## Models

| task | model |
| ---- | ----- |
| clustering | k-means, k-means++, k-medois, k-medians, x-means, LBG, ISODATA, Soft k-means, Fuzzy c-means, Possibilistic c-means, Hierarchy (complete linkage, single linkage, group average, Ward's, centroid, weighted average, median), DIANA, Mean shift, DBSCAN, OPTICS, PAM, CLARA, CLARANS, BIRCH, CURE, ROCK, Latent dirichlet allocation, GMM, VBGMM, Affinity propagation, Spectral clustering, Mountain, SOM, GTM, (Growing) Neural gas, Growing cell structures, LVQ, NMF, Autoencoder |
| classification | Linear discriminant (FLD, LDA), Quadratic discriminant, Mixture discriminant, Ridge, Naive bayes (gaussian), AODE, k nearest neighbor, Nearest centroid, Decision tree, Random forest, GBDT, XGBoost, ALMA, ROMMA, Online gradient descent, Passive aggressive, RLS, Second order perceptron, AROW, NAROW, Confidence weighted, CELLIP, IELLIP, Normal herd, (Multinomial) Logistic regression, (Multinomial) Probit, SVM, Gaussian process, HMM, LVQ, Perceptron, ADALINE, MLP |
| semi-supervised classification | k nearest neighbor, Label propagation, Label spreading, k-means, GMM |
| regression | Least squares, Ridge, Lasso, Elastic net, RLS, Bayesian linear, Poisson, Least absolute deviations, Least trimmed squares, Least median squares, Lp norm linear, Segmented, LOWESS, spline, Gaussian process, Principal components, Partial least squares, Projection pursuit, Quantile regression, k nearest neighbor, IDW, Nadaraya Watson, Priestley Chao, RBF Network, RVM, Decision tree, Random forest, GBDT, XGBoost, SVR, MLP, GMR, Isotonic, Ramer Douglas Peucker |
| interpolation | Nearest neighbor, IDW, Linear, Logarithmic, Cosine, Smoothstep, Cubic, Hermit, Polynomial, Lagrange, Spline, RBF Network, Akima |
| anomaly detection | Percentile, MAD, Grubbs's test, Thompson test, Tietjen Moore test, Generalized ESD, Hotelling, MT, MCD, k nearest neighbor, LOF, PCA, OCSVM, KDE, GMM, Isolation forest, Autoencoder, GAN |
| dimension reduction | Random projection, PCA (kernel), LSA, MDS, Linear discriminant analysis, NCA, ICA, Principal curve, Sammon, FastMap, Sliced inverse regression, LLE, Laplacian eigenmaps, Isomap, SNE, t-SNE, SOM, GTM, NMF, Autoencoder, VAE |
| feature selection | Mutual information, Ridge, Lasso, Elastic net, Decision tree, NCA |
| density estimation | Histogram, Average shifted histogram, Polynomial histogram, Maximum likelihood, Kernel density estimation, k nearest neighbor, GMM, HMM |
| generate | GMM, GBRBM, HMM, VAE, GAN |
| smoothing | Moving average (simple, linear weighted, triangular), Exponential average, Moving median, Cumulative moving average, KZ filter, Savitzky Golay filter, Hampel filter, Kalman filter, Particle filter, Lowpass filter, Butterworth filter, Chebyshev filter, Elliptic filter |
| timeseries prediction | Holt winters, AR, ARMA, SDAR, Kalman filter, MLP |
| change point detection | Cumulative sum, k nearest neighbor, LOF, SST, KLIEP, uLSIF, LSDD, HMM, Markov switching |
| segmentation | P-Tile, Automatic thresholding, Balanced histogram thresholding, Otsu's method, Sezan, Adaptive thresholding, Sauvola, Split and merge, Mean shift |
| denoising | Hopfield network, RBM, GBRBM |
| edge detection | Roberts cross, Sobel, Prewitt, Laplacian, LoG, Canny, Snakes |
| word embedding | Word2Vec |
| markov decision process | Dynamic programming, Monte carlo, Q learning, SARSA, Policy gradient, DQN, Genetic algorithm |
| game | |

## Datas

| name | description |
| ---- | ----------- |
| manual | Create 2D or 1D data manually. |
| text | Create text data manually. |
| function | Create from a expression like `exp(-(x ^ 2 + y ^ 2) / 2)`. |
| Air passenger | Famous 1D time series data |
| UCI | Data from UCI Machine Learning Repository |
| upload | Uploaded Text/CSV/Image file |
| camera | Images taken with a web camera |
| microphone | Audio recorded with a microphone |

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

## Contact

Twitter : [@mirasunimoni](https://twitter.com/mirasunimoni)
