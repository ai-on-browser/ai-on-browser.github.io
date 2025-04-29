import ImageLoader from '../../../../js/data/loader/image.js'

describe('ImageLoader', () => {
	test('colorSpaces', () => {
		expect(ImageLoader.colorSpaces).toEqual({
			RGB: 'rgb',
			COL8: '8 colors',
			GRAY: 'gray',
			BINARY: 'binary',
			HLS: 'hls',
			HSV: 'hsv',
		})
	})

	describe('reduce', () => {
		test.each([2, 3])('mean step:%i', n => {
			const imdata = []
			for (let i = 0; i < 50; i++) {
				imdata[i] = []
				for (let j = 0; j < 50; j++) {
					imdata[i][j] = [
						Math.floor(Math.random() * 256),
						Math.floor(Math.random() * 256),
						Math.floor(Math.random() * 256),
					]
				}
			}

			const reduced = ImageLoader.reduce(imdata, n)
			expect(reduced).toHaveLength(Math.ceil(imdata.length / n))
			for (let i = 0, s = 0; i < imdata.length; i += n, s++) {
				expect(reduced[s]).toHaveLength(Math.ceil(imdata[i].length / n))
				for (let j = 0, t = 0; j < imdata[i].length; j += n, t++) {
					expect(reduced[s][t]).toHaveLength(3)
					const sum = [0, 0, 0]
					for (let u = 0; u < n; u++) {
						for (let v = 0; v < n; v++) {
							if (i + u >= imdata.length || j + v >= imdata[i + u].length) {
								continue
							}
							for (let k = 0; k < 3; k++) {
								sum[k] += imdata[i + u][j + v][k]
							}
						}
					}
					for (let k = 0; k < 3; k++) {
						expect(reduced[s][t][k]).toBeCloseTo(sum[k] / n ** 2)
					}
				}
			}
		})

		test.each([2, 3])('max step:%i', n => {
			const imdata = []
			for (let i = 0; i < 50; i++) {
				imdata[i] = []
				for (let j = 0; j < 50; j++) {
					imdata[i][j] = [
						Math.floor(Math.random() * 256),
						Math.floor(Math.random() * 256),
						Math.floor(Math.random() * 256),
					]
				}
			}

			const reduced = ImageLoader.reduce(imdata, n, 'max')
			expect(reduced).toHaveLength(Math.ceil(imdata.length / n))
			for (let i = 0, s = 0; i < imdata.length; i += n, s++) {
				expect(reduced[s]).toHaveLength(Math.ceil(imdata[i].length / n))
				for (let j = 0, t = 0; j < imdata[i].length; j += n, t++) {
					expect(reduced[s][t]).toHaveLength(3)
					const max = [0, 0, 0]
					for (let u = 0; u < n; u++) {
						for (let v = 0; v < n; v++) {
							if (i + u >= imdata.length || j + v >= imdata[i + u].length) {
								continue
							}
							for (let k = 0; k < 3; k++) {
								max[k] = Math.max(max[k], imdata[i + u][j + v][k])
							}
						}
					}
					for (let k = 0; k < 3; k++) {
						expect(reduced[s][t][k]).toBeCloseTo(max[k])
					}
				}
			}
		})
	})

	describe('applySpace', () => {
		describe('rgb', () => {
			test('not normalize', () => {
				const imdata = []
				for (let i = 0; i < 50; i++) {
					imdata[i] = []
					for (let j = 0; j < 50; j++) {
						imdata[i][j] = [
							Math.floor(Math.random() * 256),
							Math.floor(Math.random() * 256),
							Math.floor(Math.random() * 256),
						]
					}
				}

				const newim = ImageLoader.applySpace(imdata, 'rgb')
				for (let i = 0; i < imdata.length; i++) {
					for (let j = 0; j < imdata[i].length; j++) {
						for (let k = 0; k < 3; k++) {
							expect(newim[i][j][k]).toBe(imdata[i][j][k])
						}
					}
				}
			})

			test('normalize', () => {
				const imdata = []
				for (let i = 0; i < 50; i++) {
					imdata[i] = []
					for (let j = 0; j < 50; j++) {
						imdata[i][j] = [
							Math.floor(Math.random() * 256),
							Math.floor(Math.random() * 256),
							Math.floor(Math.random() * 256),
						]
					}
				}

				const newim = ImageLoader.applySpace(imdata, 'rgb', true)
				for (let i = 0; i < imdata.length; i++) {
					for (let j = 0; j < imdata[i].length; j++) {
						for (let k = 0; k < 3; k++) {
							expect(newim[i][j][k]).toBeCloseTo(imdata[i][j][k] / 255)
						}
					}
				}
			})
		})

		describe('8 colors', () => {
			test('not normalize', () => {
				const imdata = []
				for (let i = 0; i < 50; i++) {
					imdata[i] = []
					for (let j = 0; j < 50; j++) {
						imdata[i][j] = [
							Math.floor(Math.random() * 256),
							Math.floor(Math.random() * 256),
							Math.floor(Math.random() * 256),
						]
					}
				}

				const newim = ImageLoader.applySpace(imdata, '8 colors')
				for (let i = 0; i < imdata.length; i++) {
					for (let j = 0; j < imdata[i].length; j++) {
						for (let k = 0; k < 3; k++) {
							expect(newim[i][j][k]).toBe(imdata[i][j][k] >= 128 ? 255 : 0)
						}
					}
				}
			})

			test('normalize', () => {
				const imdata = []
				for (let i = 0; i < 50; i++) {
					imdata[i] = []
					for (let j = 0; j < 50; j++) {
						imdata[i][j] = [
							Math.floor(Math.random() * 256),
							Math.floor(Math.random() * 256),
							Math.floor(Math.random() * 256),
						]
					}
				}

				const newim = ImageLoader.applySpace(imdata, '8 colors', true)
				for (let i = 0; i < imdata.length; i++) {
					for (let j = 0; j < imdata[i].length; j++) {
						for (let k = 0; k < 3; k++) {
							expect(newim[i][j][k]).toBe(imdata[i][j][k] >= 128 ? 1 : 0)
						}
					}
				}
			})
		})

		describe('gray', () => {
			test('not normalize', () => {
				const imdata = []
				for (let i = 0; i < 50; i++) {
					imdata[i] = []
					for (let j = 0; j < 50; j++) {
						imdata[i][j] = [
							Math.floor(Math.random() * 256),
							Math.floor(Math.random() * 256),
							Math.floor(Math.random() * 256),
						]
					}
				}

				const newim = ImageLoader.applySpace(imdata, 'gray')
				for (let i = 0; i < imdata.length; i++) {
					for (let j = 0; j < imdata[i].length; j++) {
						const v = 0.2126 * imdata[i][j][0] + 0.7152 * imdata[i][j][1] + 0.0722 * imdata[i][j][2]
						expect(newim[i][j][0]).toBeCloseTo(v)
					}
				}
			})

			test('normalize', () => {
				const imdata = []
				for (let i = 0; i < 50; i++) {
					imdata[i] = []
					for (let j = 0; j < 50; j++) {
						imdata[i][j] = [
							Math.floor(Math.random() * 256),
							Math.floor(Math.random() * 256),
							Math.floor(Math.random() * 256),
						]
					}
				}

				const newim = ImageLoader.applySpace(imdata, 'gray', true)
				for (let i = 0; i < imdata.length; i++) {
					for (let j = 0; j < imdata[i].length; j++) {
						const v = 0.2126 * imdata[i][j][0] + 0.7152 * imdata[i][j][1] + 0.0722 * imdata[i][j][2]
						expect(newim[i][j][0]).toBeCloseTo(v / 255)
					}
				}
			})
		})

		describe('binary', () => {
			test('not normalize', () => {
				const imdata = []
				for (let i = 0; i < 50; i++) {
					imdata[i] = []
					for (let j = 0; j < 50; j++) {
						imdata[i][j] = [
							Math.floor(Math.random() * 256),
							Math.floor(Math.random() * 256),
							Math.floor(Math.random() * 256),
						]
					}
				}

				const newim = ImageLoader.applySpace(imdata, 'binary')
				for (let i = 0; i < imdata.length; i++) {
					for (let j = 0; j < imdata[i].length; j++) {
						const v = 0.2126 * imdata[i][j][0] + 0.7152 * imdata[i][j][1] + 0.0722 * imdata[i][j][2]
						expect(newim[i][j][0]).toBeCloseTo(v < 180 ? 0 : 255)
					}
				}
			})

			test('normalize', () => {
				const imdata = []
				for (let i = 0; i < 50; i++) {
					imdata[i] = []
					for (let j = 0; j < 50; j++) {
						imdata[i][j] = [
							Math.floor(Math.random() * 256),
							Math.floor(Math.random() * 256),
							Math.floor(Math.random() * 256),
						]
					}
				}

				const newim = ImageLoader.applySpace(imdata, 'binary', true)
				for (let i = 0; i < imdata.length; i++) {
					for (let j = 0; j < imdata[i].length; j++) {
						const v = 0.2126 * imdata[i][j][0] + 0.7152 * imdata[i][j][1] + 0.0722 * imdata[i][j][2]
						expect(newim[i][j][0]).toBeCloseTo(v < 180 ? 0 : 1)
					}
				}
			})

			test('not normalize', () => {
				const imdata = []
				for (let i = 0; i < 50; i++) {
					imdata[i] = []
					for (let j = 0; j < 50; j++) {
						imdata[i][j] = [
							Math.floor(Math.random() * 256),
							Math.floor(Math.random() * 256),
							Math.floor(Math.random() * 256),
						]
					}
				}

				const newim = ImageLoader.applySpace(imdata, 'binary', false, 100)
				for (let i = 0; i < imdata.length; i++) {
					for (let j = 0; j < imdata[i].length; j++) {
						const v = 0.2126 * imdata[i][j][0] + 0.7152 * imdata[i][j][1] + 0.0722 * imdata[i][j][2]
						expect(newim[i][j][0]).toBeCloseTo(v < 100 ? 0 : 255)
					}
				}
			})
		})

		describe('hls', () => {
			test('not normalize', () => {
				const imdata = []
				for (let i = 0; i < 50; i++) {
					imdata[i] = []
					for (let j = 0; j < 50; j++) {
						do {
							imdata[i][j] = [
								Math.floor(Math.random() * 256),
								Math.floor(Math.random() * 256),
								Math.floor(Math.random() * 256),
							]
						} while (imdata[i][j][0] === imdata[i][j][1] && imdata[i][j][1] === imdata[i][j][2])
					}
				}

				const newim = ImageLoader.applySpace(imdata, 'hls')
				for (let i = 0; i < imdata.length; i++) {
					for (let j = 0; j < imdata[i].length; j++) {
						const r = imdata[i][j][0]
						const g = imdata[i][j][1]
						const b = imdata[i][j][2]

						const max = Math.max(r, g, b)
						const min = Math.min(r, g, b)
						let h = null
						if (max !== min) {
							if (min === b) {
								h = (60 * (g - r)) / (max - min) + 60
							} else if (min === r) {
								h = (60 * (b - g)) / (max - min) + 180
							} else if (min === g) {
								h = (60 * (r - b)) / (max - min) + 300
							}
						}
						const l = (max + min) / 2
						const s = max - min

						expect(newim[i][j][0]).toBeCloseTo(h)
						expect(newim[i][j][1]).toBeCloseTo(l)
						expect(newim[i][j][2]).toBeCloseTo(s)
					}
				}
			})

			test('normalize', () => {
				const imdata = []
				for (let i = 0; i < 50; i++) {
					imdata[i] = []
					for (let j = 0; j < 50; j++) {
						do {
							imdata[i][j] = [
								Math.floor(Math.random() * 256),
								Math.floor(Math.random() * 256),
								Math.floor(Math.random() * 256),
							]
						} while (imdata[i][j][0] === imdata[i][j][1] && imdata[i][j][1] === imdata[i][j][2])
					}
				}

				const newim = ImageLoader.applySpace(imdata, 'hls', true)
				for (let i = 0; i < imdata.length; i++) {
					for (let j = 0; j < imdata[i].length; j++) {
						const r = imdata[i][j][0]
						const g = imdata[i][j][1]
						const b = imdata[i][j][2]

						const max = Math.max(r, g, b)
						const min = Math.min(r, g, b)
						let h = null
						if (max !== min) {
							if (min === b) {
								h = (60 * (g - r)) / (max - min) + 60
							} else if (min === r) {
								h = (60 * (b - g)) / (max - min) + 180
							} else if (min === g) {
								h = (60 * (r - b)) / (max - min) + 300
							}
						}
						const l = (max + min) / 2
						const s = max - min

						expect(newim[i][j][0]).toBeCloseTo(h / 360)
						expect(newim[i][j][1]).toBeCloseTo(l / 255)
						expect(newim[i][j][2]).toBeCloseTo(s / 255)
					}
				}
			})

			test('gray', () => {
				const imdata = [[[10, 10, 10]]]

				const newim = ImageLoader.applySpace(imdata, 'hls')
				expect(newim[0][0][0]).toBeNull()
				expect(newim[0][0][1]).toBeCloseTo(10)
				expect(newim[0][0][2]).toBeCloseTo(0)
			})
		})

		describe('hsv', () => {
			test('not normalize', () => {
				const imdata = []
				for (let i = 0; i < 50; i++) {
					imdata[i] = []
					for (let j = 0; j < 50; j++) {
						do {
							imdata[i][j] = [
								Math.floor(Math.random() * 256),
								Math.floor(Math.random() * 256),
								Math.floor(Math.random() * 256),
							]
						} while (imdata[i][j][0] === imdata[i][j][1] && imdata[i][j][1] === imdata[i][j][2])
					}
				}

				const newim = ImageLoader.applySpace(imdata, 'hsv')
				for (let i = 0; i < imdata.length; i++) {
					for (let j = 0; j < imdata[i].length; j++) {
						const r = imdata[i][j][0]
						const g = imdata[i][j][1]
						const b = imdata[i][j][2]

						const max = Math.max(r, g, b)
						const min = Math.min(r, g, b)
						let h = null
						if (max !== min) {
							if (min === b) {
								h = (60 * (g - r)) / (max - min) + 60
							} else if (min === r) {
								h = (60 * (b - g)) / (max - min) + 180
							} else if (min === g) {
								h = (60 * (r - b)) / (max - min) + 300
							}
						}
						const l = max
						const s = max - min

						expect(newim[i][j][0]).toBeCloseTo(h)
						expect(newim[i][j][1]).toBeCloseTo(l)
						expect(newim[i][j][2]).toBeCloseTo(s)
					}
				}
			})

			test('normalize', () => {
				const imdata = []
				for (let i = 0; i < 50; i++) {
					imdata[i] = []
					for (let j = 0; j < 50; j++) {
						do {
							imdata[i][j] = [
								Math.floor(Math.random() * 256),
								Math.floor(Math.random() * 256),
								Math.floor(Math.random() * 256),
							]
						} while (imdata[i][j][0] === imdata[i][j][1] && imdata[i][j][1] === imdata[i][j][2])
					}
				}

				const newim = ImageLoader.applySpace(imdata, 'hsv', true)
				for (let i = 0; i < imdata.length; i++) {
					for (let j = 0; j < imdata[i].length; j++) {
						const r = imdata[i][j][0]
						const g = imdata[i][j][1]
						const b = imdata[i][j][2]

						const max = Math.max(r, g, b)
						const min = Math.min(r, g, b)
						let h = null
						if (max !== min) {
							if (min === b) {
								h = (60 * (g - r)) / (max - min) + 60
							} else if (min === r) {
								h = (60 * (b - g)) / (max - min) + 180
							} else if (min === g) {
								h = (60 * (r - b)) / (max - min) + 300
							}
						}
						const l = max
						const s = max - min

						expect(newim[i][j][0]).toBeCloseTo(h / 360)
						expect(newim[i][j][1]).toBeCloseTo(l / 255)
						expect(newim[i][j][2]).toBeCloseTo(s / 255)
					}
				}
			})

			test('gray', () => {
				const imdata = [[[10, 10, 10]]]

				const newim = ImageLoader.applySpace(imdata, 'hsv')
				expect(newim[0][0][0]).toBeNull()
				expect(newim[0][0][1]).toBeCloseTo(10)
				expect(newim[0][0][2]).toBeCloseTo(0)
			})
		})
	})
})
