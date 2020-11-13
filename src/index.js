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
const fetch = require('cross-fetch')
const fs = require('fs')
const zlib = require('zlib')
const util = require('util')
const streamPipeline = util.promisify(require('stream').pipeline)
const _ = require('lodash')
const { codes } = require('./SDKErrors')
const { rels, basePath, problemTypes } = require('./constants')
const { getCurrentStep, getWaitingStep, findStepState, isWithinFiveMinutesOfUTCMidnight, sleep } = require('./helpers')

require('./sdktypes.jsdoc') // for VS Code autocomplete
require('./types.jsdoc') // for VS Code autocomplete

/* global EmbeddedProgram, Pipeline, PipelineExecution, ListPipelineOptions,
   PipelineStepMetrics, Environment, LogOptionRepresentation,
   DownloadedLog, PipelineUpdate, Variable */ // for linter

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

  async _doRequest (path, method, body, ErrorClass) {
    const url = `${this.baseUrl}${path}`
    const options = {
      method: method,
      headers: {
        'x-gw-ims-org-id': this.orgId,
        'X-Api-Key': this.apiKey,
        Authorization: `Bearer ${this.accessToken}`,
        accept: 'application/json'
      }
    }
    if (body) {
      options.body = JSON.stringify(body)
      options.headers['content-type'] = 'application/json'
    }

    logger.debug(`fetch: ${method} ${url}`)
    return new Promise((resolve, reject) => {
      fetch(url, options).then(res => {
        if (res.ok) resolve(res)
        else {
          res.text().then(text => {
            const sdkDetails = { orgId: this.orgId, apiKey: this.apiKey, accessToken: this.accessToken, url, response: res }
            let messageValues = `${res.url} (${res.status} ${res.statusText})`
            const resContentType = res.headers.get('content-type')
            if (resContentType) {
              if (resContentType.indexOf('application/problem+json') === 0) {
                const problem = JSON.parse(text)
                if (problem.errors && problem.errors.length > 0) {
                  const errors = problem.errors.map(error => error.message || error).join(', ')
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
   *
   * @returns {Promise<Pipeline[]>} an array of Pipelines
   */
  async listPipelines (programId, options) {
    const programs = await this.listPrograms()
    let program = programs.find(p => p.id === programId)
    if (!program) {
      throw new codes.ERROR_FIND_PROGRAM({ messageValues: programId })
    }
    program = await this._getProgram(program.link(rels.self).href)
    program = halfred.parse(program)

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
   * Get the current execution for a pipeline
   *
   * @param {string} programId the program id
   * @param {string} pipelineId the pipeline id
   * @returns {Promise<PipelineExecution>} the execution
   */
  async getCurrentExecution (programId, pipelineId) {
    const pipelines = await this.listPipelines(programId)
    const pipeline = pipelines.find(p => p.id === pipelineId)
    if (!pipeline) {
      throw new codes.ERROR_FIND_PIPELINE({ messageValues: [pipelineId, programId] })
    }

    return this._get(pipeline.link(rels.execution).href, codes.ERROR_GET_EXECUTION).then(res => {
      return res.json()
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
    const pipelines = await this.listPipelines(programId)
    const pipeline = pipelines.find(p => p.id === pipelineId)
    if (!pipeline) {
      throw new codes.ERROR_FIND_PIPELINE({ messageValues: [pipelineId, programId] })
    }
    const executionTemplate = UriTemplate.parse(pipeline.link(rels.executionId).href)
    const executionLink = executionTemplate.expand({ executionId: executionId })
    return this._get(executionLink, codes.ERROR_GET_EXECUTION).then(res => {
      return res.json()
    }, e => {
      throw e
    })
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
    const execution = halfred.parse(await this.getExecution(programId, pipelineId, executionId))

    const stepState = findStepState(execution, action)

    if (!stepState) {
      throw new codes.ERROR_FIND_STEP_STATE({ messageValues: [action, executionId] })
    }

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
      throw new Error('Cannot advanced schedule step (yet)')
    } else if (step.action === 'deploy') {
      body.resume = true
    } else {
      const results = await this._getMetricsForStepState(step)
      body.metrics = results.metrics.filter(metric => metric.severity === 'important' && metric.passed === false).map(metric => {
        return {
          ...metric,
          override: true
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
    const programs = await this.listPrograms()
    let program = programs.find(p => p.id === programId)
    if (!program) {
      throw new codes.ERROR_FIND_PROGRAM({ messageValues: programId })
    }
    program = await this._getProgram(program.link(rels.self).href)
    program = halfred.parse(program)

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
    const execution = halfred.parse(await this.getExecution(programId, pipelineId, executionId))

    const stepState = findStepState(execution, action)

    if (!stepState) {
      throw new codes.ERROR_FIND_STEP_STATE({ messageValues: [action, executionId] })
    }

    return this._getLogsForStepState(stepState, logFile, outputStream)
  }

  async _getEnvironment (programId, environmentId) {
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
   *
   * @returns {Promise<LogOptionRepresentation[]>} the log options for the environment
   */
  async listAvailableLogOptions (programId, environmentId) {
    const environment = await this._getEnvironment(programId, environmentId)

    return environment.availableLogOptions || []
  }

  async _getLogs (environment, service, name, days) {
    if (!environment.link(rels.logs)) {
      throw new Error(`Could not find logs link for environment ${environment.id} for program ${environment.programId}`)
    }
    const logsTemplate = UriTemplate.parse(environment.link(rels.logs).href)
    const logsLink = logsTemplate.expand({ service: service, name: name, days: days })

    return this._get(logsLink).then((res) => {
      if (res.ok) return res.json()
      else throw new Error(`Cannot get logs: ${res.url} (${res.status} ${res.statusText})`)
    })
  }

  async _download (href, outputPath, resultObject) {
    const res = await this._get(href, 'Could not obtain download link')

    const downloadUrl = res.url

    const json = await res.json()
    if (!json || !json.redirect) {
      logger.debug(json)
      throw new Error(`Could not retrieve redirect from ${res.url} (${res.status} ${res.statusText})`)
    }

    const redirectUrl = json.redirect

    const logRes = await fetch(redirectUrl)
    if (!logRes.ok) {
      throw new codes.ERROR_LOG_DOWNLOAD({
        messageValues: [logRes.url, outputPath, logRes.status, logRes.statusText]
      })
    }

    await this._streamAndUnzip(logRes.body, fs.createWriteStream(outputPath)).catch(
      function (error) {
        if (error.errno !== -5 || error.code !== 'Z_BUF_ERROR') {
          throw new codes.ERROR_LOG_UNZIP({ messageValues: [logRes.url, outputPath] })
        }
      }
    )

    return {
      ...resultObject,
      path: outputPath,
      url: downloadUrl
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
    const environments = await this.listEnvironments(programId)
    const environment = environments.find(e => e.id === environmentId)
    if (!environment) {
      throw new codes.ERROR_FIND_ENVIRONMENT({ messageValues: [environmentId, programId] })
    }
    let logs = await this._getLogs(environment, service, name, days)
    logs = halfred.parse(logs)

    const downloads = logs.embeddedArray('downloads') || []

    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory)
    }

    const downloadPromises = []

    downloads.forEach(download => {
      const downloadLinks = download.linkArray(rels.logsDownload)

      if (downloadLinks.length === 0) {

      } else if (downloadLinks.length === 1) {
        const downloadName = `${download.service}-${download.name}-${download.date}.log`
        const path = `${outputDirectory}/${environmentId}-${downloadName}`
        downloadPromises.push(this._download(downloadLinks[0].href, path, {
          ...download,
          index: 0
        }))
      } else {
        for (let i = 0; i < downloadLinks.length; i++) {
          const downloadName = `${download.service}-${download.name}-${download.date}-${i}.log`
          const path = `${outputDirectory}/${environmentId}-${downloadName}`
          downloadPromises.push(this._download(downloadLinks[i].href, path, {
            ...download,
            index: i
          }))
        }
      }
    })

    const downloaded = await Promise.all(downloadPromises)

    return downloaded
  }

  async _getLogFileSizeInitialSize (url) {
    const options = {
      method: 'HEAD'
    }
    const res = await fetch(url, options)
    if (!res.ok) throw new codes.ERROR_LOG_INITIAL_SIZE({ messageValues: url })
    return res.headers.get('content-length')
  }

  async tailLog (programId, environmentId, service, name, outputStream) {
    const environments = await this.listEnvironments(programId)
    const environment = environments.find(e => e.id === environmentId)
    if (!environment) {
      throw new codes.ERROR_FIND_ENVIRONMENT({ messageValues: [environmentId, programId] })
    }
    const tailingSasUrl = await this._getTailingSasUrl(programId, environment, service, name)
    const contentLength = await this._getLogFileSizeInitialSize(tailingSasUrl)
    await this._getLiveStream(programId, environment, service, name, tailingSasUrl, contentLength, outputStream)
  }

  async _getLiveStream (programId, environment, service, name, tailingSasUrl, currentStartLimit, writeStream) {
    for (;;) {
      const options = {
        headers: {
          Range: 'bytes=' + currentStartLimit + '-'
        }
      }
      const res = await fetch(tailingSasUrl, options)
      if (res.status === 206) {
        const contentLength = res.headers.get('content-length')
        res.body.pipe(writeStream)
        currentStartLimit = parseInt(currentStartLimit) + parseInt(contentLength)
      } else if (res.status === 416) {
        await sleep(2000)
        /**
         * Handles the rollover around UTC midnight using delta of 5 minutes before and after midnight
         * to account for client's clock synchronisation
         */
        if (isWithinFiveMinutesOfUTCMidnight(new Date())) {
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
    const pipeline = await this._getPipeline(programId, pipelineId)

    return this._delete(pipeline.link(rels.self).href, codes.ERROR_DELETE_PIPELINE).then(() => {
      return {}
    }, e => {
      throw e
    })
  }

  async _getPipeline (programId, pipelineId) {
    const pipelines = await this.listPipelines(programId)
    const pipeline = pipelines.find(p => p.id === pipelineId)
    if (!pipeline) {
      throw new codes.ERROR_FIND_PIPELINE({ messageValues: [pipelineId, programId] })
    }

    return pipeline
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
    const pipeline = await this._getPipeline(programId, pipelineId)

    const patch = {
      phases: []
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
    const environment = await this._getEnvironment(programId, environmentId)

    let link = environment.link('http://ns.adobe.com/adobecloud/rel/developerConsole')
    if (!link && environment.namespace && environment.cluster) {
      link = {
        href: `https://dev-console-${environment.namespace}.${environment.cluster}.dev.adobeaemcloud.com/dc/`
      }
    }

    if (link) {
      return link.href
    } else {
      throw new codes.ERROR_NO_DEVELOPER_CONSOLE({ messageValues: [environmentId, programId] })
    }
  }

  async _getEnvironmentVariablesLink (programId, environmentId) {
    const environment = await this._getEnvironment(programId, environmentId)

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
    const variablesLink = await this._getEnvironmentVariablesLink(programId, environmentId)

    const variables = await this._get(variablesLink, codes.ERROR_GET_VARIABLES).then(res => {
      return res.json()
    }, e => {
      throw e
    })

    const result = halfred.parse(variables).embeddedArray('variables')
    return result ? result.map(v => v.original()) : []
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
    const variablesLink = await this._getEnvironmentVariablesLink(programId, environmentId)

    return await this._patch(variablesLink, variables, codes.ERROR_SET_VARIABLES).then(() => {
      return true
    }, e => {
      throw e
    })
  }

  async _getPipelineVariablesLink (programId, pipelineId) {
    const pipeline = await this._getPipeline(programId, pipelineId)

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
    const variablesLink = await this._getPipelineVariablesLink(programId, pipelineId)

    const variables = await this._get(variablesLink, codes.ERROR_GET_VARIABLES).then(res => {
      return res.json()
    }, e => {
      throw e
    })

    const result = halfred.parse(variables).embeddedArray('variables')
    return result ? result.map(v => v.original()) : []
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
    const variablesLink = await this._getPipelineVariablesLink(programId, pipelineId)

    return await this._patch(variablesLink, variables, codes.ERROR_SET_VARIABLES).then(() => {
      return true
    }, e => {
      throw e
    })
  }

  /**
   * Delete a program
   *
   * @param {string} programId - the program id
   * @returns {Promise<object>} a truthy value
   */
  async deleteProgram (programId) {
    const programs = await this.listPrograms()
    const program = programs.find(p => p.id === programId)
    if (!program) {
      throw new codes.ERROR_FIND_PROGRAM({ messageValues: programId })
    }
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
    const environments = await this.listEnvironments(programId)
    const environment = environments.find(e => e.id === environmentId)
    if (!environment) {
      throw new codes.ERROR_FIND_ENVIRONMENT({ messageValues: [environmentId, programId] })
    }

    return this._delete(environment.link(rels.self).href, codes.ERROR_DELETE_ENVIRONMENT).then(() => {
      return {}
    }, e => {
      throw e
    })
  }
}

module.exports = {
  init: init,
  getCurrentStep: getCurrentStep,
  getWaitingStep: getWaitingStep
}
