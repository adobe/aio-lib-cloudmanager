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

const loggerNamespace = '@adobe/aio-lib-cloudmanager'
const logger = require('@adobe/aio-lib-core-logging')(loggerNamespace, { level: process.env.LOG_LEVEL })
const halfred = require('halfred')
const UriTemplate = require('uritemplate')
const URI = require('urijs')
const fetch = require('cross-fetch')
const fs = require('fs')
const zlib = require('zlib')
const util = require('util')
const streamPipeline = util.promisify(require('stream').pipeline)
const { Transform } = require('stream')
const _ = require('lodash')
const { codes } = require('./SDKErrors')
const { rels, basePath, problemTypes } = require('./constants')
const { getCurrentStep, getWaitingStep, findStepState, isWithinFiveMinutesOfUTCMidnight, sleep } = require('./helpers')

require('./sdktypes.jsdoc') // for VS Code autocomplete
require('./types.jsdoc') // for VS Code autocomplete

/* global EmbeddedProgram, Pipeline, PipelineExecution, ListPipelineOptions,
   PipelineStepMetrics, Environment, LogOptionRepresentation,
   DownloadedLog, PipelineUpdate, Variable, IPAllowedList, PipelineExecutionStepState */ // for linter

/**
 * Returns a Promise that resolves with a new CloudManagerAPI object.
 *
 * @param {string} orgId the organization id
 * @param {string} apiKey the API key for your integration
 * @param {string} accessToken the access token for your integration
 * @param {string} baseUrl the base URL to access the API (defaults to https://cloudmanager.adobe.io)
 * @returns {Promise<CloudManagerAPI>} a Promise with a CloudManagerAPI object
 */
function init (orgId, apiKey, accessToken, baseUrl) {
  return new Promise((resolve, reject) => {
    const clientWrapper = new CloudManagerAPI()

    clientWrapper.init(orgId, apiKey, accessToken, baseUrl)
      .then(initializedSDK => {
        logger.debug('sdk initialized successfully')
        resolve(initializedSDK)
      })
      .catch(err => {
        logger.debug(`sdk init error: ${err}`)
        reject(err)
      })
  })
}

/**
 * This class provides methods to call your Cloud Manager APIs.
 * Before calling any method initialize the instance by calling the `init` method on it
 * with valid values for tenantId, apiKey and accessToken
 */
class CloudManagerAPI {
  /**
   * Initializes a CloudManagerAPI object and returns it.
   *
   * @param {string} orgId the organization id
   * @param {string} apiKey the API key for your integration
   * @param {string} accessToken the access token for your integration
   * @param {string} baseUrl the base URL to access the API (defaults to https://cloudmanager.adobe.io)
   * @returns {Promise<CloudManagerAPI>} a CloudManagerAPI object
   */
  async init (orgId, apiKey, accessToken, baseUrl) {
    const initErrors = []
    if (!orgId) {
      initErrors.push('orgId')
    }
    if (!apiKey) {
      initErrors.push('apiKey')
    }
    if (!accessToken) {
      initErrors.push('accessToken')
    }

    if (initErrors.length) {
      const sdkDetails = { orgId, apiKey, accessToken }
      throw new codes.ERROR_SDK_INITIALIZATION({ sdkDetails, messageValues: `${initErrors.join(', ')}` })
    }

    /**
     * The organization id
     *
     * @type {string}
     */
    this.orgId = orgId

    /**
     * The api key from your integration
     *
     * @type {string}
     */
    this.apiKey = apiKey

    /**
     * The access token from your integration
     *
     * @type {string}
     */
    this.accessToken = accessToken

    /**
     * The base URL for the API endpoint
     *
     * @type {string}
     */
    this.baseUrl = baseUrl || 'https://cloudmanager.adobe.io'

    return this
  }

  _getErrors (problem) {
    if (problem.errors) {
      if (_.isArray(problem.errors) && problem.errors.length > 0) {
        return problem.errors.map(error => error.message || error).join(', ')
      } else if (_.isObject(problem.errors)) {
        return Object.values(problem.errors).map(error => {
          if (error.field && error.message && error.invalidValue) {
            return `${error.field} (${error.invalidValue}) ${error.message}`
          } else {
            return error.message
          }
        }).join(', ')
      }
    }
  }

  async _doRequest (path, method, body, ErrorClass) {
    const url = `${this.baseUrl}${path}`
    const options = {
      method: method,
      headers: {
        'x-gw-ims-org-id': this.orgId,
        'X-Api-Key': this.apiKey,
        Authorization: `Bearer ${this.accessToken}`,
        accept: 'application/json',
      },
    }
    if (body) {
      options.body = JSON.stringify(body)
      options.headers['content-type'] = 'application/json'
    }

    logger.debug(`fetch: ${method} ${url}`)
    return new Promise((resolve, reject) => {
      fetch(url, options).then(res => {
        const requestId = res.headers.get('x-request-id')
        if (requestId) {
          logger.debug(`request id: ${requestId}`)
        }
        if (res.ok) resolve(res)
        else {
          res.text().then(text => {
            const sdkDetails = { orgId: this.orgId, apiKey: this.apiKey, accessToken: this.accessToken, url, response: res }
            let messageValues = `${res.url} (${res.status} ${res.statusText})`
            const resContentType = res.headers.get('content-type')
            if (resContentType) {
              try {
                if (resContentType.indexOf('application/problem+json') === 0) {
                  const problem = JSON.parse(text)
                  const errors = this._getErrors(problem)
                  if (errors) {
                    const handler = problemTypes[problem.type] || problemTypes.other
                    sdkDetails.errors = problem.errors
                    if (handler.extraDetailsKey) {
                      sdkDetails[handler.extraDetailsKey] = problem.errors
                    }
                    messageValues = `${messageValues} - ${handler.prefix(problem)}: ${errors}`
                  }
                } else if (resContentType === 'application/json') {
                  const parsedBody = JSON.parse(text)
                  sdkDetails.errorDetails = parsedBody
                  if (parsedBody.message) {
                    messageValues = messageValues + ` - Detail: ${parsedBody.message}`
                    if (parsedBody.error_code) {
                      messageValues = messageValues + ` (Code: ${parsedBody.error_code})`
                    }
                  }
                }
              } catch (e) {
                // presumably in this case the response body is not helpful and need not be included in the error message
              }
            }
            reject(new ErrorClass({ sdkDetails, messageValues }))
          })
        }
      })
    })
  }

  async _get (path, ErrorClass) {
    return this._doRequest(path, 'GET', null, ErrorClass)
  }

  async _put (path, body, ErrorClass) {
    return this._doRequest(path, 'PUT', body, ErrorClass)
  }

  async _delete (path, ErrorClass) {
    return this._doRequest(path, 'DELETE', null, ErrorClass)
  }

  async _patch (path, body, ErrorClass) {
    return this._doRequest(path, 'PATCH', body, ErrorClass)
  }

  async _post (path, body, ErrorClass) {
    return this._doRequest(path, 'POST', body, ErrorClass)
  }

  async _listPrograms () {
    return this._get(basePath, codes.ERROR_LIST_PROGRAMS).then(res => {
      return res.json()
    }, e => {
      throw e
    })
  }

  /**
   * Obtain a list of programs for the target organization.
   *
   * @returns {Promise<EmbeddedProgram[]>} an array of Programs
   */
  async listPrograms () {
    const result = await this._listPrograms()
    return (result && halfred.parse(result).embeddedArray('programs')) || []
  }

  async _getProgram (path) {
    return this._get(path, codes.ERROR_GET_PROGRAM).then(res => {
      return res.json()
    }, e => {
      throw e
    })
  }

  async _findProgram (programId) {
    const programs = await this.listPrograms()
    let program = programs.find(p => p.id === programId)
    if (!program) {
      throw new codes.ERROR_FIND_PROGRAM({ messageValues: programId })
    }
    program = await this._getProgram(program.link(rels.self).href)
    program = halfred.parse(program)
    return program
  }

  async _listPipelines (path) {
    return this._get(path, codes.ERROR_LIST_PIPELINES).then(res => {
      return res.json()
    }, e => {
      throw e
    })
  }

  /**
   * Obtain a list of pipelines for the target program.
   *
   * @param {string} programId the program id
   * @param {ListPipelineOptions} options options
   * @returns {Promise<Pipeline[]>} an array of Pipelines
   */
  async listPipelines (programId, options) {
    const program = await this._findProgram(programId)

    const result = await this._listPipelines(program.link(rels.pipelines).href)
    let pipelines = result && halfred.parse(result).embeddedArray('pipelines')
    if (!pipelines) {
      throw new codes.ERROR_FIND_PIPELINES({ messageValues: programId })
    }
    if (options && options.busy) {
      pipelines = pipelines.filter(pipeline => pipeline.status === 'BUSY')
    }
    return pipelines
  }

  /**
   * Create a new execution for a pipeline, returning the execution.
   *
   * @param {string} programId the program id
   * @param {string} pipelineId the pipeline id
   * @returns {Promise<PipelineExecution>} the new execution
   */
  async createExecution (programId, pipelineId) {
    const pipelines = await this.listPipelines(programId)
    const pipeline = pipelines.find(p => p.id === pipelineId)
    if (!pipeline) {
      throw new codes.ERROR_FIND_PIPELINE_START({ messageValues: [pipelineId, programId] })
    }

    return this._put(pipeline.link(rels.execution).href, null, codes.ERROR_PIPELINE_START).then(res => {
      return new Promise((resolve, reject) => {
        res.json().then(body => {
          resolve(halfred.parse(body))
        })
      })
    }, e => {
      if (e.sdkDetails.response.status === 412) throw new codes.ERROR_PIPELINE_START_RUNNING()
      else throw e
    })
  }

  /**
   * Start an execution for a pipeline, returning the url of the new execution
   *
   * @param {string} programId the program id
   * @param {string} pipelineId the pipeline id
   * @returns {Promise<string>} the execution url
   * @deprecated use createExecution instead
   */
  async startExecution (programId, pipelineId) {
    const execution = await this.createExecution(programId, pipelineId)
    return this.baseUrl + execution.link(rels.self).href
  }

  /**
   * Invalidate the cache for a pipeline
   *
   * @param {string} programId the program id
   * @param {string} pipelineId the pipeline id
   * @returns {Promise<object>} a truthy object
   */
  async invalidatePipelineCache (programId, pipelineId) {
    const pipelines = await this.listPipelines(programId)
    const pipeline = pipelines.find(p => p.id === pipelineId)
    if (!pipeline) {
      throw new codes.ERROR_FIND_PIPELINE({ messageValues: [pipelineId, programId] })
    }

    const link = pipeline.link(rels.pipelineCache)

    if (!link) {
      throw new codes.ERROR_FIND_PIPELINE_CACHE_LINK({ messageValues: [pipelineId, programId] })
    }

    return this._delete(link.href, codes.ERROR_PIPELINE_CACHE_INVALIDATE).then(() => {
      return {}
    }, e => {
      throw e
    })
  }

  async _findPipeline (programId, pipelineId) {
    const pipelines = await this.listPipelines(programId)
    const pipeline = pipelines.find(p => p.id === pipelineId)
    if (!pipeline) {
      throw new codes.ERROR_FIND_PIPELINE({ messageValues: [pipelineId, programId] })
    }
    return pipeline
  }

  /**
   * Get the current execution for a pipeline
   *
   * @param {string} programId the program id
   * @param {string} pipelineId the pipeline id
   * @returns {Promise<PipelineExecution>} the execution
   */
  async getCurrentExecution (programId, pipelineId) {
    const pipeline = await this._findPipeline(programId, pipelineId)

    return this._get(pipeline.link(rels.execution).href, codes.ERROR_GET_EXECUTION).then(res => {
      return res.json()
    }, e => {
      throw e
    })
  }

  async _getExecutions (href, result, limit) {
    return new Promise((resolve, reject) => {
      this._get(href, codes.ERROR_LIST_EXECUTIONS).then(res => {
        res.json().then(json => {
          const remaining = limit - result.length
          const executionResponse = halfred.parse(json)
          const newlyRetrievedExecutions = executionResponse.embeddedArray('executions')
          if (newlyRetrievedExecutions.length === 0) {
            // no more executions. resolve
            resolve()
          } else if (remaining <= newlyRetrievedExecutions.length) {
            // this will be the last batch. add to the result and resolve
            Array.prototype.push.apply(result, newlyRetrievedExecutions.slice(0, remaining))
            resolve()
          } else {
            // add and do another batch
            Array.prototype.push.apply(result, newlyRetrievedExecutions)
            const nextLink = executionResponse.link('next')
            if (!nextLink) {
              resolve()
            } else {
              this._getExecutions(nextLink.href, result, limit).then(resolve, reject)
            }
          }
        })
      }, reject)
    })
  }

  /**
   * List the most recent executions for a pipeline
   *
   * @param {string} programId the program id
   * @param {string} pipelineId the pipeline id
   * @param {number} limit the maximum number of executions to return (defaults to 20)
   * @returns {Promise<Array<PipelineExecution>>} the list of executions
   */
  async listExecutions (programId, pipelineId, limit = 20) {
    const pipeline = await this._findPipeline(programId, pipelineId)

    const result = []
    return this._getExecutions(pipeline.link(rels.executions).href, result, limit).then(() => {
      return result
    }, e => {
      throw e
    })
  }

  /**
   * Get an execution for a pipeline
   *
   * @param {string} programId the program id
   * @param {string} pipelineId the pipeline id
   * @param {string} executionId the execution id
   * @returns {Promise<PipelineExecution>} the execution
   */
  async getExecution (programId, pipelineId, executionId) {
    const pipeline = await this._findPipeline(programId, pipelineId)
    const executionTemplate = UriTemplate.parse(pipeline.link(rels.executionId).href)
    const executionLink = executionTemplate.expand({ executionId: executionId })
    return this._get(executionLink, codes.ERROR_GET_EXECUTION).then(res => {
      return res.json()
    }, e => {
      throw e
    })
  }

  async _findStepState (programId, pipelineId, executionId, action) {
    const execution = halfred.parse(await this.getExecution(programId, pipelineId, executionId))

    const stepState = findStepState(execution, action)

    if (!stepState) {
      throw new codes.ERROR_FIND_STEP_STATE({ messageValues: [action, executionId] })
    }
    return stepState
  }

  /**
   * Get the quality gate results for a pipeline step
   *
   * @param {string} programId the program id
   * @param {string} pipelineId the pipeline id
   * @param {string} executionId the execution id
   * @param {string} action the action name
   * @returns {Promise<PipelineStepMetrics>} the execution
   */
  async getQualityGateResults (programId, pipelineId, executionId, action) {
    const stepState = await this._findStepState(programId, pipelineId, executionId, action)

    return this._getMetricsForStepState(stepState)
  }

  async _getMetricsForStepState (stepState) {
    return this._get(stepState.link(rels.metrics).href, codes.ERROR_GET_METRICS).then(res => {
      return res.json()
    }, e => {
      throw e
    })
  }

  /**
   * Cancel current execution
   *
   * @param {string} programId the program id
   * @param {string} pipelineId the pipeline id
   * @returns {Promise<object>} a truthy value
   */
  async cancelCurrentExecution (programId, pipelineId) {
    const execution = halfred.parse(await this.getCurrentExecution(programId, pipelineId))
    const step = getCurrentStep(execution)
    if (!step || !step.link) {
      throw new codes.ERROR_FIND_CURRENT_STEP({ messageValues: pipelineId })
    }
    const cancelHalLink = step.link(rels.cancel)
    if (!cancelHalLink) {
      throw new codes.ERROR_FIND_CANCEL_LINK({ messageValues: step.action })
    }
    let href = cancelHalLink.href

    const body = {}
    if (step.action === 'approval') {
      body.approved = false
    } else if (step.action === 'managed') {
      body.start = false
    } else if (step.status === 'WAITING' && step.action !== 'schedule' && step.action !== 'deploy') {
      body.override = false
    } else if (step.status === 'WAITING' && step.action === 'deploy') {
      const advanceHalLink = step.link(rels.advance)
      if (!advanceHalLink) {
        throw new codes.ERROR_FIND_ADVANCE_LINK({ messageValues: step.action })
      }
      href = advanceHalLink.href
      body.resume = false
    } else {
      body.cancel = true
    }

    return this._put(href, body, codes.ERROR_CANCEL_EXECUTION).then(() => {
      return {}
    }, e => {
      throw e
    })
  }

  /**
   * Advance current execution
   *
   * @param {string} programId the program id
   * @param {string} pipelineId the pipeline id
   * @returns {Promise<object>} a truthy value
   */
  async advanceCurrentExecution (programId, pipelineId) {
    const execution = halfred.parse(await this.getCurrentExecution(programId, pipelineId))
    const step = getWaitingStep(execution)
    if (!step || !step.link) {
      throw new codes.ERROR_FIND_WAITING_STEP({ messageValues: pipelineId })
    }
    const advanceHalLink = step.link(rels.advance)
    if (!advanceHalLink) {
      throw new codes.ERROR_FIND_ADVANCE_LINK({ messageValues: step.action })
    }
    const href = advanceHalLink.href

    const body = {}
    if (step.action === 'approval') {
      body.approved = true
    } else if (step.action === 'managed') {
      body.start = true
    } else if (step.action === 'schedule') {
      throw new codes.ERROR_UNSUPPORTED_ADVANCE_STEP({ messageValues: step.action })
    } else if (step.action === 'deploy') {
      body.resume = true
    } else {
      const results = await this._getMetricsForStepState(step)
      body.metrics = results.metrics.filter(metric => metric.severity === 'important' && metric.passed === false).map(metric => {
        return {
          ...metric,
          override: true,
        }
      })
    }

    return this._put(href, body, codes.ERROR_ADVANCE_EXECUTION).then(() => {
      return {}
    }, e => {
      throw e
    })
  }

  async _listEnvironments (path) {
    return this._get(path, codes.ERROR_RETRIEVE_ENVIRONMENTS).then(res => {
      return res.json()
    }, e => {
      throw e
    })
  }

  /**
   * List environments for a program
   *
   * @param {string} programId the program id
   * @returns {Promise<Environment[]>} a list of environments
   */
  async listEnvironments (programId) {
    const program = await this._findProgram(programId)

    const result = await this._listEnvironments(program.link(rels.environments).href)
    const environments = result && halfred.parse(result).embeddedArray('environments')
    if (!environments) {
      throw new codes.ERROR_FIND_ENVIRONMENTS({ messageValues: programId })
    }
    return environments
  }

  async _getLogsForStepState (stepState, logFile, outputStream) {
    let link = stepState.link(rels.stepLogs).href
    if (logFile) {
      link = `${link}?file=${logFile}`
    }
    return this._get(link, codes.ERROR_GET_LOG).then(async (res) => {
      const json = await res.json()
      if (json.redirect) {
        return await fetch(json.redirect).then(res => new Promise((resolve, reject) => {
          res.body.pipe(outputStream)
          res.body.on('end', () => resolve({}))
          outputStream.on('error', reject)
        }))
      } else {
        throw new codes.ERROR_NO_LOG_REDIRECT({ messageValues: [res.url, JSON.stringify(json)] })
      }
    }, e => {
      throw e
    })
  }

  /**
   * Write step log to an output stream.
   *
   * @param {string} programId the program id
   * @param {string} pipelineId the pipeline id
   * @param {string} executionId the execution id
   * @param {string} action the action
   * @param {string} logFile the log file to select a non-default value
   * @param {object} outputStream the output stream to write to
   * @returns {Promise<object>} a truthy value
   */
  async getExecutionStepLog (programId, pipelineId, executionId, action, logFile, outputStream) {
    if (!outputStream) {
      outputStream = logFile
      logFile = undefined
    }
    const stepState = await this._findStepState(programId, pipelineId, executionId, action)

    return this._getLogsForStepState(stepState, logFile, outputStream)
  }

  async _refreshStepState (href) {
    return this._get(href, codes.ERROR_REFRESH_STEP_STATE).then(res => {
      return res.json()
    }, e => {
      throw e
    })
  }

  async _getExecutionStepLogUrl (href) {
    return this._get(href, codes.ERROR_GET_LOG).then(async (res) => {
      const json = await res.json()
      if (json.redirect) {
        return json.redirect
      } else {
        throw new codes.ERROR_NO_LOG_REDIRECT({ messageValues: [res.url, JSON.stringify(json)] })
      }
    }, e => {
      throw e
    })
  }

  /**
   * Tail step log to an output stream.
   *
   * @param {string} programId the program id
   * @param {string} pipelineId the pipeline id
   * @param {string} action the action
   * @param {string} logFile the log file to select a non-default value
   * @param {object} outputStream the output stream to write to
   * @returns {Promise<PipelineExecutionStepState>} the completed step state
   */
  async tailExecutionStepLog (programId, pipelineId, action, logFile, outputStream) {
    if (!outputStream) {
      outputStream = logFile
      logFile = undefined
    }
    const currentExecution = halfred.parse(await this.getCurrentExecution(programId, pipelineId))
    let stepState = findStepState(currentExecution, action)

    if (!stepState) {
      throw new codes.ERROR_FIND_STEP_STATE({ messageValues: [action, currentExecution.id] })
    }
    if (stepState.status === 'RUNNING') {
      const selfStateHref = stepState.link(rels.self).href
      let link = stepState.link(rels.stepLogs).href
      if (logFile) {
        link = `${link}?file=${logFile}`
      }
      const tailingSasUrl = await this._getExecutionStepLogUrl(link)

      let currentStartLimit = 0

      while (stepState.status === 'RUNNING') {
        const options = {
          headers: {
            Range: `bytes=${currentStartLimit}-`,
          },
        }
        const res = await fetch(tailingSasUrl, options)
        if (res.status === 206) {
          const contentLength = res.headers.get('content-length')
          await this._pipeBody(res.body, outputStream)
          currentStartLimit = parseInt(currentStartLimit) + parseInt(contentLength)
        } else if (res.status === 416 || res.status === 404) {
          // 416 means there's more data potentially available; 404 means the log isn't ready yet
          // these are different things, but we can treat them the same way -- wait a few seconds
          await sleep(5000)
        }
        stepState = await this._refreshStepState(selfStateHref)
      }
    } else {
      throw new codes.ERROR_STEP_STATE_NOT_RUNNING({ messageValues: [action, currentExecution.id] })
    }

    return stepState
  }

  async _findEnvironment (programId, environmentId) {
    const environments = await this.listEnvironments(programId)
    const environment = environments.find(e => e.id === environmentId)
    if (!environment) {
      throw new codes.ERROR_FIND_ENVIRONMENT({ messageValues: [environmentId, programId] })
    }
    return environment
  }

  /**
   * List the log options available for an environment
   *
   * @param {string} programId the program id
   * @param {string} environmentId the environment id
   * @returns {Promise<LogOptionRepresentation[]>} the log options for the environment
   */
  async listAvailableLogOptions (programId, environmentId) {
    const environment = await this._findEnvironment(programId, environmentId)

    return environment.availableLogOptions || []
  }

  async _getLogs (environment, service, name, days) {
    if (!environment.link(rels.logs)) {
      throw new codes.ERROR_FIND_LOGS_LINK_ENVIRONMENT({ messageValues: [environment.id, environment.programId] })
    }
    const logsTemplate = UriTemplate.parse(environment.link(rels.logs).href)
    const logsLink = logsTemplate.expand({ service: service, name: name, days: days })

    return this._get(logsLink, codes.ERROR_GET_LOGS).then(res => {
      return res.json()
    }, e => {
      throw e
    })
  }

  async _download (href, outputPath, resultObject) {
    const res = await this._get(href, codes.ERROR_GET_LOG)

    const downloadUrl = res.url

    const json = await res.json()
    if (!json || !json.redirect) {
      throw new codes.ERROR_NO_LOG_REDIRECT({ messageValues: [res.url, JSON.stringify(json)] })
    }

    const redirectUrl = json.redirect

    const logRes = await fetch(redirectUrl)
    if (!logRes.ok) {
      throw new codes.ERROR_LOG_DOWNLOAD({
        messageValues: [redirectUrl, outputPath, logRes.status, logRes.statusText],
      })
    }

    await this._streamAndUnzip(logRes.body, fs.createWriteStream(outputPath)).catch(
      function (error) {
        if (error.errno !== -5 || error.code !== 'Z_BUF_ERROR') {
          throw new codes.ERROR_LOG_UNZIP({ messageValues: [redirectUrl, outputPath] })
        }
      },
    )

    return {
      ...resultObject,
      path: outputPath,
      url: downloadUrl,
    }
  }

  async _streamAndUnzip (src, dest) {
    await streamPipeline(src, zlib.createGunzip(), dest)
  }

  /**
   * Download log files from the environment to a specified directory.
   *
   * @param {string} programId the program id
   * @param {string} environmentId the environment id
   * @param {string} service the service specification
   * @param {string} name the log name
   * @param {number} days the number of days
   * @param {string} outputDirectory the output directory
   * @returns {Promise<DownloadedLog[]>} the list of downloaded logs
   */
  async downloadLogs (programId, environmentId, service, name, days, outputDirectory) {
    const environment = await this._findEnvironment(programId, environmentId)
    let logs = await this._getLogs(environment, service, name, days)
    logs = halfred.parse(logs)

    const downloads = logs.embeddedArray('downloads') || []

    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory)
    }

    const downloadPromises = []

    downloads.forEach(download => {
      const downloadLinks = download.linkArray(rels.logsDownload)

      if (downloadLinks.length === 1) {
        const downloadName = `${download.service}-${download.name}-${download.date}.log`
        const path = `${outputDirectory}/${environmentId}-${downloadName}`
        downloadPromises.push(this._download(downloadLinks[0].href, path, {
          ...download,
          index: 0,
        }))
      } else if (downloadLinks.length !== 0) {
        for (let i = 0; i < downloadLinks.length; i++) {
          const downloadName = `${download.service}-${download.name}-${download.date}-${i}.log`
          const path = `${outputDirectory}/${environmentId}-${downloadName}`
          downloadPromises.push(this._download(downloadLinks[i].href, path, {
            ...download,
            index: i,
          }))
        }
      }
    })

    const downloaded = await Promise.all(downloadPromises)

    return downloaded
  }

  async _getLogFileSizeInitialSize (url) {
    const options = {
      method: 'HEAD',
    }
    const res = await fetch(url, options)
    if (!res.ok) throw new codes.ERROR_LOG_INITIAL_SIZE({ messageValues: url })
    return res.headers.get('content-length')
  }

  async tailLog (programId, environmentId, service, name, outputStream) {
    const environment = await this._findEnvironment(programId, environmentId)
    const tailingSasUrl = await this._getTailingSasUrl(programId, environment, service, name)
    const contentLength = await this._getLogFileSizeInitialSize(tailingSasUrl)
    await this._getLiveStream(programId, environment, service, name, tailingSasUrl, contentLength, outputStream)
  }

  _pipeBody (body, writeStream) {
    return new Promise((resolve) => {
      body.pipe(writeStream, { end: false })
      body.on('end', () => resolve({}))
    })
  }

  _pipeBodyWithTransform (body, writeStream, transform) {
    return new Promise((resolve) => {
      body.pipe(transform()).pipe(writeStream, { end: false })
      body.on('end', () => resolve({}))
    })
  }

  async _getLiveStream (programId, environment, service, name, tailingSasUrl, currentStartLimit, writeStream) {
    for (;;) {
      const options = {
        headers: {
          Range: 'bytes=' + currentStartLimit + '-',
        },
      }
      const res = await fetch(tailingSasUrl, options)
      if (res.status === 206) {
        const contentLength = res.headers.get('content-length')
        await this._pipeBody(res.body, writeStream)
        currentStartLimit = parseInt(currentStartLimit) + parseInt(contentLength)
      } else if (res.status === 416) {
        await sleep(2000)
        /**
         * Handles the rollover around UTC midnight using delta of 5 minutes before and after midnight
         * to account for client's clock synchronisation
         */
        if (isWithinFiveMinutesOfUTCMidnight(new Date(Date.now()))) {
          tailingSasUrl = await this._getTailingSasUrl(programId, environment, service, name)
          const startLimit = await this._getLogFileSizeInitialSize(tailingSasUrl)
          if (parseInt(startLimit) < parseInt(currentStartLimit)) {
            currentStartLimit = startLimit
          } else {
            // sleep to reduce number of requests to ssg around UTC midnight
            await sleep(2000)
          }
        }
      } else if (res.status === 404) {
        throw new codes.ERROR_FIND_LOG({ messageValues: [res.url, res.status, res.statusText] })
      } else {
        throw new codes.ERROR_TAIL_LOG({ messageValues: [res.url, res.status, res.statusText] })
      }
    }
  }

  async _getTailingSasUrl (programId, environment, service, name) {
    let logs = await this._getLogs(environment, service, name, 1)
    logs = halfred.parse(logs)
    const downloads = logs.embeddedArray('downloads') || []
    if (downloads && downloads.length > 0) {
      const tailLinks = downloads[0].linkArray(rels.logsTail)
      if (tailLinks && tailLinks.length > 0) {
        return tailLinks[0].href
      } else {
        throw new codes.ERROR_FIND_TAIL_LOGS({ messageValues: [environment.id, programId] })
      }
    } else {
      throw new codes.ERROR_FIND_LOGS({ messageValues: [environment.id, programId] })
    }
  }

  /**
   * Delete a pipeline
   *
   * @param {string} programId the program id
   * @param {string} pipelineId the pipeline id
   * @returns {Promise<object>} a truthy object
   */
  async deletePipeline (programId, pipelineId) {
    const pipeline = await this._findPipeline(programId, pipelineId)

    return this._delete(pipeline.link(rels.self).href, codes.ERROR_DELETE_PIPELINE).then(() => {
      return {}
    }, e => {
      throw e
    })
  }

  /**
   * Update a pipeline
   *
   * @param {string} programId - the program id
   * @param {string} pipelineId - the pipeline id
   * @param {PipelineUpdate} changes - the changes
   * @returns {Promise<Pipeline>} the new pipeline definition
   */
  async updatePipeline (programId, pipelineId, changes) {
    const pipeline = await this._findPipeline(programId, pipelineId)

    const patch = {
      phases: [],
    }

    if (changes && (changes.branch || changes.repositoryId)) {
      const buildPhase = pipeline.phases && pipeline.phases.find(phase => phase.type === 'BUILD')
      if (!buildPhase) {
        throw new codes.ERROR_NO_BUILD_PHASE({ messageValues: pipelineId })
      }
      const newBuildPhase = _.clone(buildPhase)
      if (changes.branch) {
        newBuildPhase.branch = changes.branch
      }
      if (changes.repositoryId) {
        newBuildPhase.repositoryId = changes.repositoryId
      }
      patch.phases.push(newBuildPhase)
    }

    return this._patch(pipeline.link(rels.self).href, patch, codes.ERROR_UPDATE_PIPELINE).then(res => {
      return res.json()
    }, e => {
      throw e
    })
  }

  /**
   * Get the link to the developer console
   *
   * @param {string} programId - the program id
   * @param {string} environmentId - the environment id
   * @returns {Promise<string>} the console url
   */
  async getDeveloperConsoleUrl (programId, environmentId) {
    const environment = await this._findEnvironment(programId, environmentId)

    let link = environment.link('http://ns.adobe.com/adobecloud/rel/developerConsole')
    if (!link && environment.namespace && environment.cluster) {
      link = {
        href: `https://dev-console-${environment.namespace}.${environment.cluster}.dev.adobeaemcloud.com/dc/`,
      }
    }

    if (link) {
      return link.href
    } else {
      throw new codes.ERROR_NO_DEVELOPER_CONSOLE({ messageValues: [environmentId, programId] })
    }
  }

  async _getVariables (linkGetterFunction, args) {
    const variablesLink = await linkGetterFunction.apply(this, args)

    const variables = await this._get(variablesLink, codes.ERROR_GET_VARIABLES).then(res => {
      return res.json()
    }, e => {
      throw e
    })

    const result = halfred.parse(variables).embeddedArray('variables')
    return result ? result.map(v => v.original()) : []
  }

  async _setVariables (linkGetterFunction, args, variables) {
    const variablesLink = await linkGetterFunction.apply(this, args)

    return await this._patch(variablesLink, variables, codes.ERROR_SET_VARIABLES).then(() => {
      return true
    }, e => {
      throw e
    })
  }

  async _getEnvironmentVariablesLink (programId, environmentId) {
    const environment = await this._findEnvironment(programId, environmentId)

    const variablesLink = environment.link(rels.variables)
    if (!variablesLink) {
      throw new codes.ERROR_FIND_VARIABLES_LINK_ENVIRONMENT({ messageValues: [environmentId, programId] })
    }
    return variablesLink.href
  }

  /**
   * Get the list of variables for an environment
   *
   * @param {string} programId - the program id
   * @param {string} environmentId - the environment id
   * @returns {Promise<Variable[]>} the variables
   */
  async getEnvironmentVariables (programId, environmentId) {
    return this._getVariables(this._getEnvironmentVariablesLink, [programId, environmentId])
  }

  /**
   * Set the variables for an environment
   *
   * @param {string} programId - the program id
   * @param {string} environmentId - the environment id
   * @param {Variable[]} variables the variables
   * @returns {Promise<object>} a truthy value
   */
  async setEnvironmentVariables (programId, environmentId, variables) {
    return this._setVariables(this._getEnvironmentVariablesLink, [programId, environmentId], variables)
  }

  async _getPipelineVariablesLink (programId, pipelineId) {
    const pipeline = await this._findPipeline(programId, pipelineId)

    const variablesLink = pipeline.link(rels.variables)
    if (!variablesLink) {
      throw new codes.ERROR_FIND_VARIABLES_LINK_PIPELINE({ messageValues: [pipelineId, programId] })
    }
    return variablesLink.href
  }

  /**
   * Get the list of variables for a pipeline
   *
   * @param {string} programId - the program id
   * @param {string} pipelineId - the pipeline id
   * @returns {Promise<Variable[]>} the variables
   */
  async getPipelineVariables (programId, pipelineId) {
    return this._getVariables(this._getPipelineVariablesLink, [programId, pipelineId])
  }

  /**
   * Set the variables for a pipeline
   *
   * @param {string} programId - the program id
   * @param {string} pipelineId - the pipeline id
   * @param {Variable[]} variables the variables
   * @returns {Promise<object>} a truthy value
   */
  async setPipelineVariables (programId, pipelineId, variables) {
    return this._setVariables(this._getPipelineVariablesLink, [programId, pipelineId], variables)
  }

  /**
   * Delete a program
   *
   * @param {string} programId - the program id
   * @returns {Promise<object>} a truthy value
   */
  async deleteProgram (programId) {
    const program = await this._findProgram(programId)
    return this._delete(program.link(rels.self).href, codes.ERROR_DELETE_PROGRAM).then(() => {
      return {}
    }, e => {
      throw e
    })
  }

  /**
   * Delete an environment
   *
   * @param {string} programId - the program id
   * @param {string} environmentId - the environment id
   * @returns {Promise<object>} a truthy value
   */
  async deleteEnvironment (programId, environmentId) {
    const environment = await this._findEnvironment(programId, environmentId)

    return this._delete(environment.link(rels.self).href, codes.ERROR_DELETE_ENVIRONMENT).then(() => {
      return {}
    }, e => {
      throw e
    })
  }

  async _listIpAllowlists (path) {
    return this._get(path, codes.ERROR_LIST_IP_ALLOWLISTS).then(res => {
      return res.json()
    }, e => {
      throw e
    })
  }

  async _findIpAllowlistsLink (programId) {
    const program = await this._findProgram(programId)

    const link = program.link(rels.ipAllowlists)
    if (!link) {
      throw new codes.ERROR_NO_IP_ALLOWLISTS({ messageValues: programId })
    }
    return link
  }

  /**
   * List the program's defined IP Allow Lists
   *
   * @param {string} programId - the program id
   * @returns {Promise<IPAllowedList>} - the IP Allow Lists
   */
  async listIpAllowlists (programId) {
    const link = await this._findIpAllowlistsLink(programId)

    const result = await this._listIpAllowlists(link.href)
    return result && halfred.parse(result).embeddedArray('ipAllowlists')
  }

  async _findIpAllowlist (programId, ipAllowlistId) {
    const ipAllowlists = await this.listIpAllowlists(programId)
    const ipAllowlist = ipAllowlists.find(i => i.id === ipAllowlistId)
    if (!ipAllowlist) {
      throw new codes.ERROR_FIND_IP_ALLOWLIST({ messageValues: [ipAllowlistId, programId] })
    }
    return ipAllowlist
  }

  /**
   * Create IP Allow List
   *
   * @param {string} programId - the program id
   * @param {string} name - the name
   * @param {string[]} cidrBlocks - the CIDR blocks
   * @returns {Promise<IPAllowedList>} a truthy value
   */
  async createIpAllowlist (programId, name, cidrBlocks) {
    const link = await this._findIpAllowlistsLink(programId)
    const ipAllowlist = {
      programId,
      name,
      ipCidrSet: cidrBlocks,
    }

    return this._post(link.href, ipAllowlist, codes.ERROR_CREATE_IP_ALLOWLIST).then(async (res) => {
      return halfred.parse(await res.json())
    }, e => {
      throw e
    })
  }

  /**
   * Update the CIDR blocks of an IP Allow List
   *
   * @param {string} programId - the program id
   * @param {string} ipAllowlistId - the allow list id
   * @param {string[]} cidrBlocks - the replacement CIDR blocks
   * @returns {Promise<object>} a truthy value
   */
  async updateIpAllowlist (programId, ipAllowlistId, cidrBlocks) {
    const ipAllowlist = await this._findIpAllowlist(programId, ipAllowlistId)
    const updated = _.cloneDeep(ipAllowlist.original())
    updated.ipCidrSet = cidrBlocks
    delete updated._links
    delete updated.bindings
    return this._put(ipAllowlist.link(rels.self).href, updated, codes.ERROR_UPDATE_IP_ALLOWLIST).then(() => {
      return {}
    }, e => {
      throw e
    })
  }

  /**
   * Update the CIDR blocks of an IP Allow List
   *
   * @param {string} programId - the program id
   * @param {string} ipAllowlistId - the allow list id
   * @returns {Promise<object>} a truthy value
   */
  async deleteIpAllowlist (programId, ipAllowlistId) {
    const ipAllowlist = await this._findIpAllowlist(programId, ipAllowlistId)
    return this._delete(ipAllowlist.link(rels.self).href, codes.ERROR_DELETE_IP_ALLOWLIST).then(() => {
      return {}
    }, e => {
      throw e
    })
  }

  /**
   * Bind an IP Allow List to an environment
   *
   * @param {string} programId - the program id
   * @param {string} ipAllowlistId - the allow list id
   * @param {string} environmentId - the environment id
   * @param {string} service - the service name
   * @returns {Promise<object>} a truthy value
   */
  async addIpAllowlistBinding (programId, ipAllowlistId, environmentId, service) {
    const ipAllowlist = await this._findIpAllowlist(programId, ipAllowlistId)
    const body = {
      environmentId,
      tier: service,
    }
    return this._post(ipAllowlist.link(rels.ipAllowlistBindings).href, body, codes.ERROR_CREATE_IP_ALLOWLIST_BINDING).then(() => {
      return {}
    }, e => {
      throw e
    })
  }

  /**
   * Unbind an IP Allow List from an environment
   *
   * @param {string} programId - the program id
   * @param {string} ipAllowlistId - the allow list id
   * @param {string} environmentId - the environment id
   * @param {string} service - the service name
   * @returns {Promise<object>} a truthy value
   */
  async removeIpAllowlistBinding (programId, ipAllowlistId, environmentId, service) {
    const ipAllowlist = await this._findIpAllowlist(programId, ipAllowlistId)
    let binding = ipAllowlist.bindings.find(b => b.environmentId === environmentId && b.tier === service)
    if (!binding) {
      throw new codes.ERROR_FIND_IP_ALLOWLIST_BINDING({ messageValues: [ipAllowlistId, environmentId, service, programId] })
    }
    binding = halfred.parse(binding)
    return this._delete(binding.link(rels.self).href, codes.ERROR_DELETE_IP_ALLOWLIST_BINDING).then(() => {
      return {}
    }, e => {
      throw e
    })
  }

  /**
   * Make a Post to Commerce API
   *
   * @param {string} programId - the program id
   * @param {string} environmentId - the environment id
   * @param {object} options - options
   * @returns {Promise<object>} a truthy value
   */
  async postCommerceCommandExecution (programId, environmentId, options) {
    const environment = await this._findEnvironment(programId, environmentId)
    const link = environment.link(rels.commerceCommandExecution)
    if (!link) {
      throw new codes.ERROR_COMMERCE_CLI({ messageValues: environmentId })
    }
    return this._post(link.href, options, codes.ERROR_POST_COMMERCE_CLI).then(async (res) => {
      return halfred.parse(await res.json())
    }, e => {
      throw e
    })
  }

  /**
   * Get status for an existing Commerce execution
   *
   * @param {string} programId - the program id
   * @param {string} environmentId - the environment id
   * @param {string} commandExecutionId - the command execution id
   * @returns {Promise<object>} a truthy value of the commerce execution
   */
  async getCommerceCommandExecution (programId, environmentId, commandExecutionId) {
    const environment = await this._findEnvironment(programId, environmentId)
    const environmentLink = environment.link(rels.commerceCommandExecutionId)

    if (!environmentLink) {
      throw new codes.ERROR_COMMERCE_CLI({ messageValues: environmentId })
    }

    const executionTemplate = UriTemplate.parse(environmentLink.href)
    const executionLink = executionTemplate.expand({ commandExecutionId: commandExecutionId })

    return this._get(executionLink, codes.ERROR_GET_COMMERCE_CLI).then(async res => {
      return halfred.parse(await res.json())
    }, e => {
      throw e
    })
  }

  _getCommerceCommandLogUrl (environment, commandExecutionId) {
    const logLink = environment.link(rels.commerceLogs)

    if (!logLink) {
      throw new codes.ERROR_NO_LOG_URL({ messageValues: environment.id })
    }

    const logLinkTemplate = UriTemplate.parse(logLink.href)
    const logLinkWithExecutionId = logLinkTemplate.expand({ commandExecutionId: commandExecutionId })

    return logLinkWithExecutionId
  }

  async _getCommerceCommandStatus (programId, environmentId, commandExecutionId) {
    return await this.getCommerceCommandExecution(programId, environmentId, commandExecutionId).then(res => res.status)
  }

  async _getTailLogRedirectUrl (href) {
    return this._get(href, codes.ERROR_GET_LOG).then(async (res) => {
      const json = await res.json()
      if (json.redirect) {
        return json.redirect
      } else {
        throw new codes.ERROR_NO_LOG_REDIRECT({ messageValues: [res.url, JSON.stringify(json)] })
      }
    }, e => {
      throw e
    })
  }

  _commerceLogTransform () {
    const liner = new Transform({ objectMode: true })
    liner._transform = function (data, _, done) {
      const lines = data.toString().split('\n')
      for (const line of lines) {
        if (line !== '') {
          try {
            const parsedLine = JSON.parse(line.replace('\n', '\\n'))
            this.push(parsedLine.log)
          } catch (e) {
            // Swallowing the error
          }
        }
      }
      done()
    }

    return liner
  }

  async tailCommerceCommandExecutionLog (programId, environmentId, commandExecutionId, outputStream) {
    let commandStatus = await this._getCommerceCommandStatus(programId, environmentId, commandExecutionId)

    if (commandStatus === 'RUNNING') {
      const environment = await this._findEnvironment(programId, environmentId)
      const link = this._getCommerceCommandLogUrl(environment, commandExecutionId)
      const tailLogRedirectUrl = await this._getTailLogRedirectUrl(link)
      let currentStartLimit = 0

      while (commandStatus === 'RUNNING') {
        let getCommandStatusCounter = 0

        while (getCommandStatusCounter < 3) {
          const res = await fetch(tailLogRedirectUrl, {
            headers: {
              range: `bytes=${currentStartLimit}-`,
            },
          })
          if (res.status === 206) {
            const contentLength = res.headers.get('content-length')
            await this._pipeBodyWithTransform(res.body, outputStream, this._commerceLogTransform)
            currentStartLimit = parseInt(currentStartLimit) + parseInt(contentLength)
          } else if (res.status === 416 || res.status === 404) {
            getCommandStatusCounter++
            await sleep(5000)
          } else {
            throw new codes.ERROR_GET_LOG({ messageValues: commandExecutionId })
          }
        }

        commandStatus = await this._getCommerceCommandStatus(programId, environmentId, commandExecutionId)
      }
    } else {
      throw new codes.ERROR_COMMAND_NOT_RUNNING({ messageValues: commandExecutionId })
    }

    return commandStatus
  }

  /**
   * Get status for an existing Commerce execution
   *
   * @param {string} programId - the program id
   * @param {string} environmentId - the environment id
   * @param {string} type - filter for type of command
   * @param {string} status - filter for status of command
   * @param {string} command - filter for the type of command
   * @returns {Promise<object>} a truthy value of the commerce execution
   */
  async getCommerceCommandExecutions (programId, environmentId, type = null, status = null, command = null) {
    const environment = await this._findEnvironment(programId, environmentId)
    const environmentLink = environment.link(rels.commerceCommandExecutions)

    if (!environmentLink) {
      throw new codes.ERROR_COMMERCE_CLI({ messageValues: environmentId })
    }

    const uri = new URI(environmentLink.href)
    type && uri.addSearch({ property: [`type==${type}`] })
    status && uri.addSearch({ property: [`status==${status}`] })
    command && uri.addSearch({ property: [`command==${command}`] })

    return this._get(uri, codes.ERROR_GET_COMMERCE_CLI).then(async res => {
      return halfred.parse(await res.json()).embeddedArray('commandExecutions')
    }, e => {
      throw e
    })
  }
}

module.exports = {
  init: init,
  getCurrentStep: getCurrentStep,
  getWaitingStep: getWaitingStep,
}
