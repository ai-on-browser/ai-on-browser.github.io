import puppeteer from 'puppeteer'

import { getPage } from '../helper/browser'

describe('density estimation', () => {
	/** @type {puppeteer.Page} */
	let page
	beforeEach(async () => {
		page = await getPage()
	}, 10000)

	afterEach(async () => {
		await page?.close()
	})

	test('initialize', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('DE')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('average_shifted_histogram')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const bin = await buttons.waitForSelector('input:nth-of-type(1)')
		await expect((await bin.getProperty('value')).jsonValue()).resolves.toBe('10')
		const aggregate = await buttons.waitForSelector('input:nth-of-type(2)')
		await expect((await aggregate.getProperty('value')).jsonValue()).resolves.toBe('10')
	}, 10000)

	test('learn', async () => {
		const taskSelectBox = await page.waitForSelector('#ml_selector dl:first-child dd:nth-child(5) select')
		taskSelectBox.select('DE')
		const modelSelectBox = await page.waitForSelector('#ml_selector .model_selection #mlDisp')
		modelSelectBox.select('average_shifted_histogram')
		const methodMenu = await page.waitForSelector('#ml_selector #method_menu')
		const buttons = await methodMenu.waitForSelector('.buttons')

		const fitButton = await buttons.waitForSelector('input[value=Fit]')
		await fitButton.evaluate(el => el.click())

		const svg = await page.waitForSelector('#plot-area svg')
		await svg.waitForSelector('.tile-render image')
		expect((await svg.$$('.tile-render image')).length).toBeGreaterThan(0)
	}, 10000)
})
