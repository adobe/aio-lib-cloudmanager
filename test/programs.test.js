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

/* global createSdkClient */ // for linter
test('listPrograms - failure', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient('not-found')
  const result = sdkClient.listPrograms()

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_LIST_PROGRAMS({ messageValues: 'https://cloudmanager.adobe.io/api/programs (404 Not Found)' })
  )
})

test('listPrograms - forbideen', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient('forbidden')
  const result = sdkClient.listPrograms()

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_LIST_PROGRAMS({ messageValues: 'https://cloudmanager.adobe.io/api/programs (403 Forbidden) - Detail: some message (Code: 1234)' })
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
    enabled: true
  }, {
    id: '5',
    name: 'test1',
    enabled: true
  },
  {
    id: '6',
    name: 'test2',
    enabled: false
  },
  {
    id: '7',
    name: 'test3',
    enabled: true
  }])
})

test('deleteProgram - delete program returns 400', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.deleteProgram('5')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_DELETE_PROGRAM({ messageValues: 'https://cloudmanager.adobe.io/api/program/5 (400 Bad Request) - Test Exception(s): some error' })
  )
})

test('deleteProgram - bad program', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.deleteProgram('11')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_PROGRAM({ messageValues: '11' })
  )
})

test('deleteProgram - success', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.deleteProgram('6')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toBeTruthy()
})
