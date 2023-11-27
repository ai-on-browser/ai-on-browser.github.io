// This file is generated automatically.
import Matrix from './util/matrix.js'
import Tensor from './util/tensor.js'
import Graph from './util/graph.js'
import Complex from './util/complex.js'

import A2CAgent from './model/a2c.js'
import ABOD, { LBABOD } from './model/abod.js'
import ADALINE from './model/adaline.js'
import ADAMENN from './model/adamenn.js'
import AdaptiveThresholding from './model/adaptive_thresholding.js'
import AffinityPropagation from './model/affinity_propagation.js'
import { CentroidAgglomerativeClustering, CompleteLinkageAgglomerativeClustering, GroupAverageAgglomerativeClustering, MedianAgglomerativeClustering, SingleLinkageAgglomerativeClustering, WardsAgglomerativeClustering, WeightedAverageAgglomerativeClustering } from './model/agglomerative.js'
import AkimaInterpolation from './model/akima.js'
import ALMA from './model/alma.js'
import AODE from './model/aode.js'
import AR from './model/ar.js'
import ARMA from './model/arma.js'
import AROW from './model/arow.js'
import ART from './model/art.js'
import AssociationAnalysis from './model/association_analysis.js'
import Autoencoder from './model/autoencoder.js'
import AutomaticThresholding from './model/automatic_thresholding.js'
import AverageShiftedHistogram from './model/average_shifted_histogram.js'
import BalancedHistogramThresholding from './model/balanced_histogram.js'
import Ballseptron from './model/ballseptron.js'
import Banditron from './model/banditron.js'
import BayesianLinearRegression from './model/bayesian_linear.js'
import BayesianNetwork from './model/bayesian_network.js'
import BernsenThresholding from './model/bernsen.js'
import BesselFilter from './model/bessel.js'
import BilinearInterpolation from './model/bilinear_interpolation.js'
import BIRCH from './model/birch.js'
import BOGD from './model/bogd.js'
import BoxCox from './model/box_cox.js'
import BPA from './model/bpa.js'
import BrahmaguptaInterpolation from './model/brahmagupta_interpolation.js'
import BSGD, { MulticlassBSGD } from './model/bsgd.js'
import BudgetPerceptron from './model/budget_perceptron.js'
import ButterworthFilter from './model/butterworth.js'
import C2P from './model/c2p.js'
import Canny from './model/canny.js'
import CAST from './model/cast.js'
import CategoricalNaiveBayes from './model/categorical_naive_bayes.js'
import { CatmullRomSplines, CentripetalCatmullRomSplines } from './model/catmull_rom.js'
import CHAMELEON from './model/chameleon.js'
import ChangeFinder from './model/change_finder.js'
import ChebyshevFilter from './model/chebyshev.js'
import CLARA from './model/clara.js'
import CLARANS from './model/clarans.js'
import CLIQUE from './model/clique.js'
import CLUES from './model/clues.js'
import CoTraining from './model/co_training.js'
import COF from './model/cof.js'
import COLL from './model/coll.js'
import ComplementNaiveBayes from './model/complement_naive_bayes.js'
import { ConfidenceWeighted, SoftConfidenceWeighted } from './model/confidence_weighted.js'
import CosineInterpolation from './model/cosine_interpolation.js'
import CRF from './model/crf.js'
import CubicConvolutionInterpolation from './model/cubic_convolution.js'
import CubicHermiteSpline from './model/cubic_hermite_spline.js'
import CubicInterpolation from './model/cubic_interpolation.js'
import CumulativeMovingAverage from './model/cumulative_moving_average.js'
import CumSum from './model/cumulative_sum.js'
import CURE from './model/cure.js'
import DiscriminantAdaptiveNearestNeighbor from './model/dann.js'
import DBCLASD from './model/dbclasd.js'
import DBSCAN from './model/dbscan.js'
import { DecisionTreeClassifier, DecisionTreeRegression } from './model/decision_tree.js'
import DelaunayInterpolation from './model/delaunay_interpolation.js'
import DemingRegression from './model/deming.js'
import DENCLUE from './model/denclue.js'
import DIANA from './model/diana.js'
import DiffusionMap from './model/diffusion_map.js'
import DQNAgent from './model/dqn.js'
import DPAgent from './model/dynamic_programming.js'
import ElasticNet from './model/elastic_net.js'
import EllipticFilter from './model/elliptic_filter.js'
import ENaN from './model/enan.js'
import ENN from './model/enn.js'
import EnsembleBinaryModel from './model/ensemble_binary.js'
import { ExponentialMovingAverage, ModifiedMovingAverage } from './model/exponential_average.js'
import { ExtraTreesClassifier, ExtraTreesRegressor } from './model/extra_trees.js'
import FastMap from './model/fastmap.js'
import FINDIT from './model/findit.js'
import Forgetron from './model/forgetron.js'
import FuzzyCMeans from './model/fuzzy_cmeans.js'
import FuzzyKNN from './model/fuzzy_knearestneighbor.js'
import GAN from './model/gan.js'
import GasserMuller from './model/gasser_muller.js'
import GaussianProcess from './model/gaussian_process.js'
import { GBDT, GBDTClassifier } from './model/gbdt.js'
import GeneralizedESD from './model/generalized_esd.js'
import GeneticAlgorithmGeneration from './model/genetic_algorithm.js'
import GeneticKMeans from './model/genetic_kmeans.js'
import GMeans from './model/gmeans.js'
import { GMM, GMR, SemiSupervisedGMM } from './model/gmm.js'
import GPLVM from './model/gplvm.js'
import GrowingCellStructures from './model/growing_cell_structures.js'
import GrowingNeuralGas from './model/growing_neural_gas.js'
import GSOM from './model/growing_som.js'
import GTM from './model/gtm.js'
import HampelFilter from './model/hampel.js'
import HDBSCAN from './model/hdbscan.js'
import Histogram from './model/histogram.js'
import HLLE from './model/hlle.js'
import { ContinuousHMM, HMM } from './model/hmm.js'
import HoltWinters from './model/holt_winters.js'
import HopfieldNetwork from './model/hopfield.js'
import Hotelling from './model/hotelling.js'
import HuberRegression from './model/huber_regression.js'
import ICA from './model/ica.js'
import { CELLIP, IELLIP } from './model/iellip.js'
import IKNN from './model/iknn.js'
import IncrementalPCA from './model/incremental_pca.js'
import INFLO from './model/inflo.js'
import InverseDistanceWeighting from './model/inverse_distance_weighting.js'
import InverseSmoothstepInterpolation from './model/inverse_smoothstep.js'
import ISODATA from './model/isodata.js'
import IsolationForest from './model/isolation_forest.js'
import Isomap from './model/isomap.js'
import IsotonicRegression from './model/isotonic.js'
import KalmanFilter from './model/kalman_filter.js'
import KDEOS from './model/kdeos.js'
import KernelDensityEstimator from './model/kernel_density_estimator.js'
import KernelKMeans from './model/kernel_kmeans.js'
import KernelizedPegasos from './model/kernelized_pegasos.js'
import KernelizedPerceptron from './model/kernelized_perceptron.js'
import KLIEP from './model/kliep.js'
import { KMeans, KMeanspp, KMedians, KMedoids, SemiSupervisedKMeansModel } from './model/kmeans.js'
import KModes from './model/kmodes.js'
import { KNN, KNNAnomaly, KNNDensityEstimation, KNNRegression, SemiSupervisedKNN } from './model/knearestneighbor.js'
import KPrototypes from './model/kprototypes.js'
import KSVD from './model/ksvd.js'
import KolmogorovZurbenkoFilter from './model/kz.js'
import LabelPropagation from './model/label_propagation.js'
import LabelSpreading from './model/label_spreading.js'
import LadderNetwork from './model/ladder_network.js'
import LagrangeInterpolation from './model/lagrange.js'
import LanczosInterpolation from './model/lanczos_interpolation.js'
import Laplacian from './model/laplacian.js'
import LaplacianEigenmaps from './model/laplacian_eigenmaps.js'
import Lasso from './model/lasso.js'
import LatentDirichletAllocation from './model/latent_dirichlet_allocation.js'
import LBG from './model/lbg.js'
import { FishersLinearDiscriminant, LinearDiscriminant, LinearDiscriminantAnalysis, MulticlassLinearDiscriminant } from './model/lda.js'
import LDF from './model/ldf.js'
import LDOF from './model/ldof.js'
import LeastAbsolute from './model/least_absolute.js'
import LeastSquares from './model/least_square.js'
import LinearInterpolation from './model/lerp.js'
import LLE from './model/lle.js'
import LeastMedianSquaresRegression from './model/lmeds.js'
import LMNN from './model/lmnn.js'
import LOCI from './model/loci.js'
import LOESS from './model/loess.js'
import LOF from './model/lof.js'
import LoG from './model/log.js'
import LogarithmicInterpolation from './model/logarithmic_interpolation.js'
import { LogisticRegression, MultinomialLogisticRegression } from './model/logistic.js'
import LoOP from './model/loop.js'
import LOWESS from './model/lowess.js'
import LowpassFilter from './model/lowpass.js'
import LpNormLinearRegression from './model/lpnorm_linear.js'
import LSA from './model/lsa.js'
import { LSDD, LSDDCPD } from './model/lsdd.js'
import LSIF from './model/lsif.js'
import LeastTrimmedSquaresRegression from './model/lts.js'
import LTSA from './model/ltsa.js'
import { LVQClassifier, LVQCluster } from './model/lvq.js'
import MAD from './model/mad.js'
import MADALINE from './model/madaline.js'
import MarginPerceptron from './model/margin_perceptron.js'
import MarkovSwitching from './model/markov_switching.js'
import MaxAbsScaler from './model/maxabs.js'
import MaximumLikelihoodEstimator from './model/maximum_likelihood.js'
import MCD from './model/mcd.js'
import MixtureDiscriminant from './model/mda.js'
import MDS from './model/mds.js'
import MeanShift from './model/mean_shift.js'
import MetropolisHastings from './model/mh.js'
import MinmaxNormalization from './model/minmax.js'
import MIRA from './model/mira.js'
import MLLE from './model/mlle.js'
import { MLPClassifier, MLPRegressor } from './model/mlp.js'
import MOD from './model/mod.js'
import MONA from './model/mona.js'
import MonotheticClustering from './model/monothetic.js'
import MCAgent from './model/monte_carlo.js'
import Mountain from './model/mountain.js'
import { LinearWeightedMovingAverage, SimpleMovingAverage, TriangularMovingAverage } from './model/moving_average.js'
import MovingMedian from './model/moving_median.js'
import MT from './model/mt.js'
import MutualInformationFeatureSelection from './model/mutual_information.js'
import MutualKNN from './model/mutual_knn.js'
import NCubicInterpolation from './model/n_cubic_interpolation.js'
import NLinearInterpolation from './model/n_linear_interpolation.js'
import NadarayaWatson from './model/nadaraya_watson.js'
import NaiveBayes from './model/naive_bayes.js'
import NaiveBayesRegression from './model/naive_bayes_regression.js'
import NAROW from './model/narow.js'
import NaturalNeighborInterpolation from './model/natural_neighbor_interpolation.js'
import NeighbourhoodComponentsAnalysis from './model/nca.js'
import NearestCentroid from './model/nearest_centroid.js'
import NegationNaiveBayes from './model/negation_naive_bayes.js'
import NeuralGas from './model/neural_gas.js'
import NeuralNetwork, { ComputationalGraph, Layer, NeuralnetworkException } from './model/neuralnetwork.js'
import NiblackThresholding from './model/niblack.js'
import NICE from './model/nice.js'
import NLMeans from './model/nlmeans.js'
import NMF from './model/nmf.js'
import NNBCA from './model/nnbca.js'
import NormalHERD from './model/normal_herd.js'
import OCSVM from './model/ocsvm.js'
import ODIN from './model/odin.js'
import OnlineGradientDescent from './model/ogd.js'
import OPTICS from './model/optics.js'
import ORCLUS from './model/orclus.js'
import OrdinalRegression from './model/ordinal_regression.js'
import OtsusThresholding from './model/otsu.js'
import PAM from './model/pam.js'
import ParticleFilter from './model/particle_filter.js'
import PassingBablok from './model/passing_bablok.js'
import PA from './model/passive_aggressive.js'
import PAUM from './model/paum.js'
import { AnomalyPCA, DualPCA, KernelPCA, PCA } from './model/pca.js'
import PossibilisticCMeans from './model/pcm.js'
import PCR from './model/pcr.js'
import Pegasos from './model/pegasos.js'
import PercentileAnormaly from './model/percentile.js'
import { AveragedPerceptron, MulticlassPerceptron, Perceptron } from './model/perceptron.js'
import PhansalkarThresholding from './model/phansalkar.js'
import PLS from './model/pls.js'
import PLSA from './model/plsa.js'
import PoissonRegression from './model/poisson.js'
import PGAgent from './model/policy_gradient.js'
import PolynomialHistogram from './model/polynomial_histogram.js'
import PolynomialInterpolation from './model/polynomial_interpolation.js'
import ProjectionPursuit from './model/ppr.js'
import Prewitt from './model/prewitt.js'
import PriestleyChao from './model/priestley_chao.js'
import PrincipalCurve from './model/principal_curve.js'
import ProbabilisticPCA from './model/probabilistic_pca.js'
import ProbabilityBasedClassifier from './model/probability_based_classifier.js'
import { MultinomialProbit, Probit } from './model/probit.js'
import PROCLUS from './model/proclus.js'
import { Projectron, Projectronpp } from './model/projectron.js'
import PTile from './model/ptile.js'
import QAgent, { QTableBase } from './model/q_learning.js'
import QuadraticDiscriminant from './model/quadratic_discriminant.js'
import QuantileRegression from './model/quantile_regression.js'
import { RadiusNeighbor, RadiusNeighborRegression, SemiSupervisedRadiusNeighbor } from './model/radius_neighbor.js'
import RamerDouglasPeucker from './model/ramer_douglas_peucker.js'
import { RandomForestClassifier, RandomForestRegressor } from './model/random_forest.js'
import RandomProjection from './model/random_projection.js'
import RANSAC from './model/ransac.js'
import RadialBasisFunctionNetwork from './model/rbf.js'
import { GBRBM, RBM } from './model/rbm.js'
import RBP from './model/rbp.js'
import RDF from './model/rdf.js'
import RDOS from './model/rdos.js'
import { KernelRidge, MulticlassRidge, Ridge } from './model/ridge.js'
import RKOF from './model/rkof.js'
import RecursiveLeastSquares from './model/rls.js'
import RepeatedMedianRegression from './model/rmr.js'
import RNN from './model/rnn.js'
import RobertsCross from './model/roberts.js'
import RobustScaler from './model/robust_scaler.js'
import ROCK from './model/rock.js'
import { AggressiveROMMA, ROMMA } from './model/romma.js'
import RVM from './model/rvm.js'
import S3VM from './model/s3vm.js'
import Sammon from './model/sammon.js'
import SARSAAgent from './model/sarsa.js'
import SauvolaThresholding from './model/sauvola.js'
import SavitzkyGolayFilter from './model/savitzky_golay.js'
import SDAR from './model/sdar.js'
import SegmentedRegression from './model/segmented.js'
import SelectiveNaiveBayes from './model/selective_naive_bayes.js'
import { SelectiveSamplingAdaptivePerceptron, SelectiveSamplingPerceptron } from './model/selective_sampling_perceptron.js'
import SelectiveSamplingSOP from './model/selective_sampling_sop.js'
import SelectiveSamplingWinnow from './model/selective_sampling_winnow.js'
import SelfTraining from './model/self_training.js'
import SemiSupervisedNaiveBayes from './model/semi_supervised_naive_bayes.js'
import SezanThresholding from './model/sezan.js'
import ShiftingPerceptron from './model/shifting_perceptron.js'
import { ILK, SILK } from './model/silk.js'
import SincInterpolation from './model/sinc_interpolation.js'
import SlicedInverseRegression from './model/sir.js'
import Slerp from './model/slerp.js'
import SliceSampling from './model/slice_sampling.js'
import SMARegression from './model/sma.js'
import SmirnovGrubbs from './model/smirnov_grubbs.js'
import SmoothstepInterpolation from './model/smoothstep.js'
import Snakes from './model/snakes.js'
import Sobel from './model/sobel.js'
import SoftKMeans from './model/soft_kmeans.js'
import SOM from './model/som.js'
import SecondOrderPerceptron from './model/sop.js'
import SpectralClustering from './model/spectral.js'
import SmoothingSpline from './model/spline.js'
import SplineInterpolation from './model/spline_interpolation.js'
import SplitAndMerge from './model/split_merge.js'
import SquaredLossMICPD from './model/squared_loss_mi.js'
import SST from './model/sst.js'
import Standardization from './model/standardization.js'
import StatisticalRegionMerging from './model/statistical_region_merging.js'
import STING from './model/sting.js'
import Stoptron from './model/stoptron.js'
import SVC from './model/svc.js'
import SVM from './model/svm.js'
import SVR from './model/svr.js'
import TheilSenRegression from './model/theil_sen.js'
import Thompson from './model/thompson.js'
import TietjenMoore from './model/tietjen_moore.js'
import TighterPerceptron from './model/tighter_perceptron.js'
import TightestPerceptron from './model/tightest_perceptron.js'
import TrigonometricInterpolation from './model/trigonometric_interpolation.js'
import { SNE, tSNE } from './model/tsne.js'
import TukeyRegression from './model/tukey_regression.js'
import TukeysFences from './model/tukeys_fences.js'
import { RuLSIF, uLSIF } from './model/ulsif.js'
import UMAP from './model/umap.js'
import UniversalSetNaiveBayes from './model/universal_set_naive_bayes.js'
import VAE from './model/vae.js'
import VAR from './model/var.js'
import VBGMM from './model/vbgmm.js'
import VotedPerceptron from './model/voted_perceptron.js'
import WeightedKMeans from './model/weighted_kmeans.js'
import WeightedKNN from './model/weighted_knn.js'
import WeightedLeastSquares from './model/weighted_least_squares.js'
import Winnow from './model/winnow.js'
import Word2Vec from './model/word_to_vec.js'
import { XGBoost, XGBoostClassifier } from './model/xgboost.js'
import XMeans from './model/xmeans.js'
import YeoJohnson from './model/yeo_johnson.js'
import ZeroInflatedPoisson from './model/zip.js'
import ZeroTruncatedPoisson from './model/ztp.js'
import AcrobotRLEnvironment from './rl/acrobot.js'
import EmptyRLEnvironment, { RLEnvironmentBase, RLIntRange, RLRealRange } from './rl/base.js'
import BlackjackRLEnvironment from './rl/blackjack.js'
import BreakerRLEnvironment from './rl/breaker.js'
import CartPoleRLEnvironment from './rl/cartpole.js'
import DraughtsRLEnvironment from './rl/draughts.js'
import GomokuRLEnvironment from './rl/gomoku.js'
import GridMazeRLEnvironment from './rl/grid.js'
import InHypercubeRLEnvironment from './rl/inhypercube.js'
import SmoothMazeRLEnvironment from './rl/maze.js'
import MountainCarRLEnvironment from './rl/mountaincar.js'
import PendulumRLEnvironment from './rl/pendulum.js'
import ReversiRLEnvironment from './rl/reversi.js'
import WaterballRLEnvironment from './rl/waterball.js'
import { accuracy, cohensKappa, fScore, precision, recall } from './evaluate/classification.js'
import { davisBouldinIndex, diceIndex, dunnIndex, fowlkesMallowsIndex, jaccardIndex, purity, randIndex, silhouetteCoefficient } from './evaluate/clustering.js'
import { coRankingMatrix } from './evaluate/dimensionality_reduction.js'
import { correlation, mad, mae, mape, mse, msle, r2, rmse, rmsle, rmspe } from './evaluate/regression.js'

/**
 * Default export object.
 *
 * @module default
 * @property {Tensor} Tensor Tensor class
 * @property {Matrix} Matrix Matrix class
 * @property {Graph} Graph Graph class
 * @property {Complex} Complex Complex number
 */
export default {
	Tensor,
	Matrix,
	Graph,
	Complex,
	/**
	 * @memberof default
	 * @property {A2CAgent} A2CAgent A2C agent
	 * @property {LBABOD} LBABOD Lower-bound for the Angle-based Outlier Detection
	 * @property {ABOD} ABOD Angle-based Outlier Detection
	 * @property {ADALINE} ADALINE Adaptive Linear Neuron model
	 * @property {ADAMENN} ADAMENN Adaptive Metric Nearest Neighbor
	 * @property {AdaptiveThresholding} AdaptiveThresholding Adaptive thresholding
	 * @property {AffinityPropagation} AffinityPropagation Affinity propagation model
	 * @property {CentroidAgglomerativeClustering} CentroidAgglomerativeClustering Centroid agglomerative clustering
	 * @property {CompleteLinkageAgglomerativeClustering} CompleteLinkageAgglomerativeClustering Complete linkage agglomerative clustering
	 * @property {GroupAverageAgglomerativeClustering} GroupAverageAgglomerativeClustering Group average agglomerative clustering
	 * @property {MedianAgglomerativeClustering} MedianAgglomerativeClustering Median agglomerative clustering
	 * @property {SingleLinkageAgglomerativeClustering} SingleLinkageAgglomerativeClustering Single linkage agglomerative clustering
	 * @property {WardsAgglomerativeClustering} WardsAgglomerativeClustering Ward's agglomerative clustering
	 * @property {WeightedAverageAgglomerativeClustering} WeightedAverageAgglomerativeClustering Weighted average agglomerative clustering
	 * @property {AkimaInterpolation} AkimaInterpolation Akima interpolation
	 * @property {ALMA} ALMA Approximate Large Margin algorithm
	 * @property {AODE} AODE Averaged One-Dependence Estimators
	 * @property {AR} AR Autoregressive model
	 * @property {ARMA} ARMA Autoregressive moving average model
	 * @property {AROW} AROW Adaptive regularization of Weight Vectors
	 * @property {ART} ART Adaptive resonance theory
	 * @property {AssociationAnalysis} AssociationAnalysis Association analysis
	 * @property {Autoencoder} Autoencoder Autoencoder
	 * @property {AutomaticThresholding} AutomaticThresholding Automatic thresholding
	 * @property {AverageShiftedHistogram} AverageShiftedHistogram Average shifted histogram
	 * @property {BalancedHistogramThresholding} BalancedHistogramThresholding Balanced histogram thresholding
	 * @property {Ballseptron} Ballseptron Ballseptron
	 * @property {Banditron} Banditron Banditron
	 * @property {BayesianLinearRegression} BayesianLinearRegression Bayesian linear regression
	 * @property {BayesianNetwork} BayesianNetwork Bayesian Network
	 * @property {BernsenThresholding} BernsenThresholding Bernsen thresholding
	 * @property {BesselFilter} BesselFilter Bessel filter
	 * @property {BilinearInterpolation} BilinearInterpolation Bilinear interpolation
	 * @property {BIRCH} BIRCH Balanced iterative reducing and clustering using hierarchies
	 * @property {BOGD} BOGD Bounded Online Gradient Descent
	 * @property {BoxCox} BoxCox Box-Cox transformation
	 * @property {BPA} BPA Budgeted online Passive-Aggressive
	 * @property {BrahmaguptaInterpolation} BrahmaguptaInterpolation Brahmagupta interpolation
	 * @property {MulticlassBSGD} MulticlassBSGD
	 * @property {BSGD} BSGD Budgeted Stochastic Gradient Descent
	 * @property {BudgetPerceptron} BudgetPerceptron Budget Perceptron
	 * @property {ButterworthFilter} ButterworthFilter Butterworth filter
	 * @property {C2P} C2P Clustering based on Closest Pairs
	 * @property {Canny} Canny Canny edge detection
	 * @property {CAST} CAST Clustering Affinity Search Technique
	 * @property {CategoricalNaiveBayes} CategoricalNaiveBayes Categorical naive bayes
	 * @property {CatmullRomSplines} CatmullRomSplines Catmull-Rom splines interpolation
	 * @property {CentripetalCatmullRomSplines} CentripetalCatmullRomSplines Centripetal Catmull-Rom splines interpolation
	 * @property {CHAMELEON} CHAMELEON CHAMELEON
	 * @property {ChangeFinder} ChangeFinder Change finder
	 * @property {ChebyshevFilter} ChebyshevFilter Chebyshev filter
	 * @property {CLARA} CLARA Clustering LARge Applications
	 * @property {CLARANS} CLARANS Clustering Large Applications based on RANdomized Search
	 * @property {CLIQUE} CLIQUE CLustering In QUEst
	 * @property {CLUES} CLUES CLUstEring based on local Shrinking
	 * @property {CoTraining} CoTraining Co-training
	 * @property {COF} COF Connectivity-based Outlier Factor
	 * @property {COLL} COLL Conscience on-line learning
	 * @property {ComplementNaiveBayes} ComplementNaiveBayes Complement Naive Bayes
	 * @property {ConfidenceWeighted} ConfidenceWeighted Confidence weighted
	 * @property {SoftConfidenceWeighted} SoftConfidenceWeighted Soft confidence weighted
	 * @property {CosineInterpolation} CosineInterpolation Cosine interpolation
	 * @property {CRF} CRF Conditional random fields
	 * @property {CubicConvolutionInterpolation} CubicConvolutionInterpolation Cubic-convolution interpolation
	 * @property {CubicHermiteSpline} CubicHermiteSpline Cubic Hermite spline
	 * @property {CubicInterpolation} CubicInterpolation Cubic interpolation
	 * @property {CumulativeMovingAverage} CumulativeMovingAverage Cumulative moving average
	 * @property {CumSum} CumSum Cumulative sum change point detection
	 * @property {CURE} CURE Clustering Using REpresentatives
	 * @property {DiscriminantAdaptiveNearestNeighbor} DiscriminantAdaptiveNearestNeighbor Discriminant adaptive nearest neighbor
	 * @property {DBCLASD} DBCLASD Distribution Based Clustering of LArge Spatial Databases
	 * @property {DBSCAN} DBSCAN Density-based spatial clustering of applications with noise
	 * @property {DecisionTreeClassifier} DecisionTreeClassifier Decision tree classifier
	 * @property {DecisionTreeRegression} DecisionTreeRegression Decision tree regression
	 * @property {DelaunayInterpolation} DelaunayInterpolation Delaunay interpolation
	 * @property {DemingRegression} DemingRegression Deming regression
	 * @property {DENCLUE} DENCLUE DENsity CLUstering
	 * @property {DIANA} DIANA DIvisive ANAlysis Clustering
	 * @property {DiffusionMap} DiffusionMap Diffusion map
	 * @property {DQNAgent} DQNAgent Deep Q-Network agent
	 * @property {DPAgent} DPAgent Dynamic programming agent
	 * @property {ElasticNet} ElasticNet Elastic net
	 * @property {EllipticFilter} EllipticFilter Elliptic filter
	 * @property {ENaN} ENaN Extended Natural Neighbor
	 * @property {ENN} ENN Extended Nearest Neighbor
	 * @property {EnsembleBinaryModel} EnsembleBinaryModel Ensemble binary models
	 * @property {ExponentialMovingAverage} ExponentialMovingAverage Exponential moving average
	 * @property {ModifiedMovingAverage} ModifiedMovingAverage Modified moving average
	 * @property {ExtraTreesClassifier} ExtraTreesClassifier Extra trees classifier
	 * @property {ExtraTreesRegressor} ExtraTreesRegressor Extra trees regressor
	 * @property {FastMap} FastMap FastMap
	 * @property {FINDIT} FINDIT a Fast and INtelligent subspace clustering algorithm using DImension voting
	 * @property {Forgetron} Forgetron Forgetron
	 * @property {FuzzyCMeans} FuzzyCMeans Fuzzy c-means
	 * @property {FuzzyKNN} FuzzyKNN Fuzzy k-nearest neighbor
	 * @property {GAN} GAN Generative adversarial networks
	 * @property {GasserMuller} GasserMuller Gasser–Müller kernel estimator
	 * @property {GaussianProcess} GaussianProcess Gaussian process
	 * @property {GBDT} GBDT Gradient boosting decision tree
	 * @property {GBDTClassifier} GBDTClassifier Gradient boosting decision tree classifier
	 * @property {GeneralizedESD} GeneralizedESD Generalized extreme studentized deviate
	 * @property {GeneticAlgorithmGeneration} GeneticAlgorithmGeneration Genetic algorithm generation
	 * @property {GeneticKMeans} GeneticKMeans Genetic k-means model
	 * @property {GMeans} GMeans G-means
	 * @property {GMM} GMM Gaussian mixture model
	 * @property {GMR} GMR Gaussian mixture regression
	 * @property {SemiSupervisedGMM} SemiSupervisedGMM Semi-Supervised gaussian mixture model
	 * @property {GPLVM} GPLVM Gaussian Process Latent Variable Model
	 * @property {GrowingCellStructures} GrowingCellStructures Growing cell structures
	 * @property {GrowingNeuralGas} GrowingNeuralGas Growing neural gas
	 * @property {GSOM} GSOM Growing Self-Organizing Map
	 * @property {GTM} GTM Generative topographic mapping
	 * @property {HampelFilter} HampelFilter Hampel filter
	 * @property {HDBSCAN} HDBSCAN Hierarchical Density-based spatial clustering of applications with noise
	 * @property {Histogram} Histogram Histogram
	 * @property {HLLE} HLLE Hessian Locally Linear Embedding
	 * @property {ContinuousHMM} ContinuousHMM Continuous hidden Markov model
	 * @property {HMM} HMM Hidden Markov model
	 * @property {HoltWinters} HoltWinters Holt-Winters method
	 * @property {HopfieldNetwork} HopfieldNetwork Hopfield network
	 * @property {Hotelling} Hotelling Hotelling T-square Method
	 * @property {HuberRegression} HuberRegression Huber regression
	 * @property {ICA} ICA Independent component analysis
	 * @property {CELLIP} CELLIP Classical ellipsoid method
	 * @property {IELLIP} IELLIP Improved ellipsoid method
	 * @property {IKNN} IKNN Locally Informative K-Nearest Neighbor
	 * @property {IncrementalPCA} IncrementalPCA Incremental principal component analysis
	 * @property {INFLO} INFLO Influenced Outlierness
	 * @property {InverseDistanceWeighting} InverseDistanceWeighting Inverse distance weighting
	 * @property {InverseSmoothstepInterpolation} InverseSmoothstepInterpolation Inverse smoothstep interpolation
	 * @property {ISODATA} ISODATA Iterative Self-Organizing Data Analysis Technique
	 * @property {IsolationForest} IsolationForest Isolation forest
	 * @property {Isomap} Isomap Isomap
	 * @property {IsotonicRegression} IsotonicRegression Isotonic regression
	 * @property {KalmanFilter} KalmanFilter Kalman filter
	 * @property {KDEOS} KDEOS Kernel Density Estimation Outlier Score
	 * @property {KernelDensityEstimator} KernelDensityEstimator Kernel density estimator
	 * @property {KernelKMeans} KernelKMeans Kernel k-means
	 * @property {KernelizedPegasos} KernelizedPegasos Kernelized Primal Estimated sub-GrAdientSOlver for SVM
	 * @property {KernelizedPerceptron} KernelizedPerceptron Kernelized perceptron
	 * @property {KLIEP} KLIEP Kullback-Leibler importance estimation procedure
	 * @property {KMeans} KMeans k-means model
	 * @property {KMeanspp} KMeanspp k-means++ model
	 * @property {KMedians} KMedians k-medians model
	 * @property {KMedoids} KMedoids k-medoids model
	 * @property {SemiSupervisedKMeansModel} SemiSupervisedKMeansModel semi-supervised k-means model
	 * @property {KModes} KModes k-modes model
	 * @property {KNN} KNN k-nearest neighbor
	 * @property {KNNAnomaly} KNNAnomaly k-nearest neighbor anomaly detection
	 * @property {KNNDensityEstimation} KNNDensityEstimation k-nearest neighbor density estimation
	 * @property {KNNRegression} KNNRegression k-nearest neighbor regression
	 * @property {SemiSupervisedKNN} SemiSupervisedKNN Semi-supervised k-nearest neighbor
	 * @property {KPrototypes} KPrototypes k-prototypes model
	 * @property {KSVD} KSVD k-SVD
	 * @property {KolmogorovZurbenkoFilter} KolmogorovZurbenkoFilter Kolmogorov–Zurbenko filter
	 * @property {LabelPropagation} LabelPropagation Label propagation
	 * @property {LabelSpreading} LabelSpreading Label spreading
	 * @property {LadderNetwork} LadderNetwork Ladder network
	 * @property {LagrangeInterpolation} LagrangeInterpolation Lagrange interpolation
	 * @property {LanczosInterpolation} LanczosInterpolation Lanczos interpolation
	 * @property {Laplacian} Laplacian Laplacian edge detection
	 * @property {LaplacianEigenmaps} LaplacianEigenmaps Laplacian eigenmaps
	 * @property {Lasso} Lasso Least absolute shrinkage and selection operator
	 * @property {LatentDirichletAllocation} LatentDirichletAllocation Latent dirichlet allocation
	 * @property {LBG} LBG Linde-Buzo-Gray algorithm
	 * @property {FishersLinearDiscriminant} FishersLinearDiscriminant Fishers linear discriminant analysis
	 * @property {LinearDiscriminant} LinearDiscriminant Linear discriminant analysis
	 * @property {LinearDiscriminantAnalysis} LinearDiscriminantAnalysis Linear discriminant analysis
	 * @property {MulticlassLinearDiscriminant} MulticlassLinearDiscriminant Multiclass linear discriminant analysis
	 * @property {LDF} LDF Local Density Factor
	 * @property {LDOF} LDOF Local Distance-based Outlier Factor
	 * @property {LeastAbsolute} LeastAbsolute Least absolute deviations
	 * @property {LeastSquares} LeastSquares Least squares
	 * @property {LinearInterpolation} LinearInterpolation Linear interpolation
	 * @property {LLE} LLE Locally Linear Embedding
	 * @property {LeastMedianSquaresRegression} LeastMedianSquaresRegression Least median squares regression
	 * @property {LMNN} LMNN Large Margin Nearest Neighbor
	 * @property {LOCI} LOCI Local Correlation Integral
	 * @property {LOESS} LOESS Locally estimated scatterplot smoothing
	 * @property {LOF} LOF Local Outlier Factor
	 * @property {LoG} LoG Laplacian of gaussian filter
	 * @property {LogarithmicInterpolation} LogarithmicInterpolation Logarithmic interpolation
	 * @property {LogisticRegression} LogisticRegression Logistic regression
	 * @property {MultinomialLogisticRegression} MultinomialLogisticRegression Multinomial logistic regression
	 * @property {LoOP} LoOP Local Outlier Probability
	 * @property {LOWESS} LOWESS Locally weighted scatter plot smooth
	 * @property {LowpassFilter} LowpassFilter Lowpass filter
	 * @property {LpNormLinearRegression} LpNormLinearRegression Lp norm linear regression
	 * @property {LSA} LSA Latent Semantic Analysis
	 * @property {LSDD} LSDD Least-squares density difference
	 * @property {LSDDCPD} LSDDCPD LSDD for change point detection
	 * @property {LSIF} LSIF least-squares importance fitting
	 * @property {LeastTrimmedSquaresRegression} LeastTrimmedSquaresRegression Least trimmed squares
	 * @property {LTSA} LTSA Local Tangent Space Alignment
	 * @property {LVQClassifier} LVQClassifier Learning Vector Quantization classifier
	 * @property {LVQCluster} LVQCluster Learning Vector Quantization clustering
	 * @property {MAD} MAD Median Absolute Deviation
	 * @property {MADALINE} MADALINE Many Adaptive Linear Neuron model
	 * @property {MarginPerceptron} MarginPerceptron Margin Perceptron
	 * @property {MarkovSwitching} MarkovSwitching Markov switching
	 * @property {MaxAbsScaler} MaxAbsScaler Max absolute scaler
	 * @property {MaximumLikelihoodEstimator} MaximumLikelihoodEstimator Maximum likelihood estimator
	 * @property {MCD} MCD Minimum Covariance Determinant
	 * @property {MixtureDiscriminant} MixtureDiscriminant Mixture discriminant analysis
	 * @property {MDS} MDS Multi-dimensional Scaling
	 * @property {MeanShift} MeanShift Mean shift
	 * @property {MetropolisHastings} MetropolisHastings Metropolis-Hastings algorithm
	 * @property {MinmaxNormalization} MinmaxNormalization Min-max normalization
	 * @property {MIRA} MIRA Margin Infused Relaxed Algorithm
	 * @property {MLLE} MLLE Modified Locally Linear Embedding
	 * @property {MLPClassifier} MLPClassifier Multi layer perceptron classifier
	 * @property {MLPRegressor} MLPRegressor Multi layer perceptron regressor
	 * @property {MOD} MOD Method of Optimal Direction
	 * @property {MONA} MONA MONothetic Analysis Clustering
	 * @property {MonotheticClustering} MonotheticClustering Monothetic Clustering
	 * @property {MCAgent} MCAgent Monte Carlo agent
	 * @property {Mountain} Mountain Mountain method
	 * @property {LinearWeightedMovingAverage} LinearWeightedMovingAverage Linear weighted moving average
	 * @property {SimpleMovingAverage} SimpleMovingAverage Simple moving average
	 * @property {TriangularMovingAverage} TriangularMovingAverage Triangular moving average
	 * @property {MovingMedian} MovingMedian Moving median
	 * @property {MT} MT Mahalanobis Taguchi method
	 * @property {MutualInformationFeatureSelection} MutualInformationFeatureSelection Mutual information feature selector
	 * @property {MutualKNN} MutualKNN Mutual k-nearest-neighbor model
	 * @property {NCubicInterpolation} NCubicInterpolation n-cubic interpolation
	 * @property {NLinearInterpolation} NLinearInterpolation n-linear interpolation
	 * @property {NadarayaWatson} NadarayaWatson Nadaraya–Watson kernel regression
	 * @property {NaiveBayes} NaiveBayes Naive bayes
	 * @property {NaiveBayesRegression} NaiveBayesRegression Naive bayes regression
	 * @property {NAROW} NAROW Narrow Adaptive Regularization Of Weights
	 * @property {NaturalNeighborInterpolation} NaturalNeighborInterpolation Natural neighbor interpolation
	 * @property {NeighbourhoodComponentsAnalysis} NeighbourhoodComponentsAnalysis Neighbourhood components analysis
	 * @property {NearestCentroid} NearestCentroid Nearest centroid classifier
	 * @property {NegationNaiveBayes} NegationNaiveBayes Negation Naive bayes
	 * @property {NeuralGas} NeuralGas Neural gas model
	 * @property {ComputationalGraph} ComputationalGraph
	 * @property {Layer} Layer
	 * @property {NeuralnetworkException} NeuralnetworkException Exception for neuralnetwork class
	 * @property {NeuralNetwork} NeuralNetwork Neuralnetwork
	 * @property {NiblackThresholding} NiblackThresholding Niblack thresholding
	 * @property {NICE} NICE Flow-based generative model non-linear independent component estimation
	 * @property {NLMeans} NLMeans Non-local means filter
	 * @property {NMF} NMF Non-negative matrix factorization
	 * @property {NNBCA} NNBCA Natural Neighborhood Based Classification Algorithm
	 * @property {NormalHERD} NormalHERD Normal Herd
	 * @property {OCSVM} OCSVM One-class support vector machine
	 * @property {ODIN} ODIN Outlier Detection using Indegree Number
	 * @property {OnlineGradientDescent} OnlineGradientDescent Online gradient descent
	 * @property {OPTICS} OPTICS Ordering points to identify the clustering structure
	 * @property {ORCLUS} ORCLUS arbitrarily ORiented projected CLUSter generation
	 * @property {OrdinalRegression} OrdinalRegression Ordinal regression
	 * @property {OtsusThresholding} OtsusThresholding Otus's thresholding
	 * @property {PAM} PAM Partitioning Around Medoids
	 * @property {ParticleFilter} ParticleFilter Particle filter
	 * @property {PassingBablok} PassingBablok Passing-Bablok method
	 * @property {PA} PA Passive Aggressive
	 * @property {PAUM} PAUM Perceptron Algorithm with Uneven Margins
	 * @property {AnomalyPCA} AnomalyPCA Principal component analysis for anomaly detection
	 * @property {DualPCA} DualPCA Dual Principal component analysis
	 * @property {KernelPCA} KernelPCA Kernel Principal component analysis
	 * @property {PCA} PCA Principal component analysis
	 * @property {PossibilisticCMeans} PossibilisticCMeans Possibilistic c-means
	 * @property {PCR} PCR Principal component regression
	 * @property {Pegasos} Pegasos Primal Estimated sub-GrAdientSOlver for SVM
	 * @property {PercentileAnormaly} PercentileAnormaly Percentile anomaly detection
	 * @property {AveragedPerceptron} AveragedPerceptron Averaged perceptron
	 * @property {MulticlassPerceptron} MulticlassPerceptron Multiclass perceptron
	 * @property {Perceptron} Perceptron Perceptron
	 * @property {PhansalkarThresholding} PhansalkarThresholding Phansalkar thresholding
	 * @property {PLS} PLS Partial least squares regression
	 * @property {PLSA} PLSA Probabilistic latent semantic analysis
	 * @property {PoissonRegression} PoissonRegression Poisson regression
	 * @property {PGAgent} PGAgent Policy gradient agent
	 * @property {PolynomialHistogram} PolynomialHistogram Polynomial histogram
	 * @property {PolynomialInterpolation} PolynomialInterpolation Polynomial interpolation
	 * @property {ProjectionPursuit} ProjectionPursuit Projection pursuit regression
	 * @property {Prewitt} Prewitt Prewitt edge detection
	 * @property {PriestleyChao} PriestleyChao Priestley–Chao kernel estimator
	 * @property {PrincipalCurve} PrincipalCurve Principal curves
	 * @property {ProbabilisticPCA} ProbabilisticPCA Probabilistic Principal component analysis
	 * @property {ProbabilityBasedClassifier} ProbabilityBasedClassifier Probability based classifier
	 * @property {MultinomialProbit} MultinomialProbit Multinomial probit
	 * @property {Probit} Probit Probit
	 * @property {PROCLUS} PROCLUS PROjected CLUStering algorithm
	 * @property {Projectron} Projectron Projectron
	 * @property {Projectronpp} Projectronpp Projectron++
	 * @property {PTile} PTile P-tile thresholding
	 * @property {QTableBase} QTableBase Base class for Q-table
	 * @property {QAgent} QAgent Q-learning agent
	 * @property {QuadraticDiscriminant} QuadraticDiscriminant Quadratic discriminant analysis
	 * @property {QuantileRegression} QuantileRegression Quantile regression
	 * @property {RadiusNeighbor} RadiusNeighbor radius neighbor
	 * @property {RadiusNeighborRegression} RadiusNeighborRegression radius neighbor regression
	 * @property {SemiSupervisedRadiusNeighbor} SemiSupervisedRadiusNeighbor Semi-supervised radius neighbor
	 * @property {RamerDouglasPeucker} RamerDouglasPeucker Ramer-Douglas-Peucker algorithm
	 * @property {RandomForestClassifier} RandomForestClassifier Random forest classifier
	 * @property {RandomForestRegressor} RandomForestRegressor Random forest regressor
	 * @property {RandomProjection} RandomProjection Random projection
	 * @property {RANSAC} RANSAC Random sample consensus
	 * @property {RadialBasisFunctionNetwork} RadialBasisFunctionNetwork Radial basis function network
	 * @property {GBRBM} GBRBM Gaussian-Bernouili Restricted Boltzmann machine
	 * @property {RBM} RBM Restricted Boltzmann machine
	 * @property {RBP} RBP Randomized Budget Perceptron
	 * @property {RDF} RDF Relative Density Factor
	 * @property {RDOS} RDOS Relative Density-based Outlier Score
	 * @property {KernelRidge} KernelRidge Kernel ridge regression
	 * @property {MulticlassRidge} MulticlassRidge Multiclass ridge regressioin
	 * @property {Ridge} Ridge Ridge regressioin
	 * @property {RKOF} RKOF Robust Kernel-based Outlier Factor
	 * @property {RecursiveLeastSquares} RecursiveLeastSquares Recursive least squares
	 * @property {RepeatedMedianRegression} RepeatedMedianRegression Repeated median regression
	 * @property {RNN} RNN Recurrent neuralnetwork
	 * @property {RobertsCross} RobertsCross Roberts cross
	 * @property {RobustScaler} RobustScaler Robust scaler
	 * @property {ROCK} ROCK RObust Clustering using linKs
	 * @property {AggressiveROMMA} AggressiveROMMA Aggressive Relaxed Online Maximum Margin Algorithm
	 * @property {ROMMA} ROMMA Relaxed Online Maximum Margin Algorithm
	 * @property {RVM} RVM Relevance vector machine
	 * @property {S3VM} S3VM Semi-Supervised Support Vector Machine
	 * @property {Sammon} Sammon Sammon mapping
	 * @property {SARSAAgent} SARSAAgent SARSA agent
	 * @property {SauvolaThresholding} SauvolaThresholding sauvola thresholding
	 * @property {SavitzkyGolayFilter} SavitzkyGolayFilter Savitzky-Golay filter
	 * @property {SDAR} SDAR Sequentially Discounting Autoregressive model
	 * @property {SegmentedRegression} SegmentedRegression Segmented regression
	 * @property {SelectiveNaiveBayes} SelectiveNaiveBayes Selective Naive bayes
	 * @property {SelectiveSamplingAdaptivePerceptron} SelectiveSamplingAdaptivePerceptron Selective sampling Perceptron with adaptive parameter
	 * @property {SelectiveSamplingPerceptron} SelectiveSamplingPerceptron Selective sampling Perceptron
	 * @property {SelectiveSamplingSOP} SelectiveSamplingSOP Selective sampling second-order Perceptron
	 * @property {SelectiveSamplingWinnow} SelectiveSamplingWinnow Selective sampling Winnow
	 * @property {SelfTraining} SelfTraining Self-training
	 * @property {SemiSupervisedNaiveBayes} SemiSupervisedNaiveBayes Semi-supervised naive bayes
	 * @property {SezanThresholding} SezanThresholding Sezan's thresholding
	 * @property {ShiftingPerceptron} ShiftingPerceptron Shifting Perceptron Algorithm
	 * @property {ILK} ILK Implicit online Learning with Kernels
	 * @property {SILK} SILK Sparse Implicit online Learning with Kernels
	 * @property {SincInterpolation} SincInterpolation Sinc interpolation
	 * @property {SlicedInverseRegression} SlicedInverseRegression Sliced inverse regression
	 * @property {Slerp} Slerp Spherical linear interpolation
	 * @property {SliceSampling} SliceSampling slice sampling
	 * @property {SMARegression} SMARegression Standardizes Major Axis regression
	 * @property {SmirnovGrubbs} SmirnovGrubbs SmirnovGrubbs test
	 * @property {SmoothstepInterpolation} SmoothstepInterpolation Smoothstep interpolation
	 * @property {Snakes} Snakes Snakes (active contour model)
	 * @property {Sobel} Sobel Sobel edge detection
	 * @property {SoftKMeans} SoftKMeans Soft k-means
	 * @property {SOM} SOM Self-Organizing Map
	 * @property {SecondOrderPerceptron} SecondOrderPerceptron Second order perceptron
	 * @property {SpectralClustering} SpectralClustering Spectral clustering
	 * @property {SmoothingSpline} SmoothingSpline Spline smoothing
	 * @property {SplineInterpolation} SplineInterpolation Spline interpolation
	 * @property {SplitAndMerge} SplitAndMerge Split and merge segmentation
	 * @property {SquaredLossMICPD} SquaredLossMICPD Squared-loss Mutual information change point detection
	 * @property {SST} SST Singular-spectrum transformation
	 * @property {Standardization} Standardization Standardization
	 * @property {StatisticalRegionMerging} StatisticalRegionMerging Statistical Region Merging
	 * @property {STING} STING STatistical INformation Grid-based method
	 * @property {Stoptron} Stoptron Stoptron
	 * @property {SVC} SVC Support vector clustering
	 * @property {SVM} SVM Support vector machine
	 * @property {SVR} SVR Support vector regression
	 * @property {TheilSenRegression} TheilSenRegression Theil-Sen regression
	 * @property {Thompson} Thompson Thompson test
	 * @property {TietjenMoore} TietjenMoore Tietjen-Moore Test
	 * @property {TighterPerceptron} TighterPerceptron Tighter Budget Perceptron
	 * @property {TightestPerceptron} TightestPerceptron Tightest Perceptron
	 * @property {TrigonometricInterpolation} TrigonometricInterpolation Trigonometric interpolation
	 * @property {SNE} SNE Stochastic Neighbor Embedding
	 * @property {tSNE} tSNE T-distributed Stochastic Neighbor Embedding
	 * @property {TukeyRegression} TukeyRegression Tukey regression
	 * @property {TukeysFences} TukeysFences Tukey's fences
	 * @property {RuLSIF} RuLSIF Relative unconstrained Least-Squares Importance Fitting
	 * @property {uLSIF} uLSIF unconstrained Least-Squares Importance Fitting
	 * @property {UMAP} UMAP Uniform Manifold Approximation and Projection
	 * @property {UniversalSetNaiveBayes} UniversalSetNaiveBayes Universal-set Naive bayes
	 * @property {VAE} VAE Variational Autoencoder
	 * @property {VAR} VAR Vector Autoregressive model
	 * @property {VBGMM} VBGMM Variational Gaussian Mixture Model
	 * @property {VotedPerceptron} VotedPerceptron Voted-perceptron
	 * @property {WeightedKMeans} WeightedKMeans Weighted k-means model
	 * @property {WeightedKNN} WeightedKNN Weighted K-Nearest Neighbor
	 * @property {WeightedLeastSquares} WeightedLeastSquares Weighted least squares
	 * @property {Winnow} Winnow Winnow
	 * @property {Word2Vec} Word2Vec Word2Vec
	 * @property {XGBoost} XGBoost eXtreme Gradient Boosting regression
	 * @property {XGBoostClassifier} XGBoostClassifier eXtreme Gradient Boosting classifier
	 * @property {XMeans} XMeans x-means
	 * @property {YeoJohnson} YeoJohnson Yeo-Johnson power transformation
	 * @property {ZeroInflatedPoisson} ZeroInflatedPoisson Zero-inflated poisson
	 * @property {ZeroTruncatedPoisson} ZeroTruncatedPoisson Zero-truncated poisson
	 */
	models: {
		A2CAgent,
		LBABOD,
		ABOD,
		ADALINE,
		ADAMENN,
		AdaptiveThresholding,
		AffinityPropagation,
		CentroidAgglomerativeClustering,
		CompleteLinkageAgglomerativeClustering,
		GroupAverageAgglomerativeClustering,
		MedianAgglomerativeClustering,
		SingleLinkageAgglomerativeClustering,
		WardsAgglomerativeClustering,
		WeightedAverageAgglomerativeClustering,
		AkimaInterpolation,
		ALMA,
		AODE,
		AR,
		ARMA,
		AROW,
		ART,
		AssociationAnalysis,
		Autoencoder,
		AutomaticThresholding,
		AverageShiftedHistogram,
		BalancedHistogramThresholding,
		Ballseptron,
		Banditron,
		BayesianLinearRegression,
		BayesianNetwork,
		BernsenThresholding,
		BesselFilter,
		BilinearInterpolation,
		BIRCH,
		BOGD,
		BoxCox,
		BPA,
		BrahmaguptaInterpolation,
		MulticlassBSGD,
		BSGD,
		BudgetPerceptron,
		ButterworthFilter,
		C2P,
		Canny,
		CAST,
		CategoricalNaiveBayes,
		CatmullRomSplines,
		CentripetalCatmullRomSplines,
		CHAMELEON,
		ChangeFinder,
		ChebyshevFilter,
		CLARA,
		CLARANS,
		CLIQUE,
		CLUES,
		CoTraining,
		COF,
		COLL,
		ComplementNaiveBayes,
		ConfidenceWeighted,
		SoftConfidenceWeighted,
		CosineInterpolation,
		CRF,
		CubicConvolutionInterpolation,
		CubicHermiteSpline,
		CubicInterpolation,
		CumulativeMovingAverage,
		CumSum,
		CURE,
		DiscriminantAdaptiveNearestNeighbor,
		DBCLASD,
		DBSCAN,
		DecisionTreeClassifier,
		DecisionTreeRegression,
		DelaunayInterpolation,
		DemingRegression,
		DENCLUE,
		DIANA,
		DiffusionMap,
		DQNAgent,
		DPAgent,
		ElasticNet,
		EllipticFilter,
		ENaN,
		ENN,
		EnsembleBinaryModel,
		ExponentialMovingAverage,
		ModifiedMovingAverage,
		ExtraTreesClassifier,
		ExtraTreesRegressor,
		FastMap,
		FINDIT,
		Forgetron,
		FuzzyCMeans,
		FuzzyKNN,
		GAN,
		GasserMuller,
		GaussianProcess,
		GBDT,
		GBDTClassifier,
		GeneralizedESD,
		GeneticAlgorithmGeneration,
		GeneticKMeans,
		GMeans,
		GMM,
		GMR,
		SemiSupervisedGMM,
		GPLVM,
		GrowingCellStructures,
		GrowingNeuralGas,
		GSOM,
		GTM,
		HampelFilter,
		HDBSCAN,
		Histogram,
		HLLE,
		ContinuousHMM,
		HMM,
		HoltWinters,
		HopfieldNetwork,
		Hotelling,
		HuberRegression,
		ICA,
		CELLIP,
		IELLIP,
		IKNN,
		IncrementalPCA,
		INFLO,
		InverseDistanceWeighting,
		InverseSmoothstepInterpolation,
		ISODATA,
		IsolationForest,
		Isomap,
		IsotonicRegression,
		KalmanFilter,
		KDEOS,
		KernelDensityEstimator,
		KernelKMeans,
		KernelizedPegasos,
		KernelizedPerceptron,
		KLIEP,
		KMeans,
		KMeanspp,
		KMedians,
		KMedoids,
		SemiSupervisedKMeansModel,
		KModes,
		KNN,
		KNNAnomaly,
		KNNDensityEstimation,
		KNNRegression,
		SemiSupervisedKNN,
		KPrototypes,
		KSVD,
		KolmogorovZurbenkoFilter,
		LabelPropagation,
		LabelSpreading,
		LadderNetwork,
		LagrangeInterpolation,
		LanczosInterpolation,
		Laplacian,
		LaplacianEigenmaps,
		Lasso,
		LatentDirichletAllocation,
		LBG,
		FishersLinearDiscriminant,
		LinearDiscriminant,
		LinearDiscriminantAnalysis,
		MulticlassLinearDiscriminant,
		LDF,
		LDOF,
		LeastAbsolute,
		LeastSquares,
		LinearInterpolation,
		LLE,
		LeastMedianSquaresRegression,
		LMNN,
		LOCI,
		LOESS,
		LOF,
		LoG,
		LogarithmicInterpolation,
		LogisticRegression,
		MultinomialLogisticRegression,
		LoOP,
		LOWESS,
		LowpassFilter,
		LpNormLinearRegression,
		LSA,
		LSDD,
		LSDDCPD,
		LSIF,
		LeastTrimmedSquaresRegression,
		LTSA,
		LVQClassifier,
		LVQCluster,
		MAD,
		MADALINE,
		MarginPerceptron,
		MarkovSwitching,
		MaxAbsScaler,
		MaximumLikelihoodEstimator,
		MCD,
		MixtureDiscriminant,
		MDS,
		MeanShift,
		MetropolisHastings,
		MinmaxNormalization,
		MIRA,
		MLLE,
		MLPClassifier,
		MLPRegressor,
		MOD,
		MONA,
		MonotheticClustering,
		MCAgent,
		Mountain,
		LinearWeightedMovingAverage,
		SimpleMovingAverage,
		TriangularMovingAverage,
		MovingMedian,
		MT,
		MutualInformationFeatureSelection,
		MutualKNN,
		NCubicInterpolation,
		NLinearInterpolation,
		NadarayaWatson,
		NaiveBayes,
		NaiveBayesRegression,
		NAROW,
		NaturalNeighborInterpolation,
		NeighbourhoodComponentsAnalysis,
		NearestCentroid,
		NegationNaiveBayes,
		NeuralGas,
		ComputationalGraph,
		Layer,
		NeuralnetworkException,
		NeuralNetwork,
		NiblackThresholding,
		NICE,
		NLMeans,
		NMF,
		NNBCA,
		NormalHERD,
		OCSVM,
		ODIN,
		OnlineGradientDescent,
		OPTICS,
		ORCLUS,
		OrdinalRegression,
		OtsusThresholding,
		PAM,
		ParticleFilter,
		PassingBablok,
		PA,
		PAUM,
		AnomalyPCA,
		DualPCA,
		KernelPCA,
		PCA,
		PossibilisticCMeans,
		PCR,
		Pegasos,
		PercentileAnormaly,
		AveragedPerceptron,
		MulticlassPerceptron,
		Perceptron,
		PhansalkarThresholding,
		PLS,
		PLSA,
		PoissonRegression,
		PGAgent,
		PolynomialHistogram,
		PolynomialInterpolation,
		ProjectionPursuit,
		Prewitt,
		PriestleyChao,
		PrincipalCurve,
		ProbabilisticPCA,
		ProbabilityBasedClassifier,
		MultinomialProbit,
		Probit,
		PROCLUS,
		Projectron,
		Projectronpp,
		PTile,
		QTableBase,
		QAgent,
		QuadraticDiscriminant,
		QuantileRegression,
		RadiusNeighbor,
		RadiusNeighborRegression,
		SemiSupervisedRadiusNeighbor,
		RamerDouglasPeucker,
		RandomForestClassifier,
		RandomForestRegressor,
		RandomProjection,
		RANSAC,
		RadialBasisFunctionNetwork,
		GBRBM,
		RBM,
		RBP,
		RDF,
		RDOS,
		KernelRidge,
		MulticlassRidge,
		Ridge,
		RKOF,
		RecursiveLeastSquares,
		RepeatedMedianRegression,
		RNN,
		RobertsCross,
		RobustScaler,
		ROCK,
		AggressiveROMMA,
		ROMMA,
		RVM,
		S3VM,
		Sammon,
		SARSAAgent,
		SauvolaThresholding,
		SavitzkyGolayFilter,
		SDAR,
		SegmentedRegression,
		SelectiveNaiveBayes,
		SelectiveSamplingAdaptivePerceptron,
		SelectiveSamplingPerceptron,
		SelectiveSamplingSOP,
		SelectiveSamplingWinnow,
		SelfTraining,
		SemiSupervisedNaiveBayes,
		SezanThresholding,
		ShiftingPerceptron,
		ILK,
		SILK,
		SincInterpolation,
		SlicedInverseRegression,
		Slerp,
		SliceSampling,
		SMARegression,
		SmirnovGrubbs,
		SmoothstepInterpolation,
		Snakes,
		Sobel,
		SoftKMeans,
		SOM,
		SecondOrderPerceptron,
		SpectralClustering,
		SmoothingSpline,
		SplineInterpolation,
		SplitAndMerge,
		SquaredLossMICPD,
		SST,
		Standardization,
		StatisticalRegionMerging,
		STING,
		Stoptron,
		SVC,
		SVM,
		SVR,
		TheilSenRegression,
		Thompson,
		TietjenMoore,
		TighterPerceptron,
		TightestPerceptron,
		TrigonometricInterpolation,
		SNE,
		tSNE,
		TukeyRegression,
		TukeysFences,
		RuLSIF,
		uLSIF,
		UMAP,
		UniversalSetNaiveBayes,
		VAE,
		VAR,
		VBGMM,
		VotedPerceptron,
		WeightedKMeans,
		WeightedKNN,
		WeightedLeastSquares,
		Winnow,
		Word2Vec,
		XGBoost,
		XGBoostClassifier,
		XMeans,
		YeoJohnson,
		ZeroInflatedPoisson,
		ZeroTruncatedPoisson,
	},
	/**
	 * @memberof default
	 * @property {AcrobotRLEnvironment} AcrobotRLEnvironment Acrobot environment
	 * @property {RLEnvironmentBase} RLEnvironmentBase Base class for reinforcement learning environment
	 * @property {RLIntRange} RLIntRange Integer number range state/actioin
	 * @property {RLRealRange} RLRealRange Real number range state/actioin
	 * @property {EmptyRLEnvironment} EmptyRLEnvironment Empty environment
	 * @property {BlackjackRLEnvironment} BlackjackRLEnvironment Blackjack environment
	 * @property {BreakerRLEnvironment} BreakerRLEnvironment Breaker environment
	 * @property {CartPoleRLEnvironment} CartPoleRLEnvironment Cartpole environment
	 * @property {DraughtsRLEnvironment} DraughtsRLEnvironment Draughts environment
	 * @property {GomokuRLEnvironment} GomokuRLEnvironment Gomoku environment
	 * @property {GridMazeRLEnvironment} GridMazeRLEnvironment Grid world environment
	 * @property {InHypercubeRLEnvironment} InHypercubeRLEnvironment In-hypercube environment
	 * @property {SmoothMazeRLEnvironment} SmoothMazeRLEnvironment Smooth maze environment
	 * @property {MountainCarRLEnvironment} MountainCarRLEnvironment MountainCar environment
	 * @property {PendulumRLEnvironment} PendulumRLEnvironment Pendulum environment
	 * @property {ReversiRLEnvironment} ReversiRLEnvironment Reversi environment
	 * @property {WaterballRLEnvironment} WaterballRLEnvironment Waterball environment
	 */
	rl: {
		AcrobotRLEnvironment,
		RLEnvironmentBase,
		RLIntRange,
		RLRealRange,
		EmptyRLEnvironment,
		BlackjackRLEnvironment,
		BreakerRLEnvironment,
		CartPoleRLEnvironment,
		DraughtsRLEnvironment,
		GomokuRLEnvironment,
		GridMazeRLEnvironment,
		InHypercubeRLEnvironment,
		SmoothMazeRLEnvironment,
		MountainCarRLEnvironment,
		PendulumRLEnvironment,
		ReversiRLEnvironment,
		WaterballRLEnvironment,
	},
	/**
	 * @memberof default
	 * @property {accuracy} accuracy Returns accuracy.
	 * @property {cohensKappa} cohensKappa Returns Cohen's kappa coefficient.
	 * @property {fScore} fScore Returns F-score with macro average.
	 * @property {precision} precision Returns precision with macro average.
	 * @property {recall} recall Returns recall with macro average.
	 * @property {davisBouldinIndex} davisBouldinIndex Returns Davies-Bouldin index.
	 * @property {diceIndex} diceIndex Returns Dice index.
	 * @property {dunnIndex} dunnIndex Returns Dunn index.
	 * @property {fowlkesMallowsIndex} fowlkesMallowsIndex Returns Fowlkes-Mallows index.
	 * @property {jaccardIndex} jaccardIndex Returns Jaccard index.
	 * @property {purity} purity Returns Purity.
	 * @property {randIndex} randIndex Returns Rand index.
	 * @property {silhouetteCoefficient} silhouetteCoefficient Returns Silhouette coefficient.
	 * @property {coRankingMatrix} coRankingMatrix Returns Co-Ranking Matrix.
	 * @property {correlation} correlation Returns correlation.
	 * @property {mad} mad Returns MAD (Median Absolute Deviation).
	 * @property {mae} mae Returns MAE (Mean Absolute Error).
	 * @property {mape} mape Returns MAPE (Mean Absolute Percentage Error).
	 * @property {mse} mse Returns MSE (Mean Squared Error).
	 * @property {msle} msle Returns MSLE (Mean Squared Logarithmic Error).
	 * @property {r2} r2 Returns R2 (coefficient of determination).
	 * @property {rmse} rmse Returns RMSE (Root Mean Squared Error).
	 * @property {rmsle} rmsle Returns RMSLE (Root Mean Squared Logarithmic Error).
	 * @property {rmspe} rmspe Returns RMSPE (Root Mean Squared Percentage Error).
	 */
	evaluate: {
		accuracy,
		cohensKappa,
		fScore,
		precision,
		recall,
		davisBouldinIndex,
		diceIndex,
		dunnIndex,
		fowlkesMallowsIndex,
		jaccardIndex,
		purity,
		randIndex,
		silhouetteCoefficient,
		coRankingMatrix,
		correlation,
		mad,
		mae,
		mape,
		mse,
		msle,
		r2,
		rmse,
		rmsle,
		rmspe,
	},
}