import { getPage } from '../helper/browser'

describe('change point detection', () => {
	/** @type {Awaited<ReturnType<getPage>>} */
	let page
	beforeEach(async () => {
		page = await getPage()
		const dataSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(2) select')
		await dataSelectBox.selectOption('functional')
		const presetSelectBox = await page.waitForSelector('#ml_selector #data_menu select[name=preset]')
		await presetSelectBox.selectOption('tanh')
		const numberTextArea = await page.waitForSelector('#ml_selector #data_menu > input[type=number]')
		await numberTextArea.fill('20')

		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		await taskSelectBox.selectOption('CP')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		await modelSelectBox.selectOption('markov_switching')
	})

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const regime = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect((await regime.getProperty('value')).jsonValue()).resolves.toBe('3')
		const trial = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect((await trial.getProperty('value')).jsonValue()).resolves.toBe('10000')
		const threshold = await buttons.waitForSelector('input:nth-of-type(3)')
		await expect((await threshold.getProperty('value')).jsonValue()).resolves.toBe('0.1')
	})

	test('learn', async () => {
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const calcButton = await buttons.waitForSelector('input[value=Calculate]')
		await calcButton.evaluate(el => el.click())

		const svg = await page.waitForSelector('#plot-area svg')
		await svg.waitForSelector('.tile-render line', { state: 'attached' })
		expect((await svg.$$('.tile-render line')).length).toBeGreaterThan(0)
	}, 100000)
})
