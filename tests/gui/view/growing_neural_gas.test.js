import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('growing_neural_gas')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const clusters = buttons.locator('span')
		await expect(clusters.textContent()).resolves.toBe('0 clusters')
		const l = buttons.locator('input:nth-of-type(2)')
		await expect(l.inputValue()).resolves.toBe('1')
		const m = buttons.locator('input:nth-of-type(3)')
		await expect(m.inputValue()).resolves.toBe('0.9999')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const clusters = buttons.locator('span')
		await expect(clusters.textContent()).resolves.toBe('0 clusters')

		const initButton = buttons.locator('input[value=Initialize]')
		await initButton.dispatchEvent('click')
		const stepButton = buttons.locator('input[value=Step]:enabled')
		await stepButton.dispatchEvent('click')

		const svg = page.locator('#plot-area svg')
		const circles = svg.locator('.datas circle')
		const colors = new Set()
		for (const circle of await circles.all()) {
			const fill = await circle.getAttribute('fill')
			colors.add(fill)
		}
		expect(colors.size).toBeGreaterThanOrEqual(2)

		const centroids = svg.locator('.centroids polygon')
		const count = await centroids.count()
		expect(count).toBeGreaterThanOrEqual(3)
		await expect(clusters.textContent()).resolves.toMatch(/^[0-9]+ clusters$/)
	})
})
