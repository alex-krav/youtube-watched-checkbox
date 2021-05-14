'use strict';

const webdriver = require('selenium-webdriver');
const chromeDriver = require('selenium-webdriver/chrome');
const By = webdriver.By;

const options = new chromeDriver.Options();
options.addExtensions(['/c/Users/oakravchuk/projects/2021/chrome/youtube-watched-checkbox/dist/youtube-watched-checkbox.crx']);

const driver = new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

describe('integration test', function() {
  it('test youtube', function() {
    driver.get('https://www.youtube.com');

    driver.sleep(5000).then(function() {
      driver.findElement(By.xpath('//input[@id=\'search\']')).sendKeys('webdriver');
      driver.findElement(By.xpath('//button[@id=\'search-icon-legacy\']')).click();

      driver.sleep(5000).then(function() {
        driver.getTitle().then(function(title: string) {
          if (title === 'webdriver - YouTube') {
            console.log('Test passed');
          } else {
            console.log('Test failed');
          }
          driver.quit();
        });
      });
    });
  });
});
