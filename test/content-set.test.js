/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { codes } = require('../src/SDKErrors')

/* global createSdkClient, fetchMock */ // for linter

describe('Content Set', () => {
  beforeEach(() => {
    fetchMock.reset()
  })

  describe('Create', () => {
    test('createContentSet - program-not-found', async () => {
      fetchMock.mock({
        'https://cloudmanager.adobe.io/api/program/123/contentSets': 'POST',
        name: 'POST-https://cloudmanager.adobe.io/api/program/123/contentSets',
      }, 404)

      expect.assertions(2)
      const sdkClient = await createSdkClient()

      const result = sdkClient.createContentSet('123', '{}')

      await expect(result instanceof Promise).toBeTruthy()
      await expect(result).rejects.toEqual(
        new codes.ERROR_CREATE_CONTENTSET({ messageValues: 'https://cloudmanager.adobe.io/api/program/123/contentSets (404 Not Found)' }),
      )
    })

    test('createContentSet - bad-request', async () => {
      fetchMock.mock({
        'https://cloudmanager.adobe.io/api/program/123400/contentSets': 'POST',
        name: 'POST-https://cloudmanager.adobe.io/api/program/123400/contentSets',
      },
      {
        status: 400,
        headers: {
          'content-type': 'application/problem+json',
        },
        body: {
          type: 'http://ns.adobe.com/adobecloud/random-exception-with-a-message',
          title: 'Test Exception',
          errors: [
            { message: 'some error message' },
          ],
        },
      })
      expect.assertions(2)
      const sdkClient = await createSdkClient()

      const result = sdkClient.createContentSet('123400', '{"bad":"data"}')

      await expect(result instanceof Promise).toBeTruthy()
      await expect(result).rejects.toEqual(
        new codes.ERROR_CREATE_CONTENTSET({ messageValues: 'https://cloudmanager.adobe.io/api/program/123400/contentSets (400 Bad Request) - Test Exception(s): some error message' }),
      )
    })

    test('createContentSet', async () => {
      fetchMock.mock({
        'https://cloudmanager.adobe.io/api/program/1234/contentSets': 'POST',
        name: 'POST-https://cloudmanager.adobe.io/api/program/1234/contentSets',
      }, require('./jest/data/contentset-create-response.json'))

      expect.assertions(2)
      const sdkClient = await createSdkClient()

      const result = sdkClient.createContentSet('1234', require('./jest/data/contentset-create.json'))
      await expect(result instanceof Promise).toBeTruthy()
      await expect(result).resolves.toMatchObject({
        id: '7057',
        name: 'AIO Lib test',
        description: 'Test AIO library',
        paths: [
          {
            path: '/content/dam/image_1.png',
          },
          {
            path: '/content/dam/image.jpg',
          },
        ],
        programId: '67406',
      })
    })
  })

  describe('Get', () => {
    test('getContentSet - not found', async () => {
      fetchMock.mock({
        'https://cloudmanager.adobe.io/api/program/123/contentSet/321': 'GET',
        name: 'GET-https://cloudmanager.adobe.io/api/program/123/contentSet/321',
      }, 404)

      expect.assertions(2)
      const sdkClient = await createSdkClient()

      const result = sdkClient.getContentSet('123', '321')
      await expect(result instanceof Promise).toBeTruthy()
      await expect(result).rejects.toEqual(
        new codes.ERROR_GET_CONTENTSET({ messageValues: 'https://cloudmanager.adobe.io/api/program/123/contentSet/321 (404 Not Found)' }),
      )
    })

    test('getContentSet', async () => {
      fetchMock.mock({
        'https://cloudmanager.adobe.io/api/program/123/contentSet/321': 'GET',
        name: 'GET-https://cloudmanager.adobe.io/api/program/123/contentSet/321',
      }, {
        status: 200,
        name: 'One path',
        description: 'A description',
        paths: [
          {
            path: '/content/dam/seed19017.png',
          },
        ],
        programId: '123',
      })

      expect.assertions(2)
      const sdkClient = await createSdkClient()

      const result = sdkClient.getContentSet('123', '1234')

      await expect(result instanceof Promise).toBeTruthy()
      await expect(result).resolves.toMatchObject({
        name: 'One path',
        description: 'A description',
        paths: [{
          path: '/content/dam/seed19017.png',
        }],
        programId: '123',
      })
    })
  })

  describe('List', () => {
    test('listContentSets', async () => {
      fetchMock.mock({
        'https://cloudmanager.adobe.io/api/program/123456/contentSets': 'GET',
        name: 'GET-https://cloudmanager.adobe.io/api/program/123456/contentSets',
      },
      require('./jest/data/contentset-list.json'))
      expect.assertions(2)
      const sdkClient = await createSdkClient()
      const result = sdkClient.listContentSets('123456')

      await expect(result instanceof Promise).toBeTruthy()
      await expect(result).resolves.toMatchObject([
        {
          id: '6402',
          name: 'One path two ptah',
          description: 'A description',
        },
        {
          id: '6352',
          name: 'One path',
          description: 'Another description',
        }])
    })

    test('listContentSets - not found', async () => {
      fetchMock.mock({
        'https://cloudmanager.adobe.io/api/program/123/contentSets/321': 'GET',
        name: 'GET-https://cloudmanager.adobe.io/api/program/123/contentSets/321',
      }, 404)

      expect.assertions(2)
      const sdkClient = await createSdkClient()

      const result = sdkClient.listContentSets('321')
      await expect(result instanceof Promise).toBeTruthy()
      await expect(result).rejects.toEqual(
        new codes.ERROR_LIST_CONTENTSETS({ messageValues: 'https://cloudmanager.adobe.io/api/program/321/contentSets (404 Not Found)' }),
      )
    })
  })

  describe('Update', () => {
    test('updateContentSet - not found', async () => {
      fetchMock.mock({
        'https://cloudmanager.adobe.io/api/program/1234/contentSet/6402': 'PUT',
        name: 'PUT-https://cloudmanager.adobe.io/api/api/program/1234/contentSet/6402',
      }, 404)

      expect.assertions(2)
      const sdkClient = await createSdkClient()
      const result = sdkClient.updateContentSet('1234', '6402', {})

      await expect(result instanceof Promise).toBeTruthy()
      await expect(result).rejects.toEqual(
        new codes.ERROR_UPDATE_CONTENTSET({ messageValues: 'https://cloudmanager.adobe.io/api/program/1234/contentSet/6402 (404 Not Found)' }),
      )
    })

    test('updateContentSet', async () => {
      fetchMock.mock({
        'https://cloudmanager.adobe.io/api/program/67403/contentSet/6402': 'PUT',
        name: 'PUT-https://cloudmanager.adobe.io/api/program/67403/contentSet/6402',
      },
      require('./jest/data/contentset-update.json'))

      expect.assertions(2)
      const sdkClient = await createSdkClient()
      const result = sdkClient.updateContentSet('67403', '6402', require('./jest/data/contentset-update.json'))

      // Verify the updated representation is returned.
      await expect(result instanceof Promise).toBeTruthy()
      await expect(result).resolves.toMatchObject(require('./jest/data/contentset-update.json'))
    })
  })

  describe('Delete', () => {
    test('deleteContentSet - not found', async () => {
      fetchMock.mock({
        'https://cloudmanager.adobe.io/api/program/123/contentSet/321': 'DELETE',
        name: 'DELETE-https://cloudmanager.adobe.io/api/program/123/contentSet/321',
      }, 404)

      expect.assertions(2)
      const sdkClient = await createSdkClient()
      const result = sdkClient.deleteContentSet('123', '321')

      await expect(result instanceof Promise).toBeTruthy()
      await expect(result).rejects.toEqual(
        new codes.ERROR_DELETE_CONTENTSET({ messageValues: 'https://cloudmanager.adobe.io/api/program/123/contentSet/321 (404 Not Found)' }),
      )
    })

    test('deleteContentSet', async () => {
      fetchMock.mock({
        'https://cloudmanager.adobe.io/api/program/1234/contentSet/456': 'DELETE',
        name: 'DELETE-https://cloudmanager.adobe.io/api/program/123/contentSet/456',
      }, 204)

      expect.assertions(2)
      const sdkClient = await createSdkClient()
      const result = sdkClient.deleteContentSet('1234', '456')

      await expect(result instanceof Promise).toBeTruthy()
      await expect(result).resolves.toEqual({})
    })
  })
})
