/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { Writable } = require('stream')
const sinon = require('sinon')
const { codes } = require('../src/SDKErrors')

/* global createSdkClient, fetchMock */ // for linter

let writable
let written

let flushWritable

let originalSetTimeout

beforeEach(() => {
  written = ''
  const write = sinon.stub().callsFake((chunk, enc, callback) => callback())
  writable = new Writable({ write })

  flushWritable = () => {
    written = write.args.map(args => args[0]).map(a => a.toString('utf8')).join('')
  }

  writable.on('finish', flushWritable)

  originalSetTimeout = global.setTimeout
  global.setTimeout = jest.fn().mockImplementation((cb) => cb())
})

afterEach(() => {
  global.setTimeout = originalSetTimeout
  jest.spyOn(Date, 'now').mockRestore()
})

test('getCommerceTailLogs - success', async () => {
  expect.assertions(7)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailCommerceCommandExecutionLog('4', '10', '708', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual('COMPLETED')

  expect(fetchMock.calls('tail-log-1-first').length).toEqual(1)
  expect(fetchMock.calls('tail-log-1-second').length).toEqual(1)
  expect(fetchMock.calls('tail-log-1-third').length).toEqual(1)
  expect(fetchMock.calls('tail-log-1-fourth').length).toEqual(3)

  flushWritable()
  expect(written).toEqual('Cleaned cache types:\nconfig\ndetails\n')
})

test('getCommerceTailLogs - error: no log redirect', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailCommerceCommandExecutionLog('4', '10', '7090000', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_NO_LOG_REDIRECT({ messageValues: ['https://cloudmanager.adobe.io/api/program/4/pipeline/10/runtime/commerce/command-execution/7090000/logs', JSON.stringify({})] }),
  )
})

test('getCommerceTailLogs - error: log redirect error', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailCommerceCommandExecutionLog('4', '10', '7100000', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_LOG({ messageValues: ['https://cloudmanager.adobe.io/api/program/4/pipeline/10/runtime/commerce/command-execution/7100000/logs (404 Not Found)'] }),
  )
})

test('getCommerceTailLogs - error: no log url', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailCommerceCommandExecutionLog('4', '17', '7100000', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_NO_LOG_URL({ messageValues: '17' }),
  )
})

test('getCommerceTailLogs - error response from log endpoint', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailCommerceCommandExecutionLog('4', '10', '7110000', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_LOG({ messageValues: '7110000' }),
  )
})

test('getCommerceTailLogs - command status is "COMPLETED" -- success', async () => {
  expect.assertions(4)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailCommerceCommandExecutionLog('4', '10', '712', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual('COMPLETED')
  expect(fetchMock.calls('full-log-1-first').length).toEqual(1)

  flushWritable()
  expect(written).toEqual('This is the full log:\n')
})

test('getCommerceTailLogs - command status is "COMPLETED" -- failed', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailCommerceCommandExecutionLog('4', '10', '712f', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_LOG({ messageValues: ['https://cloudmanager.adobe.io/api/program/4/pipeline/10/runtime/commerce/command-execution/712f/logs (500 Internal Server Error)'] }),
  )
})

test('getCommerceTailLogs - command status is "FAILED"', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailCommerceCommandExecutionLog('4', '10', '712000', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_COMMAND_NOT_RUNNING({ messageValues: '712000' }),
  )
})
