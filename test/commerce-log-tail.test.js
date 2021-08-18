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
  const sdkClient = await createSdkClient()
  const result = await sdkClient.getCommerceTailLogs('4', '10', '1', writable)

  expect(result instanceof Promise).toBeTruthy()

  flushWritable()

  expect(fetchMock.calls('tail-log-1-first').length).toEqual(1)

  expect(written).toEqual('first log message\nsecond log message\nthird log message\n')

  expect(fetchMock.calls('tail-log-1-first').length).toEqual(1)
  expect(fetchMock.calls('tail-log-1-second').length).toEqual(1)
  expect(fetchMock.calls('tail-log-1-third').length).toEqual(1)
})
