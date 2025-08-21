import { test as setup, expect } from '@playwright/test';

setup('delete article', async({request}) => {
    const deketeArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${process.env.SLUGID}`)
    // headers: {
    //   Authorization: `Token ${accessToken}` // токен пользователя
    // }
  expect(deketeArticleResponse.status()).toEqual(204)
})