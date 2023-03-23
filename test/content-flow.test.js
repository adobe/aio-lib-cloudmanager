/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the 'License');
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { codes } = require('../src/SDKErrors')

/* global createSdkClient, fetchMock */ // for linter

describe('Content Flow', () => {
  beforeEach(() => {
    fetchMock.reset()
  })

  describe('Create', () => {
    test('createContentFlow not found ', async () => {
      fetchMock.mock({
        'https://cloudmanager.adobe.io/api/program/12345/environment/9999/contentFlow': 'POST',
        name: 'POST-https://cloudmanager.adobe.io/api/program/12345/environment/9999/contentFlow',
      },
      404)

      expect.assertions(2)
      const sdkClient = await createSdkClient()
      const result = sdkClient.createContentFlow('12345', '9999')

      await expect(result instanceof Promise).toBeTruthy()
      await expect(result).rejects.toEqual(
        new codes.ERROR_CREATE_CONTENTFLOW({ messageValues: 'https://cloudmanager.adobe.io/api/program/12345/environment/9999/contentFlow (404 Not Found)' }))
    })

    test('createContentFlow no body', async () => {
      fetchMock.mock({
        'https://cloudmanager.adobe.io/api/program/1234/environment/9999/contentFlow': 'POST',
        name: 'POST-https://cloudmanager.adobe.io/api/program/1234/environment/9999/contentFlow',
      }, 400)

      expect.assertions(2)
      const sdkClient = await createSdkClient()
      const result = sdkClient.createContentFlow('1234', '9999')

      await expect(result instanceof Promise).toBeTruthy()
      await expect(result).rejects.toEqual(
        new codes.ERROR_CREATE_CONTENTFLOW({ messageValues: 'https://cloudmanager.adobe.io/api/program/1234/environment/9999/contentFlow (400 Bad Request)' }))
    })

    test('createContentFlow', async () => {
      fetchMock.mock({
        'https://cloudmanager.adobe.io/api/program/1234/environment/987/contentFlow': 'POST',
        name: 'POST-https://cloudmanager.adobe.io/api/program/1234/environment/987/contentFlow',
      },
      require('./jest/data/contentflow-create-response.json'))

      expect.assertions(2)
      const sdkClient = await createSdkClient()
      const result = sdkClient.createContentFlow('1234', '987', require('./jest/data/contentflow-create.json'))

      await expect(result instanceof Promise).toBeTruthy()
      await expect(result).resolves.toMatchObject({
        contentSetId: '7057',
        contentSetName: 'AIO Lib test',
        srcEnvironmentId: '164900',
        srcEnvironmentName: 'aio-test-prod',
        destEnvironmentId: '164901',
        destEnvironmentName: 'aio-test-stage',
        tier: 'author',
        status: 'IN_PROGRESS',
        contentFlowId: '10012',
        programId: '67406',
        destProgramId: '67406',
      })
    })
  })
  describe('Get', () => {
    test('getContentFlow', async () => {
      fetchMock.mock({
        'https://cloudmanager.adobe.io/api/program/1234/contentFlow/987': 'GET',
        name: 'GET-https://cloudmanager.adobe.io/api/program/1234/environment/987/contentFlow',
      },
      require('./jest/data/contentflow-get.json'))

      expect.assertions(2)
      const sdkClient = await createSdkClient()
      const result = sdkClient.getContentFlow('1234', '987')

      await expect(result instanceof Promise).toBeTruthy()
      await expect(result).resolves.toMatchObject({
        contentFlowId: '9303',
        contentSetName: 'One path two ptah',
        srcEnvironmentId: '164900',
        destEnvironmentId: '164901',
        tier: 'author',
        programId: '67406',
      })
    })

    test('getContentFlow - not found', async () => {
      fetchMock.mock({
        'https://cloudmanager.adobe.io/api/program/123/contentFlow/123': 'GET',
        name: 'GET-https://cloudmanager.adobe.io/api/program/123/contenFlow/123',
      }, 404)

      expect.assertions(2)
      const sdkClient = await createSdkClient()

      const result = sdkClient.getContentFlow('123', '123')
      await expect(result instanceof Promise).toBeTruthy()
      await expect(result).rejects.toEqual(
        new codes.ERROR_GET_CONTENTFLOW({ messageValues: 'https://cloudmanager.adobe.io/api/program/123/contentFlow/123 (404 Not Found)' }),
      )
    })
  })

  describe('List', () => {
    test('listContentFlows', async () => {
      fetchMock.mock({
        'https://cloudmanager.adobe.io/api/program/1234/contentFlows': 'GET',
        name: 'GET-hhttps://cloudmanager.adobe.io/api/program/1234/contentFlows',
      },
      require('./jest/data/contentflow-list.json'))

      expect.assertions(2)
      const sdkClient = await createSdkClient()
      const result = sdkClient.listContentFlows('1234')

      await expect(result instanceof Promise).toBeTruthy()
      await expect(result).resolves.toMatchObject([
        {
          contentSetId: '6402',
          contentSetName: 'One path two ptah',
          srcEnvironmentId: '164900',
          srcEnvironmentName: 'aio-test-prod',
          destEnvironmentId: '164901',
          destEnvironmentName: 'aio-test-stage',
          tier: 'author',
          contentFlowId: '9303',
        },
        {
          contentSetId: '6402',
          contentSetName: 'One path two ptah',
          srcEnvironmentId: '164900',
          srcEnvironmentName: 'aio-test-prod',
          destEnvironmentId: '164901',
          destEnvironmentName: 'aio-test-stage',
          tier: 'author',
          contentFlowId: '9302',
          programId: '67406',
          destProgramId: '67406',
        }])
    })

    test('listContentFlows - not found', async () => {
      fetchMock.mock({
        'https://cloudmanager.adobe.io/api/program/123/contentFlows': 'GET',
        name: 'GET-https://cloudmanager.adobe.io/api/program/123/contenFlows',
      }, 404)

      expect.assertions(2)
      const sdkClient = await createSdkClient()

      const result = sdkClient.listContentFlows('123')
      await expect(result instanceof Promise).toBeTruthy()
      await expect(result).rejects.toEqual(
        new codes.ERROR_LIST_CONTENTFLOWS({ messageValues: 'https://cloudmanager.adobe.io/api/program/123/contentFlows (404 Not Found)' }),
      )
    })
  })

  describe('Cancel', () => {
    test('cancelContentFlow not found ', async () => {
      fetchMock.mock({
        'https://cloudmanager.adobe.io/api/program/1234/contentFlow/9876': 'DELETE',
        name: 'DELETE-https://cloudmanager.adobe.io/api/program/1234/contentFlow/9876',
      }, 404)

      expect.assertions(2)
      const sdkClient = await createSdkClient()
      const result = sdkClient.cancelContentFlow('1234', '9876')

      await expect(result instanceof Promise).toBeTruthy()
      await expect(result).rejects.toEqual(
        new codes.ERROR_CANCEL_CONTENTFLOW({ messageValues: 'https://cloudmanager.adobe.io/api/program/1234/contentFlow/9876 (404 Not Found)' }),
      )
    })

    test('cancelContentFlow', async () => {
      fetchMock.mock({
        'https://cloudmanager.adobe.io/api/program/1234/contentFlow/987': 'DELETE',
        name: 'DELETE-https://cloudmanager.adobe.io/api/program/1234/contentFlow/9876',
      }, 200)

      expect.assertions(2)
      const sdkClient = await createSdkClient()
      const result = sdkClient.cancelContentFlow('1234', '987')

      await expect(result instanceof Promise).toBeTruthy()
      await expect(result).resolves.toMatchObject({})
    })
  })
})
