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

const { Writable } = require('stream')
const { codes } = require('../src/SDKErrors')
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
})

test('getCurrentExecution - failure', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getCurrentExecution('5', '5')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_EXECUTION({ messageValues: 'https://cloudmanager.adobe.io/api/program/5/pipeline/5/execution (404 Not Found)' }),
  )
})

test('getCurrentExecution - success', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getCurrentExecution('5', '6')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toMatchObject({
    id: '1000',
    programId: '5',
    pipelineId: '6',
  })
})

test('getExecution - failure', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecution('5', '5', '1002')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_EXECUTION({ messageValues: 'https://cloudmanager.adobe.io/api/program/5/pipeline/5/execution/1002 (404 Not Found)' }),
  )
})

test('getExecutionStepDetails - success', async () => {
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecution('5', '7', '1001')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toHaveProperty('_embedded.stepStates')

  const actual = await result
  expect(actual._embedded.stepStates).toHaveLength(12)
})

test('getExecution - bad pipeline', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecution('5', '100', '1001')
  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_PIPELINE({ messageValues: ['100', '5'] }),
  )
})

test('getQualityGateResults - execution not found', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getQualityGateResults('5', '5', '1002', 'codeQuality')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_EXECUTION({ messageValues: 'https://cloudmanager.adobe.io/api/program/5/pipeline/5/execution/1002 (404 Not Found)' }),
  )
})

test('getQualityGateResults - metrics not found', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getQualityGateResults('5', '7', '1001', 'reportPerformanceTest')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_METRICS({ messageValues: 'https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1001/phase/4597/step/8495/metrics (404 Not Found)' }),
  )
})

test('getQualityGateResults - success', async () => {
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getQualityGateResults('5', '7', '1001', 'codeQuality')

  await expect(result instanceof Promise).toBeTruthy()

  const actual = await result
  await expect(actual.metrics).toMatchObject(expect.arrayContaining([{
    actualValue: 'A',
    comparator: 'GTE',
    expectedValue: 'B',
    id: '69602',
    kpi: 'security_rating',
    override: false,
    passed: true,
    severity: 'critical',
  }]))
  await expect(actual.metrics).toHaveLength(8)
})

test('cancelCurrentExecution - bad pipeline', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.cancelCurrentExecution('5', '10')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_PIPELINE({ messageValues: ['10', '5'] }),
  )
})

test('cancelCurrentExecution - build running', async () => {
  fetchMock.setPipeline7Execution('1005')

  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.cancelCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
  await expect(fetchMock.called('cancel-1005')).toBeTruthy()
})

test('cancelCurrentExecution - code quality waiting', async () => {
  fetchMock.setPipeline7Execution('1006')

  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.cancelCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
  await expect(fetchMock.called('cancel-1006')).toBe(true)
})

test('cancelCurrentExecution - code quality waiting with no cancel (error state)', async () => {
  fetchMock.setPipeline7Execution('1009')

  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.cancelCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_CANCEL_LINK({ messageValues: 'codeQuality' }),
  )
})

test('cancelCurrentExecution - approval waiting', async () => {
  fetchMock.setPipeline7Execution('1007')

  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.cancelCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
  await expect(fetchMock.called('cancel-1007')).toBe(true)
})

test('cancelCurrentExecution - managed pipeline', async () => {
  fetchMock.setPipeline7Execution('1013')
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.cancelCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
  await expect(fetchMock.called('cancel-1013')).toBe(true)
})

test('cancelCurrentExecution - deploy waiting', async () => {
  fetchMock.setPipeline7Execution('1008')

  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.cancelCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
  await expect(fetchMock.called('cancel-1008')).toBe(true)
})

test('cancelCurrentExecution - deploy waiting with no advance (error state)', async () => {
  fetchMock.setPipeline7Execution('1010')

  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.cancelCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_ADVANCE_LINK({ messageValues: 'deploy' }),
  )
})

test('cancelCurrentExecution - all finished (error state)', async () => {
  fetchMock.setPipeline7Execution('1012')

  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.cancelCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_CURRENT_STEP({ messageValues: '7' }),
  )
})

test('cancelCurrentExecution - approval failed', async () => {
  fetchMock.setPipeline7Execution('1014')

  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.cancelCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_CANCEL_EXECUTION({ messageValues: 'https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1014/phase/8567/step/15490/cancel (500 Internal Server Error)' }),
  )
})

test('advanceCurrentExecution - bad pipeline', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.advanceCurrentExecution('5', '10')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_PIPELINE({ messageValues: ['10', '5'] }),
  )
})

test('advanceCurrentExecution - build running', async () => {
  fetchMock.setPipeline7Execution('1005')

  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.advanceCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_WAITING_STEP({ messageValues: '7' }),
  )
})

test('advanceCurrentExecution - code quality waiting', async () => {
  fetchMock.setPipeline7Execution('1006')

  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.advanceCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
  await expect(fetchMock.called('advance-1006')).toBe(true)
})

test('advanceCurrentExecution - approval waiting', async () => {
  fetchMock.setPipeline7Execution('1007')

  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.advanceCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
  await expect(fetchMock.called('advance-1007')).toBe(true)
})

test('advanceCurrentExecution - schedule waiting', async () => {
  fetchMock.setPipeline7Execution('1011')

  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.advanceCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_UNSUPPORTED_ADVANCE_STEP({ messageValues: 'schedule' }),
  )
})

test('advanceCurrentExecution - managed pipeline', async () => {
  fetchMock.setPipeline7Execution('1013')
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.advanceCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
  await expect(fetchMock.called('advance-1013')).toBe(true)
})

test('advanceCurrentExecution - no advance link (edge case)', async () => {
  fetchMock.setPipeline7Execution('1015')

  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.advanceCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_ADVANCE_LINK({ messageValues: 'approval' }),
  )
})

test('advanceCurrentExecution - advance failed', async () => {
  fetchMock.setPipeline7Execution('1016')

  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.advanceCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_ADVANCE_EXECUTION({ messageValues: 'https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1016/phase/8567/step/15490/advance (500 Internal Server Error)' }),
  )
})

test('advanceCurrentExecution - deploy waiting', async () => {
  fetchMock.setPipeline7Execution('1008')

  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.advanceCurrentExecution('5', '7')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
  await expect(fetchMock.called('advance-1008')).toBe(true)
})

test('getExecutionStepLog - failure', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecutionStepLog('5', '5', '1002', 'codeQuality')

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_EXECUTION({ messageValues: 'https://cloudmanager.adobe.io/api/program/5/pipeline/5/execution/1002 (404 Not Found)' }),
  )
})

test('getExecutionStepLog - success', async () => {
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecutionStepLog('5', '7', '1001', 'codeQuality', undefined, writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
  expect(written).toEqual('some log line\nsome other log line\n')
})

test('getExecutionStepLog - success v2', async () => {
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecutionStepLog('5', '7', '1001', 'codeQuality', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
  expect(written).toEqual('some log line\nsome other log line\n')
})

test('getExecutionStepLog - success alternate file', async () => {
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecutionStepLog('5', '7', '1001', 'codeQuality', 'somethingspecial', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toEqual({})
  expect(written).toEqual('some special log line\nsome other special log line\n')
})

test('getExecutionStepLog - not found', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecutionStepLog('5', '7', '1001', 'stageDeploy', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_LOG({ messageValues: 'https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1001/phase/4597/step/8494/logs (404 Not Found)' }),
  )
})

test('getExecutionStepLog - empty', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecutionStepLog('5', '7', '1001', 'prodDeploy', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_NO_LOG_REDIRECT({ messageValues: ['https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1001/phase/4598/step/8500/logs', '{}'] }),
  )
})

test('getExecutionStepLog - missing step', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecutionStepLog('5', '7', '1003', 'devDeploy', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_STEP_STATE({ messageValues: ['devDeploy', '1003'] }),
  )
})

test('getExecutionStepLog - bad pipeline', async () => {
  expect.assertions(2)

  const sdkClient = await createSdkClient()
  const result = sdkClient.getExecutionStepLog('5', '100', '1001', 'build', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_PIPELINE({ messageValues: ['100', '5'] }),
  )
})

test('tailExecutionStepLog - failure no current execution', async () => {
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailExecutionStepLog('5', '5', 'build', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_EXECUTION({ messageValues: 'https://cloudmanager.adobe.io/api/program/5/pipeline/5/execution (404 Not Found)' }),
  )
  expect(written).toEqual('')
})

test('tailExecutionStepLog - step not running', async () => {
  fetchMock.setPipeline7Execution('1003')
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailExecutionStepLog('5', '7', 'build', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_STEP_STATE_NOT_RUNNING({ messageValues: ['build', '1003'] }),
  )
  expect(written).toEqual('')
})

test('tailExecutionStepLog - bad step name', async () => {
  fetchMock.setPipeline7Execution('1003')
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailExecutionStepLog('5', '7', 'BUILD', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_FIND_STEP_STATE({ messageValues: ['BUILD', '1003'] }),
  )
  expect(written).toEqual('')
})

test('tailExecutionStepLog - step log endpoint returns error', async () => {
  fetchMock.setPipeline7Execution('1017')
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailExecutionStepLog('5', '7', 'build', 'error', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_GET_LOG({ messageValues: ['https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1017/phase/4596/step/8492/logs?file=error', '(404 Not Found)'] }),
  )
  expect(written).toEqual('')
})

test('tailExecutionStepLog - step log endpoint returns no redirect', async () => {
  fetchMock.setPipeline7Execution('1017')
  expect.assertions(3)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailExecutionStepLog('5', '7', 'build', 'noredirect', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_NO_LOG_REDIRECT({ messageValues: ['https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1017/phase/4596/step/8492/logs?file=noredirect', '{"garbage":"true"}'] }),
  )
  expect(written).toEqual('')
})

test('tailExecutionStepLog - success', async () => {
  fetchMock.setPipeline7Execution('1017')
  expect.assertions(7)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailExecutionStepLog('5', '7', 'build', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).resolves.toBeTruthy()

  await expect(fetchMock.called('tail-step-log-1017-first')).toBe(true)
  await expect(fetchMock.called('tail-step-log-1017-second')).toBe(true)
  await expect(fetchMock.called('tail-step-log-1017-third')).toBe(true)
  await expect(fetchMock.calls('tail-step-log-1017-third').length).toEqual(2)

  flushWritable()

  expect(written).toEqual('some log message\nsome second log message\nsome third log message\n')
})

test('tailExecutionStepLog - faling refresh', async () => {
  fetchMock.setPipeline7Execution('1018')
  expect.assertions(4)

  const sdkClient = await createSdkClient()
  const result = sdkClient.tailExecutionStepLog('5', '7', 'build', writable)

  await expect(result instanceof Promise).toBeTruthy()
  await expect(result).rejects.toEqual(
    new codes.ERROR_REFRESH_STEP_STATE({ messageValues: ['https://cloudmanager.adobe.io/api/program/5/pipeline/7/execution/1018/phase/4596/step/8492', '(500 Internal Server Error)'] }),
  )

  await expect(fetchMock.called('tail-step-log-1018-first')).toBe(true)

  flushWritable()

  expect(written).toEqual('some log message\n')
})
