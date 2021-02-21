# AI on Browser

## Abstract

This is a site where you can easily try out AI in your browser.

## Features

- All processing is done in client-side JavaScript.
- The machine learning part of the code does not use any external libraries.

## Models

| task | model |
| ---- | ----- |
| clustering | k-means, k-means++, k-medois, x-means, LBG, ISODATA, Fuzzy c-means, hierarchy (complete linkage, single linkage, group average, Ward's, centroid, weighted average, median), DIANA, mean shift, DBSCAN, OPTICS, PAM, CLARA, CLARANS, BIRCH, GMM, VBGMM, affinity propagation, spectral clustering, SOM, neural gas, LVQ, NMF, autoencoder |
| classification | linear discriminant (FLD, LDA), quadratic discriminant, naive bayes (gaussian), k nearest neighbor, nearest centroid, decision tree, random forest, GBDT, passive aggressive, AROW, confidence weighted, logistic regression, probit, SVM, gaussian process, HMM, LVQ, MLP |
| regression | linear, polynomial, ridge, lasso, elastic net, spline, gaussian process, principal components, partial least squares, k nearest neighbor, nadaraya watson, RVM, decision tree, random forest, GBDT, MLP, isotonic |
| interpolation | linear, lagrange, spline |
| anomaly detection | percentile, MAD, Grubbs's test, Thompson test, Tietjen Moore test, generalized ESD, MT, MCD, k nearest neighbor, LOF, GMM, isolation forest, autoencoder |
| dimension reduction | random projection, PCA, LSA, MDS, linear discriminant analysis, ICA, Principal curve, Sammon, FastMap, LLE, Laplacian eigenmaps, Isomap, t-SNE, SOM, NMF, autoencoder, VAE |
| feature selection | mutual information, ridge, lasso, elastic net |
| density estimation | histogram, average shifted histogram, kernel density estimation, k nearest neighbor, GMM |
| generate | VAE, GAN |
| markov decision process | dynamic programming, monte carlo, Q learning, SARSA, policy gradient, DQN, genetic algorithm |
| smoothing | moving average (simple, linear weighted, triangular), exponential average, moving median, cumulative moving average, kalman filter, particle filter |
| timeseries prediction | holt winters, AR, ARMA, SDAR, kalman filter, MLP |
| change point detection | cumulative sum, k nearest neighbor, LOF, SST, uLSIF, HMM, markov switching |

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
