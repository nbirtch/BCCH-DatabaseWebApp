const { Builder, By, Key, until } = require('selenium-webdriver');
const { expect } = require('chai');

describe('DefaultTest', () => {
    const driver = new Builder().forBrowser('chrome').build();

    it('should login and check username', async () => {
        await driver.get('http://localhost:3000/');
        await driver.wait(until.elementLocated(By.name('username')));
        await driver.findElement(By.name('username')).sendKeys('lang');
        await driver.findElement(By.name('password')).sendKeys('123');
        await driver.findElement(By.css('.login-button')).click();
        await driver.wait(until.elementLocated(By.css('.dash-board-greeting')));
        const username = await driver.findElement(By.css('.dash-board-username')).getAttribute('textContent');

        expect(username).to.equal('Lang C');
    });

    it('should logout and check Login Page title', async () => {
        await driver.get('http://localhost:3000/');
        await driver.findElement(By.css('.negative-button')).click();
        await driver.get('http://localhost:3000/#/dashboard');
        const loginTitle = await driver.findElement(By.css('.form-title')).getAttribute('textContent');

        expect(loginTitle).to.equal('Login');
    });

    it('should be redirected to dashboard', async () => {
        await driver.get('http://localhost:3000/#/dashboard');
        await driver.wait(until.elementLocated(By.css('.form-title')));
        const loginTitle = await driver.findElement(By.css('.form-title')).getAttribute('textContent');

        expect(loginTitle).to.equal('Login');
    });

    it('should login as admin and check first button', async () => {
        await driver.get('http://localhost:3000/');
        await driver.findElement(By.name('username')).sendKeys('admin');
        await driver.findElement(By.name('password')).sendKeys('admin');
        await driver.findElement(By.css('.login-button')).click();
        await driver.wait(until.elementLocated(By.css('.dashboard-button')));
        const username = await driver.findElement(By.css('.dashboard-button')).getAttribute('textContent');

        expect(username).to.equal('Run Query');
    });

    after(async () => driver.quit());
});