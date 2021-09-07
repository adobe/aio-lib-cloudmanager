/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { codes } = require('../src/SDKErrors')
const halfred = require('halfred')

/* global createSdkClient */ // for linter

test('postCommerceCommandExecution - success', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.postCommerceCommandExecution('4', '10', { data: 'some test data' })

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual(halfred.parse({
    status: 201,
    data: {
      test: 'test success data',
    },
  }))
})

test('postCommerceCommandExecution - error', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.postCommerceCommandExecution('4', '3', { data: 'some test data' })

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_POST_COMMERCE_CLI({ messageValues: 'https://cloudmanager.adobe.io/api/program/4/environment/3/runtime/commerce/cli/ (403 Forbidden)' }),
  )
})

test('postCommerceCommandExecution - error: no link', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.postCommerceCommandExecution('4', '11', { data: 'some test data' })

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_COMMERCE_CLI({ messageValues: '11' }),
  )
})

test('getCommerceCommandExecution - error: failure to find correct environment', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getCommerceCommandExecution('4', '3')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_COMMERCE_CLI({ messageValues: 'https://cloudmanager.adobe.io/api/program/4/environment/3/runtime/commerce/command-execution/ (403 Forbidden)' }),
  )
})

test('getCommerceCommandExecution - error: failure to retrieve environments', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getCommerceCommandExecution('6', '7', '8')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_RETRIEVE_ENVIRONMENTS({ messageValues: 'https://cloudmanager.adobe.io/api/program/6/environments (404 Not Found)' }),
  )
})

test('getCommerceCommandExecution - error: no link', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getCommerceCommandExecution('4', '11')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_COMMERCE_CLI({ messageValues: '11' }),
  )
})

test('getCommerceCommandExecution - success', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getCommerceCommandExecution('4', '10', '1')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toMatchObject(halfred.parse({
    id: 1,
    status: 'RUNNNG', // PENDING, RUNNING, COMPLETED, FAILED
    type: 'bin/magento', // bin/magento, bin/ece-tools
    command: 'test command to be executed',
    message: 'One line message on the progress of command',
    options: ['Optional', 'inputs provided part of the command'],
    startedAt: 'timestamp UTC',
    completedAt: 'timestamp utc',
    startedBy: 'test runner',
    _links: {
      self: {
        href: '/api/program/4/environment/10/runtime/commerce/command-execution/1',
      },
      'http://ns.adobe.com/adobecloud/rel/program': {
        href: '/api/program/4',
      },
      'http://ns.adobe.com/adobecloud/rel/environments': {
        href: '/api/program/4/environments',
      },
      'http://ns.adobe.com/adobecloud/rel/commerceCommandExecutions': {
        href: '/api/program/4/environment/10/runtime/commerce/command-executions',
      },
    },
  }))
})

test('getCommerceCommandExecutions - error: failure to find correct environment', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getCommerceCommandExecutions('4', '3')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_COMMERCE_CLI({ messageValues: 'https://cloudmanager.adobe.io/api/program/4/environment/10/runtime/commerce/command-executions (403 Forbidden)' }),
  )
})

test('getCommerceCommandExecutions - error: failure to retrieve environments', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getCommerceCommandExecutions('6', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_RETRIEVE_ENVIRONMENTS({ messageValues: 'https://cloudmanager.adobe.io/api/program/6/environments (404 Not Found)' }),
  )
})

test('getCommerceCommandExecutions - error: no link', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getCommerceCommandExecutions('4', '11')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_COMMERCE_CLI({ messageValues: '11' }),
  )
})

test('getCommerceCommandExecutions - success', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getCommerceCommandExecutions('4', '10', 'bin/magento', 'COMPLETE', 'cache:clean')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toMatchObject(halfred.parse({
    _embedded: {
      commandExecutions: [
        {
          _links: {
            'http://ns.adobe.com/adobecloud/rel/commerceCommandExecution': {
              href: '/api/program/4/environment/10/runtime/commerce/command-execution/2553',
              templated: false,
            },
            'http://ns.adobe.com/adobecloud/rel/commerceCommandExecution/logs': {
              href: '/api/program/4/environment/10/runtime/commerce/command-execution/2553/logs',
              templated: false,
            },
            'http://ns.adobe.com/adobecloud/rel/environment': {
              href: '/api/program/4/environment/10',
              templated: false,
            },
          },
          id: 2553,
          type: 'bin/magento',
          command: 'cache:clean',
          options: [],
          startedBy: 'E64A64C360706AD20A494012@techacct.adobe.com',
          startedAt: '2021-08-31T15:31:16.901+0000',
          completedAt: '2021-08-31T15:32:18.000+0000',
          name: 'magento-cli-2553',
          status: 'COMPLETED',
          environmentId: 180972,
        },
      ],
    },
    _totalNumberOfItems: 1,
    _page: {
      limit: 20,
      property: [],
      next: 20,
      prev: 0,
    },
  }).embeddedArray('commandExecutions'))
})
