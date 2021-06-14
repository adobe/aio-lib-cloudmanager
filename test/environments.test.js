
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

/* global createSdkClient, fetchMock */ // for linter

beforeEach(() => {
  fetchMock.resetProgram4EmbeddedEnvironments()
})

test('listEnvironments - failure', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.listEnvironments('6')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_RETRIEVE_ENVIRONMENTS({ messageValues: 'https://cloudmanager.adobe.io/api/program/6/environments (404 Not Found)' }),
  )
})

test('listEnvironments - success empty', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.listEnvironments('5')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual([])
})

test('listEnvironments - no embedded list', async () => {
  fetchMock.setProgram4EmbeddedEnvironmentsToEmptyObject()
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.listEnvironments('4')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_ENVIRONMENTS({ messageValues: '4' }),
  )
})

test('listEnvironments - success', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.listEnvironments('4')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toMatchObject([{
    id: '1',
    name: 'TestProgram_prod',
    type: 'prod',
  },
  {
    id: '2',
    name: 'TestProgram_stage',
    type: 'stage',
  },
  {
    id: '3',
    name: 'TestProgram_dev',
    type: 'dev',
  },
  {
    id: '10',
    name: 'TestProgram_dev2',
    type: 'dev',
  },
  {
    id: '11',
    name: 'TestProgram_dev3',
    type: 'dev',
  }])
})

test('listEnvironments - bad program', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.listEnvironments('8')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_PROGRAM({ messageValues: '8' }),
  )
})

test('listAvailableLogOptions - failure', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.listAvailableLogOptions('6', '1')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_RETRIEVE_ENVIRONMENTS({ messageValues: 'https://cloudmanager.adobe.io/api/program/6/environments (404 Not Found)' }),
  )
})

test('listAvailableLogOptions - success undefined', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.listAvailableLogOptions('4', '3')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual([])
})

test('listAvailableLogOptions - success empty', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.listAvailableLogOptions('4', '2')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual([])
})

test('listAvailableLogOptions - success', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.listAvailableLogOptions('4', '1')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toMatchObject([{
    service: 'author',
    name: 'aemerror',
  },
  {
    service: 'author',
    name: 'aemrequest',
  },
  {
    service: 'author',
    name: 'aemaccess',
  },
  {
    service: 'publish',
    name: 'aemerror',
  },
  {
    service: 'publish',
    name: 'aemrequest',
  },
  {
    service: 'publish',
    name: 'aemaccess',
  },
  {
    service: 'dispatcher',
    name: 'httpdaccess',
  },
  {
    service: 'dispatcher',
    name: 'httpderror',
  },
  {
    service: 'dispatcher',
    name: 'aemdispatcher',
  }])
})

test('listAvailableLogOptions - bad program', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.listAvailableLogOptions('8', '1')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_PROGRAM({ messageValues: '8' }),
  )
})

test('listAvailableLogOptions - bad environment', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.listAvailableLogOptions('4', '5')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_ENVIRONMENT({ messageValues: ['5', '4'] }),
  )
})

test('openDeveloperConsoleUrl - failure', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getDeveloperConsoleUrl('4', '5')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_ENVIRONMENT({ messageValues: ['5', '4'] }),
  )
})

test('openDeveloperConsoleUrl - missing properties', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getDeveloperConsoleUrl('4', '3')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_NO_DEVELOPER_CONSOLE({ messageValues: ['3', '4'] }),
  )
})

test('openDeveloperConsoleUrl - success hal', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getDeveloperConsoleUrl('4', '1')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual('https://github.com/adobe/aio-cli-plugin-cloudmanager')
})

test('openDeveloperConsoleUrl - success props', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getDeveloperConsoleUrl('4', '2')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual('https://dev-console-ns.cs.dev.adobeaemcloud.com/dc/')
})

test('openDeveloperConsoleUrl - bad program', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getDeveloperConsoleUrl('8', '1')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_PROGRAM({ messageValues: '8' }),
  )
})

test('openDeveloperConsoleUrl - bad environment', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getDeveloperConsoleUrl('4', '5')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_ENVIRONMENT({ messageValues: ['5', '4'] }),
  )
})

test('getEnvironmentVariables - environments not found', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getEnvironmentVariables('6', '1')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_RETRIEVE_ENVIRONMENTS({ messageValues: 'https://cloudmanager.adobe.io/api/program/6/environments (404 Not Found)' }),
  )
})

test('getEnvironmentVariables - no environment', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getEnvironmentVariables('4', '4')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_ENVIRONMENT({ messageValues: ['4', '4'] }),
  )
})

test('getEnvironmentVariables - no variables link', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getEnvironmentVariables('4', '2')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_VARIABLES_LINK_ENVIRONMENT({ messageValues: ['2', '4'] }),
  )
})

test('getEnvironmentVariables - link returns 404', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getEnvironmentVariables('4', '10')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_VARIABLES({ messageValues: 'https://cloudmanager.adobe.io/api/program/4/environment/10/variables (404 Not Found)' }),
  )
})

test('getEnvironmentVariables - success empty', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getEnvironmentVariables('4', '3')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual([])
})

test('getEnvironmentVariables - success', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getEnvironmentVariables('4', '1')

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

test('setEnvironmentVariables - environments not found', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.setEnvironmentVariables('6', '1')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_RETRIEVE_ENVIRONMENTS({ messageValues: 'https://cloudmanager.adobe.io/api/program/6/environments (404 Not Found)' }),
  )
})

test('setEnvironmentVariables - no environment', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.setEnvironmentVariables('4', '4')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_ENVIRONMENT({ messageValues: ['4', '4'] }),
  )
})

test('setEnvironmentVariables - no variables link', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.setEnvironmentVariables('4', '2')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_VARIABLES_LINK_ENVIRONMENT({ messageValues: ['2', '4'] }),
  )
})

test('setEnvironmentVariables - PATCH fails', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.setEnvironmentVariables('4', '11', [
    {
      name: 'foo',
      type: 'string',
      value: 'bar',
    },
  ])

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_SET_VARIABLES({ messageValues: 'https://cloudmanager.adobe.io/api/program/4/environment/11/variables (400 Bad Request) - Validation Error(s): some error' }),
  )
})

test('setEnvironmentVariables - success empty', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.setEnvironmentVariables('4', '3', [])

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toBeTruthy()
})

test('setEnvironmentVariables - variables only', async () => {
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.setEnvironmentVariables('4', '1', [
    {
      name: 'foo',
      type: 'string',
      value: 'bar',
    },
    {
      name: 'foo2',
      type: 'string',
      value: 'bar2',
    },
  ])

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toBeTruthy()
  const patchCall = fetchMock.calls().find(call => call[0] === 'https://cloudmanager.adobe.io/api/program/4/environment/1/variables' && call[1].method === 'PATCH')
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

test('setEnvironmentVariables - secrets only', async () => {
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.setEnvironmentVariables('4', '1', [
    {
      name: 'foo',
      type: 'secretString',
      value: 'bar',
    },
    {
      name: 'foo2',
      type: 'secretString',
      value: 'bar2',
    },
  ])

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toBeTruthy()
  const patchCall = fetchMock.calls().find(call => call[0] === 'https://cloudmanager.adobe.io/api/program/4/environment/1/variables' && call[1].method === 'PATCH')
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

test('setEnvironmentVariables - secret and variable', async () => {
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.setEnvironmentVariables('4', '1', [
    {
      name: 'foo',
      type: 'string',
      value: 'bar',
    },
    {
      name: 'foo2',
      type: 'secretString',
      value: 'bar2',
    },
  ])

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toBeTruthy()
  const patchCall = fetchMock.calls().find(call => call[0] === 'https://cloudmanager.adobe.io/api/program/4/environment/1/variables' && call[1].method === 'PATCH')
  await expect(JSON.parse(patchCall[1].body)).toMatchObject([{
    name: 'foo',
    type: 'string',
    value: 'bar',
  }, {
    name: 'foo2',
    type: 'secretString',
    value: 'bar2',
  }])
})

test('deleteEnvironment - delete environment returns 400', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.deleteEnvironment('4', '3')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_DELETE_ENVIRONMENT({ messageValues: 'https://cloudmanager.adobe.io/api/program/4/environment/3 (400 Bad Request) - Uncategorized Error(s): some error' }),
  )
})

test('deleteEnvironment - bad environment', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.deleteEnvironment('4', '12')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_ENVIRONMENT({ messageValues: ['12', '4'] }),
  )
})

test('deleteEnvironment - success', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.deleteEnvironment('4', '11')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toBeTruthy()
})
