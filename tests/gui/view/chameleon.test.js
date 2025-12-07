import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('chameleon')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const n = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect((await n.getProperty('value')).jsonValue()).resolves.toBe('5')
		const k = await buttons.waitForSelector('input:nth-of-type(3)')
		await expect((await k.getProperty('value')).jsonValue()).resolves.toBe('10')
	})

	test(
		'learn',
		{ retry: 10 },
		async () => {
			const clusters = await page.waitForSelector('#data_menu input[name=n]')
			await clusters.evaluate(el => (el.value = 1))
			const resetDataButton = await page.waitForSelector('#data_menu input[value=Reset]')
			await resetDataButton.evaluate(el => el.click())
			const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
			await taskSelectBox.selectOption('CT')
			const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
			await modelSelectBox.selectOption('chameleon')
			const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
			const buttons = await methodMenu.waitForSelector('.buttons')

			const fitButton = await buttons.waitForSelector('input[value=Fit]')
			await fitButton.evaluate(el => el.click())

			const svg = await page.waitForSelector('#plot-area svg')
			await svg.waitForSelector('.datas circle')
			const circles = await svg.$$('.datas circle')
			const colors = new Set()
			for (const circle of circles) {
				const fill = await circle.evaluate(el => el.getAttribute('fill'))
				colors.add(fill)
			}
			expect(colors.size).toBe(10)
		},
		60000
	)
})
