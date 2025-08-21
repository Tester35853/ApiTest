import { test, expect, request, } from '@playwright/test';
import tags from '../test-data/tags.json'


test.beforeEach( async ({page}) => {
  await page.route('*/**/api/tags', async route => {
    await route.fulfill({
      body: JSON.stringify(tags)
    });
  });

  await page.goto('https://conduit.bondaracademy.com/');
});

test('has title', async ({ page }) => {
  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = 'My MOCK text'
    responseBody.articles[0].description = 'First MOCK description'

    await route.fulfill({
      body: JSON.stringify(responseBody)
    });
  })

  await page.getByText('Global Feed').click()
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await expect(page.locator('app-article-list h1').first()).toContainText('My MOCK text')
  await expect(page.locator('app-article-list p').first()).toContainText('First MOCK description')
});

test('delete article', async({page, request}) => {
  // const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
  //   data: {
  //     "user": {"email": "qipy@gmail.com", "password": "12345678"}
  //   }
  // })
  // const responseBody = await response.json()
  // const accessToken = responseBody.user.token

  const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles/', {
    data: {
      "article": {"tagList": [],"title": "qw", "description": "e2", "body": "d3"}
    }
    // headers: {
    //   Authorization: `Token ${accessToken}`
    // }
  })
  expect(articleResponse.status()).toEqual(201)

  await page.getByText('Global Feed').click()
  await page.getByText('qw').click()
  await page.getByRole('button', {name: ' Delete Article '}).first().click()
  await page.getByText('Global Feed').click()

  await expect(page.locator('app-article-list h1').first()).not.toContainText('qw')
})

test('Create article', async({page, request}) => {
  await page.getByText('New Article').click()
  await page.getByPlaceholder('Article Title').fill('New article')
  await page.getByPlaceholder("What's this article about?").fill('This is the first article')
  await page.getByPlaceholder('Write your article (in markdown)').fill('I do not no...')
  await page.getByRole('button', {name: ' Publish Article '}).click()
  
  //Создаем статью и достаем АйДи статьи
  const articleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/')
  const articleResponseBody = await articleResponse.json()
  const articleSlug = articleResponseBody.article.slug

  await expect(page.locator('app-article-page h1')).toContainText('New article')

  await page.getByText('Home').click()
  await page.getByText('Global Feed').click()

  await expect(page.locator('app-article-list h1').first()).toContainText('New article')

  //Получаем респонс под API логин
  // const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
  //   data: {
  //     "user": {"email": "qipy@gmail.com", "password": "12345678"}
  //   }
  // })
  // const responseBody = await response.json()
  // const accessToken = responseBody.user.token

  //Удаляем статью через API
  const deketeArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${articleSlug}`)
    // headers: {
    //   Authorization: `Token ${accessToken}` // токен пользователя
    // }
  expect(deketeArticleResponse.status()).toEqual(204)
})