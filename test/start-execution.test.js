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

test('startExecution - bad pipeline', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.startExecution('5', '10')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_PIPELINE_START({ messageValues: ['10', '5'] }),
  )
})

test('startExecution - failed 412', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.startExecution('5', '6')
  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_PIPELINE_START_RUNNING(),
  )
})

test('startExecution - failed 404', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.startExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_PIPELINE_START({ messageValues: 'https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution (404 Not Found)' }),
  )
})

test('startExecution - success', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.startExecution('5', '5')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual('https://cloudmanager.adobe.io/api/program/5/pipeline/5/execution/5000')
})

test('startExecution - alternate mode', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.startExecution('5', '5', 'EMERGENCY')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual('https://cloudmanager.adobe.io/api/program/5/pipeline/5/execution/6000')
})
