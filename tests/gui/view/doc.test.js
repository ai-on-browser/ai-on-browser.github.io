import { getPage } from '../helper/browser'

describe('clustering', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CT')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('doc')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const type = await buttons.waitForSelector('select:nth-of-type(1)')
		await expect((await type.getProperty('value')).jsonValue()).resolves.toBe('DOC')
		const alpha = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect(alpha.getAttribute('value')).resolves.toBe('0.1')
		const beta = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect(beta.getAttribute('value')).resolves.toBe('0.25')
		const w = await buttons.waitForSelector('input:nth-of-type(3)')
		await expect(w.getAttribute('value')).resolves.toBe('0.1')
	})

	test('learn', async () => {
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
		expect(colors.size).toBe(2)
	})
})
