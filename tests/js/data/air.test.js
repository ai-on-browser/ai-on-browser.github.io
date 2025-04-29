import manager from '../helper/manager.js'

import AirPassengerData from '../../../js/data/air.js'

describe('AirPassengerData', () => {
	const airdata = [
		112, 118, 132, 129, 121, 135, 148, 148, 136, 119, 104, 118, 115, 126, 141, 135, 125, 149, 170, 170, 158, 133,
		114, 140, 145, 150, 178, 163, 172, 178, 199, 199, 184, 162, 146, 166, 171, 180, 193, 181, 183, 218, 230, 242,
		209, 191, 172, 194, 196, 196, 236, 235, 229, 243, 264, 272, 237, 211, 180, 201, 204, 188, 235, 227, 234, 264,
		302, 293, 259, 229, 203, 229, 242, 233, 267, 269, 270, 315, 364, 347, 312, 274, 237, 278, 284, 277, 317, 313,
		318, 374, 413, 405, 355, 306, 271, 306, 315, 301, 356, 348, 355, 422, 465, 467, 404, 347, 305, 336, 340, 318,
		362, 348, 363, 435, 491, 505, 404, 359, 310, 337, 360, 342, 406, 396, 420, 472, 548, 559, 463, 407, 362, 405,
		417, 391, 419, 461, 472, 535, 622, 606, 508, 461, 390, 432,
	]

	test('constructor', () => {
		const data = new AirPassengerData(null)
		expect(data._y).toHaveLength(144)
	})

	test('avail task', () => {
		const data = new AirPassengerData(null)

		expect(data.availTask).toEqual(['RG', 'IN', 'TF', 'SM', 'TP', 'CP'])
	})

	test('dimension', () => {
		const data = new AirPassengerData(null)

		expect(data.dimension).toBe(0)
	})

	test('domain', () => {
		const data = new AirPassengerData(null)

		expect(data.domain).toEqual([])
	})

	test('range', () => {
		const data = new AirPassengerData(null)

		expect(data.range).toEqual([100, 1000])
	})

	test('indexRange', () => {
		const data = new AirPassengerData(null)

		expect(data.indexRange).toEqual([NaN, NaN])
	})

	test('length', () => {
		const data = new AirPassengerData(null)

		expect(data.length).toBe(144)
	})

	test('columnNames', () => {
		const data = new AirPassengerData(null)

		expect(data.columnNames).toEqual([])
	})

	test('x', () => {
		const data = new AirPassengerData(null)

		expect(data.x).toEqual([])
	})

	test('originalX', () => {
		const data = new AirPassengerData(null)

		expect(data.originalX).toEqual([])
	})

	test('y', () => {
		const data = new AirPassengerData(null)

		expect(data.y).toEqual(airdata)
	})

	test('originalY', () => {
		const data = new AirPassengerData(null)

		expect(data.originalY).toEqual(airdata)
	})

	test('index', () => {
		const data = new AirPassengerData(null)

		let year = 1949
		let month = 1
		const index = []
		for (let i = 0; i < 144; i++) {
			index.push(`${year}/${month.toString().padStart(2, 0)}`)
			month++
			if (month > 12) {
				month = 1
				year++
			}
		}
		expect(data.index).toEqual(index)
	})

	test('labels', () => {
		const data = new AirPassengerData(null)

		expect(data.labels).toEqual(airdata)
	})

	test('get params', () => {
		const data = new AirPassengerData(null)

		expect(data.params).toEqual({})
	})

	test('terminate', () => {
		const data = new AirPassengerData(manager)

		expect(() => data.terminate()).not.toThrow()
	})
})
