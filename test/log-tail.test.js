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
const { codes } = require('../src/SDKErrors')
const sinon = require('sinon')

/* global createSdkClient, fetchMock */ // for linter

let writable
let written = ''

let flushWritable

let originalSetTimeout

beforeEach(() => {
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

test('tail-log - failure -- no environment', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailLog('5', '17', 'author', 'aemerror', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_ENVIRONMENT({ messageValues: ['17', '5'] }),
  )
})

test('tail-log - failure -- no link', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailLog('4', '2', 'author', 'aemerror', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_LOGS_LINK_ENVIRONMENT({ messageValues: ['2', '4'] }),
  )
})

test('tail-log - failure -- no tail link', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailLog('4', '1', 'preview', 'aemaccess', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_TAIL_LOGS({ messageValues: ['1', '4'] }),
  )
})

test('tail-log - failure -- no logs', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailLog('4', '1', 'author', 'aemaccess', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_LOGS({ messageValues: ['1', '4'] }),
  )
})

test('tail-log - failure -- logs link 404', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailLog('4', '3', 'author', 'aemerror', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_LOGS({ messageValues: ['https://cloudmanager.adobe.io/api/program/4/environment/3/logs?service=author&name=aemerror&days=1 (404 Not Found)'] }),
  )
})

test('tail-log - failure -- tail link 404', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailLog('4', '1', 'publish', 'aemerror', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_LOG({ messageValues: ['https://filestore/logs/publish_aemerror_2019-09-8.log', '404', 'Not Found'] }),
  )
})

test('tail-logs - success (one day)', async () => {
  expect.assertions(6)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailLog('4', '1', 'author', 'aemerror', writable)

  await expect(result instanceof Promise).toBeTruthy()

  await expect(result).rejects.toEqual(
    new codes.ERROR_TAIL_LOG({ messageValues: ['https://filestore/logs/author_aemerror_2019-09-8.log', '200', 'OK'] }),
  )

  flushWritable()

  expect(written).toEqual('some log message\nsome second log message\n')

  expect(fetchMock.calls('tail-log-head').length).toEqual(1)
  expect(fetchMock.calls('tail-log-third').length).toEqual(2)
  expect(global.setTimeout.mock.calls.length).toEqual(1)
})

test('tail-logs - success (around midnight)', async () => {
  jest.spyOn(Date, 'now').mockImplementation(() => 1631145540000)

  expect.assertions(6)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailLog('4', '1', 'author', 'aemerror', writable)

  await expect(result instanceof Promise).toBeTruthy()

  await expect(result).rejects.toEqual(
    new codes.ERROR_TAIL_LOG({ messageValues: ['https://filestore/logs/author_aemerror_2019-09-8.log', '200', 'OK'] }),
  )

  flushWritable()

  expect(written).toEqual('some log message\nsome second log message\nsome log message\nsome second log message\n')

  expect(fetchMock.calls('tail-log-head').length).toEqual(2)
  expect(fetchMock.calls('tail-log-third').length).toEqual(2)
  expect(global.setTimeout.mock.calls.length).toEqual(1)
})

test('tail-logs - success around midnight and the new file is ready', async () => {
  jest.spyOn(Date, 'now').mockImplementation(() => 1631145540000)

  expect.assertions(6)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailLog('4', '1', 'author', 'aemerror', writable)

  await expect(result instanceof Promise).toBeTruthy()

  await expect(result).rejects.toEqual(
    new codes.ERROR_TAIL_LOG({ messageValues: ['https://filestore/logs/author_aemerror_2019-09-8.log', '200', 'OK'] }),
  )

  flushWritable()

  expect(written).toEqual('some log message\nsome second log message\nsome log message\nsome second log message\n')

  expect(fetchMock.calls('tail-log-head').length).toEqual(2)
  expect(fetchMock.calls('tail-log-third').length).toEqual(2)
  expect(global.setTimeout.mock.calls.length).toEqual(1)
})

test('tail-logs - success around midnight and the new file is not ready', async () => {
  jest.spyOn(Date, 'now').mockImplementation(() => 1631145540000)

  expect.assertions(6)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailLog('4', '1', 'author', 'aemrequest', writable)

  await expect(result instanceof Promise).toBeTruthy()

  await expect(result).rejects.toEqual(
    new codes.ERROR_TAIL_LOG({ messageValues: ['https://filestore/logs/author_aemrequest_2019-09-8.log', '200', 'OK'] }),
  )

  flushWritable()

  expect(written).toEqual('some request log message\nsome second request log message\nsome request log message\nsome second request log message\n')

  expect(fetchMock.calls('tail-log-aemrequest-head').length).toEqual(3)
  expect(fetchMock.calls('tail-log-aemrequest-third').length).toEqual(3)
  expect(global.setTimeout.mock.calls.length).toEqual(3)
})
