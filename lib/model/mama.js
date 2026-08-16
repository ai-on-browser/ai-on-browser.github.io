/**
 * MESA Adaptive Moving Average / Following Adaptive Moving Average
 */
export default class MesaAdaptiveMovingAverage {
	// https://www.quantconnect.com/docs/v2/writing-algorithms/indicators/supported-indicators/mesa-adaptive-moving-average
	// https://github.com/QuantConnect/Lean/blob/master/Indicators/MesaAdaptiveMovingAverage.cs
	/**
	 * @param {number} fastLimit The fast limit for the adaptive moving average
	 * @param {number} slowLimit The slow limit for the adaptive moving average
	 */
	constructor(fastLimit = 0.5, slowLimit = 0.05) {
		this._fastLimit = fastLimit
		this._slowLimit = slowLimit
	}

	/**
	 * Returns smoothed values.
	 * @param {number[]} data Training data
	 * @returns {{mama: number[], fama: number[]}} Predicted values
	 */
	predict(data) {
		const smallCoef = 0.0962
		const largeCoef = 0.5796
		const smoothHistory = []
		const detrendHistory = []
		const inPhaseHistory = []
		const quadratureHistory = []
		let prevPeriod = 0
		let prevInPhase2 = 0
		let prevQuadrature2 = 0
		let prevReal = 0
		let prevImaginary = 0
		let prevSmoothPeriod
		let prevPhase = 0
		const prevMama = 0
		const prevFama = 0

		const mp = []
		const fp = []

		for (let i = 0; i < data.length; i++) {
			const adjPeriod = 0.075 * prevPeriod + 0.54
			let smooth = 0
			for (let k = 0; k < 4 && k <= i; k++) {
				smooth += (4 - k) * data[i - k]
			}
			smooth /= 10

			const detrender =
				(smallCoef * smooth +
					largeCoef * (smoothHistory[i - 2] ?? 0) -
					largeCoef * (smoothHistory[i - 4] ?? 0) -
					smallCoef * (smoothHistory[i - 6] ?? 0)) *
				adjPeriod
			const quadrature1 =
				(smallCoef * detrender +
					largeCoef * (detrendHistory[i - 2] ?? 0) -
					largeCoef * (detrendHistory[i - 4] ?? 0) -
					smallCoef * (detrendHistory[i - 6] ?? 0)) *
				adjPeriod
			const inPhase1 = detrendHistory[i - 3] ?? 0
			const adjustedInPhase =
				(smallCoef * inPhase1 +
					largeCoef * (inPhaseHistory[i - 2] ?? 0) -
					largeCoef * (inPhaseHistory[i - 4] ?? 0) -
					smallCoef * (inPhaseHistory[i - 6] ?? 0)) *
				adjPeriod
			const adjustedQuadrature =
				(smallCoef * quadrature1 +
					largeCoef * (quadratureHistory[i - 2] ?? 0) -
					largeCoef * (quadratureHistory[i - 4] ?? 0) -
					smallCoef * (quadratureHistory[i - 6] ?? 0)) *
				adjPeriod
			const inPhase2 = 0.2 * (inPhase1 - adjustedQuadrature) + 0.8 * prevInPhase2
			const quadrature2 = 0.2 * (quadrature1 + adjustedInPhase) + 0.8 * prevQuadrature2

			const real = 0.2 * (inPhase2 * prevInPhase2 + quadrature2 * prevQuadrature2) + 0.8 * prevReal
			const imaginary = 0.2 * (inPhase2 * prevQuadrature2 - quadrature2 * prevInPhase2) + 0.8 * prevImaginary

			let period = 0
			if (imaginary !== 0 && real !== 0) {
				const angleInDegrees = Math.atan2(imaginary, real)
				period = angleInDegrees > 0 ? (Math.PI * 2) / angleInDegrees : 0
			}
			period = Math.min(period, 1.5 * prevPeriod, 50)
			period = Math.max(period, 0.67 * prevPeriod, 6)
			period = 0.2 * period + 0.8 * prevPeriod
			const smoothPeriod = 0.33 * period + 0.67 * prevSmoothPeriod

			let phase = 0
			if (inPhase1 !== 0) {
				phase = (Math.atan(quadrature1, inPhase1) * 180) / Math.PI
			}
			const deltaPhase = Math.max(1, prevPhase - phase)
			const alpha = Math.max(this._slowLimit, this._fastLimit / deltaPhase)

			prevInPhase2 = inPhase2
			prevQuadrature2 = quadrature2
			prevReal = real
			prevImaginary = imaginary
			prevPeriod = period
			prevSmoothPeriod = smoothPeriod
			prevPhase = phase

			const mama = alpha * data[i] + (1 - alpha) * prevMama
			const fama = 0.5 * alpha * mama + (1 - 0.5 * alpha) * prevFama

			smoothHistory.push(smooth)
			detrendHistory.push(detrender)
			inPhaseHistory.push(inPhase1)
			quadratureHistory.push(quadrature1)
			mp.push(mama)
			fp.push(fama)
		}
		return { mama: mp, fama: fp }
	}
}
