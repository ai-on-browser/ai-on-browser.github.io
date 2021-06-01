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
| clustering | k-means, k-means++, k-medois, k-medians, x-means, LBG, ISODATA, Soft k-means, Fuzzy c-means, Possibilistic c-means, hierarchy (complete linkage, single linkage, group average, Ward's, centroid, weighted average, median), DIANA, mean shift, DBSCAN, OPTICS, PAM, CLARA, CLARANS, BIRCH, CURE, ROCK, Latent Dirichlet Allocation, GMM, VBGMM, affinity propagation, spectral clustering, Mountain, SOM, (growing) neural gas, LVQ, NMF, autoencoder |
| classification | linear discriminant (FLD, LDA), quadratic discriminant, mixture discriminant, Ridge, naive bayes (gaussian), AODE, k nearest neighbor, nearest centroid, decision tree, random forest, GBDT, XGBoost, ALMA, ROMMA, Online gradient descent, passive aggressive, RLS, Second order perceptron, AROW, NAROW, confidence weighted, CELLIP, IELLIP, Normal herd, (multinomial) logistic regression, (multinomial) probit, SVM, gaussian process, HMM, LVQ, Perceptron, ADALINE, MLP |
| semi-supervised classification | k nearest neighbor, label propagation, label spreading, k-means, GMM |
| regression | least squares, ridge, lasso, elastic net, RLS, bayesian linear, poisson, Least absolute deviations, Least trimmed squares, Least median squares, Lp norm linear, segmented, LOWESS, spline, gaussian process, principal components, partial least squares, projection pursuit, Quantile Regression, k nearest neighbor, Nadaraya Watson, Priestley Chao, RBF Network, RVM, decision tree, random forest, GBDT, XGBoost, SVR, MLP, isotonic, Ramer Douglas Peucker |
| interpolation | nearest neighbor, linear, lagrange, spline, RBF Network, Akima |
| anomaly detection | percentile, MAD, Grubbs's test, Thompson test, Tietjen Moore test, generalized ESD, Hotelling, MT, MCD, k nearest neighbor, LOF, PCA, KDE, GMM, isolation forest, autoencoder, GAN |
| dimension reduction | random projection, PCA (kernel), LSA, MDS, linear discriminant analysis, NCA, ICA, Principal curve, Sammon, FastMap, LLE, Laplacian eigenmaps, Isomap, SNE, t-SNE, SOM, NMF, autoencoder, VAE |
| feature selection | mutual information, ridge, lasso, elastic net, decision tree, NCA |
| density estimation | histogram, average shifted histogram, maximum likelihood, kernel density estimation, k nearest neighbor, GMM, HMM |
| generate | GMM, GBRBM, VAE, GAN |
| smoothing | moving average (simple, linear weighted, triangular), exponential average, moving median, cumulative moving average, KZ filter, Savitzky Golay filter, hampel filter, kalman filter, particle filter, lowpass filter, butterworth filter, chebyshev filter, elliptic filter |
| timeseries prediction | holt winters, AR, ARMA, SDAR, kalman filter, MLP |
| change point detection | cumulative sum, k nearest neighbor, LOF, SST, KLIEP, uLSIF, LSDD, HMM, markov switching |
| segmentation | Automatic thresholding, Balanced histogram thresholding, Otsu's method, Sezan, Split and merge, mean shift |
| denoising | Hopfield network, RBM, GBRBM |
| edge detection | Sobel, Prewitt, Laplacian, Canny |
| word embedding | Word2Vec |
| markov decision process | dynamic programming, monte carlo, Q learning, SARSA, policy gradient, DQN, genetic algorithm |
| game | |

## Datas

| name | description |
| ---- | ----------- |
| manual | Create 2D or 1D data manually. |
| function | Create from a expression like `exp(-(x ^ 2 + y ^ 2) / 2)`. |
| Air passenger | Famous 1D time series data |
| UCI | Data from UCI Machine Learning Repository |
| upload | Uploaded Text/CSV/Image file |
| camera | Images taken with a web camera |
| audio | Audio recorded with a microphone |

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
