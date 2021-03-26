# AI on Browser

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
| clustering | k-means, k-means++, k-medois, x-means, LBG, ISODATA, Fuzzy c-means, hierarchy (complete linkage, single linkage, group average, Ward's, centroid, weighted average, median), DIANA, mean shift, DBSCAN, OPTICS, PAM, CLARA, CLARANS, BIRCH, CURE, Latent Dirichlet Allocation, GMM, VBGMM, affinity propagation, spectral clustering, Mountain, SOM, neural gas, LVQ, NMF, autoencoder |
| classification | linear discriminant (FLD, LDA), quadratic discriminant, mixture discriminant, Ridge, naive bayes (gaussian), k nearest neighbor, nearest centroid, decision tree, random forest, GBDT, passive aggressive, AROW, confidence weighted, logistic regression, probit, SVM, gaussian process, HMM, LVQ, MLP |
| regression | linear, polynomial, ridge, lasso, elastic net, bayesian linear, segmented, spline, gaussian process, principal components, partial least squares, k nearest neighbor, nadaraya watson, RBF Network, RVM, decision tree, random forest, GBDT, MLP, isotonic |
| interpolation | linear, lagrange, spline, RBF Network |
| anomaly detection | percentile, MAD, Grubbs's test, Thompson test, Tietjen Moore test, generalized ESD, MT, MCD, k nearest neighbor, LOF, PCA, KDE, GMM, isolation forest, autoencoder, GAN |
| dimension reduction | random projection, PCA (kernel), LSA, MDS, linear discriminant analysis, NCA, ICA, Principal curve, Sammon, FastMap, LLE, Laplacian eigenmaps, Isomap, t-SNE, SOM, NMF, autoencoder, VAE |
| feature selection | mutual information, ridge, lasso, elastic net, decision tree, NCA |
| density estimation | histogram, average shifted histogram, kernel density estimation, k nearest neighbor, GMM |
| generate | VAE, GAN |
| smoothing | moving average (simple, linear weighted, triangular), exponential average, moving median, cumulative moving average, kalman filter, particle filter |
| timeseries prediction | holt winters, AR, ARMA, SDAR, kalman filter, MLP |
| change point detection | cumulative sum, k nearest neighbor, LOF, SST, uLSIF, HMM, markov switching |
| segmentation | Balanced histogram thresholding, Otsu's method, Split and merge, mean shift |
| markov decision process | dynamic programming, monte carlo, Q learning, SARSA, policy gradient, DQN, genetic algorithm |
| game | |

## Datas

| name | description |
| ---- | ----------- |
| manual | Create 2D or 1D data manually. |
| function | Create from a expression like `exp(-(x ^ 2 + y ^ 2) / 2)`. |
| Swiss roll | Swiss roll |
| Air passenger | Famous 1D time series data |
| Iris | Famous classification data |
| Wine | Famous regression data |
| upload | Uploaded CSV file |
| camera | Images taken with a web camera |

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
