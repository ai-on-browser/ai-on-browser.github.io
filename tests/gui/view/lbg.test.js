import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = page.locator('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = page.locator('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('lbg')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const clusters = buttons.locator('span')
		await expect(clusters.textContent()).resolves.toBe('0 clusters')
	})

	test('learn', async () => {
		const methodMenu = page.locator('#ml_selector #method_menu')
		const buttons = methodMenu.locator('.buttons')

		const clusters = buttons.locator('span')
		await expect(clusters.textContent()).resolves.toBe('0 clusters')

		const stepButton = buttons.locator('input[value=Step]:enabled')
		await stepButton.dispatchEvent('click')
		await stepButton.dispatchEvent('click')

		const svg = page.locator('#plot-area svg')
		const circles = svg.locator('.datas circle')
		const colors = new Set()
		for (const circle of await circles.all()) {
			const fill = await circle.getAttribute('fill')
			colors.add(fill)
		}
		expect(colors.size).toBe(2)

		const centroids = svg.locator('.centroids polygon')
		const count = await centroids.count()
		expect(count).toBe(2)
		await expect(clusters.textContent()).resolves.toBe('2 clusters')
	})
})
