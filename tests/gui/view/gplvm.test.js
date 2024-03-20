import { getPage } from '../helper/browser'

describe('dimensionality reduction', () => {
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
		await taskSelectBox.selectOption('DR')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('gplvm')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const kernel = await buttons.waitForSelector('select:nth-of-type(1)')
		await expect((await kernel.getProperty('value')).jsonValue()).resolves.toBe('gaussian')

		await buttons.waitForSelector('input')
		const inputs = await buttons.$$('input')
		const sigma = inputs[0]
		await expect((await sigma.getProperty('value')).jsonValue()).resolves.toBe('1')
		const alpha = inputs[1]
		await expect((await alpha.getProperty('value')).jsonValue()).resolves.toBe('0.05')
		const ez = inputs[2]
		await expect((await ez.getProperty('value')).jsonValue()).resolves.toBe('1')
		const ea = inputs[3]
		await expect((await ea.getProperty('value')).jsonValue()).resolves.toBe('0.005')
		const ep = inputs[4]
		await expect((await ep.getProperty('value')).jsonValue()).resolves.toBe('0.02')
	})

	test('learn', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('DR')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('gplvm')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const initButton = await buttons.waitForSelector('input[value=Initialize]')
		await initButton.evaluate(el => el.click())
		const stepButton = await buttons.waitForSelector('input[value=Step]:enabled')
		await stepButton.evaluate(el => el.click())

		const svg = await page.waitForSelector('#plot-area svg')
		await svg.waitForSelector('.tile circle')
		const circles = await svg.$$('.tile circle')
		expect(circles).toHaveLength(300)
	}, 60000)
})
