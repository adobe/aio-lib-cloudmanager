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
test('listPrograms - failure', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient('not-found')
  const result = sdkClient.listPrograms()

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_LIST_PROGRAMS({ messageValues: 'https://cloudmanager.adobe.io/api/programs (404 Not Found)' }),
  )
})

test('listPrograms - forbideen', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient('forbidden')
  const result = sdkClient.listPrograms()

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_LIST_PROGRAMS({ messageValues: 'https://cloudmanager.adobe.io/api/programs (403 Forbidden) - Detail: some message (Code: 1234)' }),
  )
})

test('listPrograms - unauthorized', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient('unauthorized')
  const result = sdkClient.listPrograms()

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_LIST_PROGRAMS({ messageValues: 'https://cloudmanager.adobe.io/api/programs (401 Unauthorized)' }),
  )
})

test('listPrograms - success empty', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient('empty')
  const result = sdkClient.listPrograms()

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual([])
})

test('list-programs - success', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.listPrograms()

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toMatchObject([{
    id: '4',
    name: 'test0',
    enabled: true,
  }, {
    id: '5',
    name: 'test1',
    enabled: true,
  },
  {
    id: '6',
    name: 'test2',
    enabled: false,
  },
  {
    id: '7',
    name: 'test3',
    enabled: true,
  },
  {
    id: '9',
    name: 'test4',
    enabled: true,
  }])
})

test('deleteProgram - delete program returns 400', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.deleteProgram('5')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_DELETE_PROGRAM({ messageValues: 'https://cloudmanager.adobe.io/api/program/5 (400 Bad Request) - Test Exception(s): some error' }),
  )
})

test('deleteProgram - bad program', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.deleteProgram('11')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_PROGRAM({ messageValues: '11' }),
  )
})

test('deleteProgram - success', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.deleteProgram('6')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toBeTruthy()
})

test('listIpAllowlists - no link', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.listIpAllowlists('5')
  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_NO_IP_ALLOWLISTS({ messageValues: '5' }),
  )
})

test('listIpAllowlists - fail', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.listIpAllowlists('9')
  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_LIST_IP_ALLOWLISTS({ messageValues: 'https://cloudmanager.adobe.io/api/program/9/ipAllowlists (400 Bad Request)' }),
  )
})

test('listIpAllowlists - empty', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.listIpAllowlists('6')
  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toHaveLength(0)
})

test('listIpAllowlists - non-empty', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.listIpAllowlists('4')
  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toHaveLength(2)
})

test('createIpAllowlist - ok', async () => {
  expect.assertions(4)

  const sdkClient = await createSdkClient()
  const result = sdkClient.createIpAllowlist('4', 'testnew', ['192.168.1.0/10'])
  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toBeTruthy()
  await expect(result).resolves.toMatchObject({
    id: '3',
    name: 'testnew',
  })
  const postCall = fetchMock.calls().find(call => call[0] === 'https://cloudmanager.adobe.io/api/program/4/ipAllowlists' && call[1].method === 'POST')
  await expect(JSON.parse(postCall[1].body)).toMatchObject({
    programId: '4',
    name: 'testnew',
    ipCidrSet: ['192.168.1.0/10'],
  })
})

test('createIpAllowlist - existing name', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.createIpAllowlist('4', 'test', ['192.168.1.0/10'])
  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_CREATE_IP_ALLOWLIST({ messageValues: 'https://cloudmanager.adobe.io/api/program/4/ipAllowlists (400 Bad Request) - IP Allowlist Error(s): IP Allowlist name should be unique' }),
  )
})

test('createIpAllowlist - fails no body', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.createIpAllowlist('6', 'testnew', ['192.168.1.0/10'])
  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_CREATE_IP_ALLOWLIST({ messageValues: 'https://cloudmanager.adobe.io/api/program/6/ipAllowlists (400 Bad Request)' }),
  )
})

test('updateIpAllowlist - not-found', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.updateIpAllowlist('6', '1')
  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_IP_ALLOWLIST({ messageValues: ['1', '6'] }),
  )
})

test('updateIpAllowlist - found', async () => {
  expect.assertions(6)

  const sdkClient = await createSdkClient()
  const result = sdkClient.updateIpAllowlist('4', '1', ['192.168.1.0/10'])
  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toBeTruthy()
  const putCall = fetchMock.calls().find(call => call[0] === 'https://cloudmanager.adobe.io/api/program/4/ipAllowlist/1' && call[1].method === 'PUT')
  await expect(putCall).toBeTruthy()
  await expect(JSON.parse(putCall[1].body).ipCidrSet).toEqual(['192.168.1.0/10'])
  await expect(JSON.parse(putCall[1].body)).not.toHaveProperty('_links')
  await expect(JSON.parse(putCall[1].body)).not.toHaveProperty('bindings')
})

test('updateIpAllowlist - fails', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.updateIpAllowlist('4', '2', ['192.168.1.0/10'])
  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_UPDATE_IP_ALLOWLIST({ messageValues: 'https://cloudmanager.adobe.io/api/program/4/ipAllowlist/2 (400 Bad Request)' }),
  )
})

test('deleteIpAllowlist - found', async () => {
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.deleteIpAllowlist('4', '1')
  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toBeTruthy()
  expect(
    fetchMock.calls().find(call => call[0] === 'https://cloudmanager.adobe.io/api/program/4/ipAllowlist/1' && call[1].method === 'DELETE'),
  ).toBeTruthy()
})

test('deleteIpAllowlist - fails', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.deleteIpAllowlist('4', '2', ['192.168.1.0/10'])
  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_DELETE_IP_ALLOWLIST({ messageValues: 'https://cloudmanager.adobe.io/api/program/4/ipAllowlist/2 (400 Bad Request)' }),
  )
})

test('addIpAllowlistBinding - success', async () => {
  expect.assertions(4)

  const sdkClient = await createSdkClient()
  const result = sdkClient.addIpAllowlistBinding('4', '1', '5', 'author')
  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toBeTruthy()
  const postCall = fetchMock.calls().find(call => call[0] === 'https://cloudmanager.adobe.io/api/program/4/ipAllowlist/1/bindings' && call[1].method === 'POST')
  await expect(postCall).toBeTruthy()
  await expect(JSON.parse(postCall[1].body)).toEqual({
    environmentId: '5',
    tier: 'author',
  })
})

test('addIpAllowlistBinding - fails', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.addIpAllowlistBinding('4', '2', '5', 'author')
  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_CREATE_IP_ALLOWLIST_BINDING({ messageValues: 'https://cloudmanager.adobe.io/api/program/4/ipAllowlist/2/bindings (400 Bad Request)' }),
  )
})

test('removeIpAllowlistBinding - success', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.removeIpAllowlistBinding('4', '1', '5', 'publish')
  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toBeTruthy()
})

test('removeIpAllowlistBinding - fails', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.removeIpAllowlistBinding('4', '1', '6', 'publish')
  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_DELETE_IP_ALLOWLIST_BINDING({ messageValues: 'https://cloudmanager.adobe.io/api/program/4/ipAllowlist/1/binding/2 (400 Bad Request)' }),
  )
})

test('removeIpAllowlistBinding - not found', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.removeIpAllowlistBinding('4', '1', '5', 'author')
  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_IP_ALLOWLIST_BINDING({ messageValues: ['1', '5', 'author', '4'] }),
  )
})
