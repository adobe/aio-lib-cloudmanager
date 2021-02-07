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

/* global createSdkClient, fetchMock, mockFetchResponseWithMethod */ // for linter
test('listPipelines - success empty', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.listPipelines('4')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual([])
})

test('listPipelines - success', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.listPipelines('5')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toMatchObject([{
    id: '5',
    name: 'test1',
    status: 'IDLE',
  },
  {
    id: '6',
    name: 'test2',
    status: 'BUSY',
  },
  {
    id: '7',
    name: 'test3',
    status: 'BUSY',
  },
  {
    id: '8',
    name: 'test4',
    status: 'IDLE',
  }])
})

test('listPipelines - program in programs list but not found', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.listPipelines('7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_PROGRAM({ messageValues: 'https://cloudmanager.adobe.io/api/program/7 (404 Not Found)' }),
  )
})

test('listPipelines - program doesnt exist', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.listPipelines('8')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_PROGRAM({ messageValues: '8' }),
  )
})

test('deletePipeline - delete pipeline returns 400', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.deletePipeline('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_DELETE_PIPELINE({ messageValues: 'https://cloudmanager.adobe.io/api/program/5/pipeline/7 (400 Bad Request) - Test Exception(s): some error message' }),
  )
})

test('deletePipeline - bad pipeline', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.deletePipeline('5', '10')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_PIPELINE({ messageValues: ['10', '5'] }),
  )
})

test('deletePipeline - success', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.deletePipeline('5', '5')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
})

test('updatePipeline - bad pipeline', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.updatePipeline('5', '10')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_PIPELINE({ messageValues: ['10', '5'] }),
  )
})

test('updatePipeline - failure pipeline', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.updatePipeline('5', '8', {
    branch: 'develop',
  })

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_UPDATE_PIPELINE({ messageValues: 'https://cloudmanager.adobe.io/api/program/5/pipeline/8 (405 Method Not Allowed)' }),
  )
})

test('updatePipeline - branch success', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.updatePipeline('5', '5', {
    branch: 'develop',
  })

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toMatchObject({
    phases: expect.arrayContaining([{
      name: 'BUILD_1',
      branch: 'develop',
      type: 'BUILD',
      repositoryId: '1',
    }]),
  })
})

test('updatePipeline - repository and branch success', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.updatePipeline('5', '5', {
    branch: 'develop',
    repositoryId: '4',
  })

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toMatchObject({
    phases: expect.arrayContaining([{
      name: 'BUILD_1',
      branch: 'develop',
      type: 'BUILD',
      repositoryId: '4',
    }]),
  })
})

test('getPipelineVariables - pipelines not found', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getPipelineVariables('6', '1')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_LIST_PIPELINES({ messageValues: 'https://cloudmanager.adobe.io/api/program/6/pipelines (404 Not Found)' }),
  )
})

test('getPipelineVariables - no pipeline', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getPipelineVariables('4', '4')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_PIPELINE({ messageValues: ['4', '4'] }),
  )
})

test('getPipelineVariables - no variables link', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getPipelineVariables('5', '6')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_VARIABLES_LINK_PIPELINE({ messageValues: ['6', '5'] }),
  )
})

test('getPipelineVariables - link returns 404', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getPipelineVariables('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_VARIABLES({ messageValues: 'https://cloudmanager.adobe.io/api/program/5/pipeline/7/variables (404 Not Found)' }),
  )
})

test('getPipelineVariables - success empty', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getPipelineVariables('5', '8')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual([])
})

test('getPipelineVariables - success', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getPipelineVariables('5', '5')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toMatchObject([{
    name: 'KEY',
    type: 'string',
    value: 'value',
  }, {
    name: 'I_AM_A_SECRET',
    type: 'secretString',
  }])
})

test('setPipelineVariables - pipelines not found', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.setPipelineVariables('6', '1')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_LIST_PIPELINES({ messageValues: 'https://cloudmanager.adobe.io/api/program/6/pipelines (404 Not Found)' }),
  )
})

test('setPipelineVariables - no pipeline', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.setPipelineVariables('4', '4')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_PIPELINE({ messageValues: ['4', '4'] }),
  )
})

test('setPipelineVariables - no variables link', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.setPipelineVariables('5', '6')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_VARIABLES_LINK_PIPELINE({ messageValues: ['6', '5'] }),
  )
})

test('setPipelineVariables - PATCH fails', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.setPipelineVariables('5', '8', [
    {
      name: 'foo',
      value: 'bar',
      type: 'string',
    },
  ])

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_SET_VARIABLES({ messageValues: 'https://cloudmanager.adobe.io/api/program/5/pipeline/8/variables (400 Bad Request)' }),
  )
})

test('setPipelineVariables - variables only', async () => {
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.setPipelineVariables('5', '5', [
    {
      name: 'foo',
      type: 'string',
      value: 'bar',
    }, {
      name: 'foo2',
      type: 'string',
      value: 'bar2',
    },
  ])

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toBeTruthy()
  const patchCall = fetchMock.calls().find(call => call[0] === 'https://cloudmanager.adobe.io/api/program/5/pipeline/5/variables' && call[1].method === 'PATCH')
  await expect(JSON.parse(patchCall[1].body)).toMatchObject([{
    name: 'foo',
    type: 'string',
    value: 'bar',
  }, {
    name: 'foo2',
    type: 'string',
    value: 'bar2',
  }])
})

test('setPipelineVariables - secrets only', async () => {
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.setPipelineVariables('5', '5', [
    {
      name: 'foo',
      type: 'secretString',
      value: 'bar',
    }, {
      name: 'foo2',
      type: 'secretString',
      value: 'bar2',
    },
  ])

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toBeTruthy()
  const patchCall = fetchMock.calls().find(call => call[0] === 'https://cloudmanager.adobe.io/api/program/5/pipeline/5/variables' && call[1].method === 'PATCH')
  await expect(JSON.parse(patchCall[1].body)).toMatchObject([{
    name: 'foo',
    type: 'secretString',
    value: 'bar',
  }, {
    name: 'foo2',
    type: 'secretString',
    value: 'bar2',
  }])
})

test('listExecutions - 404 on executions link', async () => {
  mockFetchResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/5/executions', 'GET', 404)

  const sdkClient = await createSdkClient()
  const result = sdkClient.listExecutions('5', '5')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_LIST_EXECUTIONS({ messageValues: 'https://cloudmanager.adobe.io/api/program/5/pipeline/5/executions (404 Not Found)' }),
  )
  const getExecutionCalls = fetchMock.calls().filter(call => call[0].indexOf('https://cloudmanager.adobe.io/api/program/5/pipeline/5/executions') === 0 && call[1].method === 'GET')
  expect(getExecutionCalls.length).toBe(1)
})

test('listExecutions - page has more than limit', async () => {
  mockFetchResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/5/executions', 'GET', {
    _links: {
      next: {
        href: '/api/program/5/pipeline/5/executions?page=2',
      },
    },
    _embedded: {
      executions: [
        {}, // 1
        {}, // 2
        {}, // 3
        {}, // 4
        {}, // 5
        {}, // 6
        {}, // 7
        {}, // 8
        {}, // 9
        {}, // 10
        {}, // 11
        {}, // 12
      ],
    },
  })

  const sdkClient = await createSdkClient()
  const result = sdkClient.listExecutions('5', '5', 10)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toHaveLength(10)
  const getExecutionCalls = fetchMock.calls().filter(call => call[0].indexOf('https://cloudmanager.adobe.io/api/program/5/pipeline/5/executions') === 0 && call[1].method === 'GET')
  expect(getExecutionCalls.length).toBe(1)
})

test('listExecutions - second page is empty', async () => {
  mockFetchResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/5/executions', 'GET', {
    _links: {
      next: {
        href: '/api/program/5/pipeline/5/executions?page=2',
      },
    },
    _embedded: {
      executions: [
        {}, // 1
        {}, // 2
        {}, // 3
        {}, // 4
        {}, // 5
        {}, // 6
        {}, // 7
        {}, // 8
        {}, // 9
        {}, // 10
        {}, // 11
        {}, // 12
      ],
    },
  })
  mockFetchResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/5/executions?page=2', 'GET', {
    _embedded: {
      executions: [
      ],
    },
  })

  const sdkClient = await createSdkClient()
  const result = sdkClient.listExecutions('5', '5', 15)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toHaveLength(12)
  const getExecutionCalls = fetchMock.calls().filter(call => call[0].indexOf('https://cloudmanager.adobe.io/api/program/5/pipeline/5/executions') === 0 && call[1].method === 'GET')
  expect(getExecutionCalls.length).toBe(2)
})

test('listExecutions - no link to second page', async () => {
  mockFetchResponseWithMethod('https://cloudmanager.adobe.io/api/program/5/pipeline/5/executions', 'GET', {
    _embedded: {
      executions: [
        {}, // 1
        {}, // 2
        {}, // 3
        {}, // 4
        {}, // 5
        {}, // 6
        {}, // 7
        {}, // 8
        {}, // 9
        {}, // 10
        {}, // 11
        {}, // 12
      ],
    },
  })

  const sdkClient = await createSdkClient()
  const result = sdkClient.listExecutions('5', '5', 15)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toHaveLength(12)
  const getExecutionCalls = fetchMock.calls().filter(call => call[0].indexOf('https://cloudmanager.adobe.io/api/program/5/pipeline/5/executions') === 0 && call[1].method === 'GET')
  expect(getExecutionCalls.length).toBe(1)
})
