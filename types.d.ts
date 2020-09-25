/**
 * Returns a Promise that resolves with a new CloudManagerAPI object.
 * @param orgId - the organization id
 * @param apiKey - the API key for your integration
 * @param accessToken - the access token for your integration
 * @param baseUrl - the base URL to access the API (defaults to https://cloudmanager.adobe.io)
 * @returns a Promise with a CloudManagerAPI object
 */
declare function init(orgId: string, apiKey: string, accessToken: string, baseUrl: string): Promise<CloudManagerAPI>;

/**
 * This class provides methods to call your Cloud Manager APIs.
 * Before calling any method initialize the instance by calling the `init` method on it
 * with valid values for tenantId, apiKey and accessToken
 */
declare class CloudManagerAPI {
    /**
     * Initializes a CloudManagerAPI object and returns it.
     * @param orgId - the organization id
     * @param apiKey - the API key for your integration
     * @param accessToken - the access token for your integration
     * @param baseUrl - the base URL to access the API (defaults to https://cloudmanager.adobe.io)
     * @returns a CloudManagerAPI object
     */
    init(orgId: string, apiKey: string, accessToken: string, baseUrl: string): Promise<CloudManagerAPI>;
    /**
     * The organization id
     */
    orgId: string;
    /**
     * The api key from your integration
     */
    apiKey: string;
    /**
     * The access token from your integration
     */
    accessToken: string;
    /**
     * The base URL for the API endpoint
     */
    baseUrl: string;
    /**
     * Obtain a list of programs for the target organization.
     * @returns an array of Programs
     */
    listPrograms(): Promise<EmbeddedProgram[]>;
    /**
     * Obtain a list of pipelines for the target program.
     * @param programId - the program id
     * @param options - options
     * @returns an array of Pipelines
     */
    listPipelines(programId: string, options: ListProgramOptions): Promise<Pipeline[]>;
    /**
     * Start an execution for a pipeline
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @returns the execution url
     */
    startExecution(programId: string, pipelineId: string): string;
    /**
     * Get the current execution for a pipeline
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @returns the execution
     */
    getCurrentExecution(programId: string, pipelineId: string): PipelineExecution;
    /**
     * Get an execution for a pipeline
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @param executionId - the execution id
     * @returns the execution
     */
    getExecution(programId: string, pipelineId: string, executionId: string): PipelineExecution;
    /**
     * Get the quality gate results for a pipeline step
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @param executionId - the execution id
     * @param action - the action name
     * @returns the execution
     */
    getQualityGateResults(programId: string, pipelineId: string, executionId: string, action: string): PipelineStepMetrics;
    /**
     * Cancel current execution
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @returns a truthy value
     */
    cancelCurrentExecution(programId: string, pipelineId: string): any;
    /**
     * Advance current execution
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @returns a truthy value
     */
    advanceCurrentExecution(programId: string, pipelineId: string): any;
    /**
     * List environments for a program
     * @param programId - the program id
     * @returns a list of environments
     */
    listEnvironments(programId: string): Environment[];
    /**
     * Write step log to an output stream.
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @param executionId - the execution id
     * @param action - the action
     * @param logFile - the log file to select a non-default value
     * @param outputStream - the output stream to write to
     * @returns a list of environments
     */
    getExecutionStepLog(programId: string, pipelineId: string, executionId: string, action: string, logFile: string, outputStream: any): Environment[];
    /**
     * List the log options available for an environment
     * @param programId - the program id
     * @param environmentId - the environment id
     * @returns the log options for the environment
     */
    listAvailableLogOptions(programId: string, environmentId: string): LogOptionRepresentation[];
    /**
     * Download log files from the environment to a specified directory.
     * @param programId - the program id
     * @param environmentId - the environment id
     * @param service - the service specification
     * @param name - the log name
     * @param days - the number of days
     * @param outputDirectory - the output directory
     * @returns the list of downloaded logs
     */
    downloadLogs(programId: string, environmentId: string, service: string, name: string, days: number, outputDirectory: string): DownloadedLog[];
    /**
     * Delete a pipeline
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @returns a truthy object
     */
    deletePipeline(programId: string, pipelineId: string): any;
    /**
     * Update a pipeline
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @param changes - the changes
     * @returns the new pipeline definition
     */
    updatePipeline(programId: string, pipelineId: string, changes: PipelineUpdate): Pipeline;
    /**
     * Get the link to the developer console
     * @param programId - the program id
     * @param environmentId - the environment id
     * @returns the console url
     */
    getDeveloperConsoleUrl(programId: string, environmentId: string): string;
    /**
     * Get the list of variables for an environment
     * @param programId - the program id
     * @param environmentId - the environment id
     * @returns the variables
     */
    getEnvironmentVariables(programId: string, environmentId: string): Variable[];
    /**
     * Set the variables for an environment
     * @param programId - the program id
     * @param environmentId - the environment id
     * @param variables - the variables
     * @returns a truthy value
     */
    setEnvironmentVariables(programId: string, environmentId: string, variables: Variable[]): any;
    /**
     * Get the list of variables for a pipeline
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @returns the variables
     */
    getPipelineVariables(programId: string, pipelineId: string): Variable[];
    /**
     * Set the variables for a pipeline
     * @param programId - the program id
     * @param pipelineId - the pipeline id
     * @param variables - the variables
     * @returns a truthy value
     */
    setPipelineVariables(programId: string, pipelineId: string, variables: Variable[]): any;
    /**
     * Delete a program
     * @param programId - the program id
     * @returns a truthy value
     */
    deleteProgram(programId: string): any;
    /**
     * Delete an environment
     * @param programId - the program id
     * @param environmentId - the environment id
     * @returns a truthy value
     */
    deleteEnvironment(programId: string, environmentId: string): any;
}

/**
 * Options to the listPipeline function
 * @property busy - if true, only busy pipelines will be returned
 */
declare type ListProgramOptions = {
    busy: boolean;
};

/**
 * A lightweight representation of a Program
 * @property id - Identifier of the program. Unique within the space.
 * @property name - Name of the program
 * @property enabled - Whether this Program has been enabled for Cloud Manager usage
 * @property tenantId - Tenant Id
 */
declare type EmbeddedProgram = {
    id: string;
    name: string;
    enabled: boolean;
    tenantId: string;
};

/**
 * A representation of a CI/CD Pipeline
 * @property id - Identifier of the pipeline. Unique within the program.
 * @property programId - Identifier of the program. Unique within the space.
 * @property name - Name of the pipeline
 * @property trigger - How should the execution be triggered. ON_COMMIT: each time a PR is available and the Pipeline is idle then a execution is triggered. MANUAL: triggerd through UI or API. SCHEDULE: recurring schedule (not yet implemented}
 * @property status - Pipeline status
 * @property createdAt - Create date
 * @property updatedAt - Update date
 * @property lastStartedAt - Last pipeline execution start
 * @property lastFinishedAt - Last pipeline execution end
 * @property phases - Pipeline phases in execution order
 */
declare type Pipeline = {
    id: string;
    programId: string;
    name: string;
    trigger: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    lastStartedAt: string;
    lastFinishedAt: string;
    phases: PipelinePhase[];
};

/**
 * Describes a phase of a pipeline
 * @property name - Name of the phase
 * @property type - Type of the phase
 * @property repositoryId - Identifier of the source repository. The code from this repository will be build at the start of this phase.
 * Mandatory if type=BUILD
 * @property branch - Name of the tracked branch or a fully qualified git tag (e.g. refs/tags/v1).
 *  Assumed to be `master` if missing.
 * @property environmentId - Identifier of the target environment. Mandatory if type=DEPLOY
 */
declare type PipelinePhase = {
    name: string;
    type: string;
    repositoryId: string;
    branch: string;
    environmentId: string;
};

/**
 * A representation of an execution of a CI/CD Pipeline.
 * @property id - Pipeline execution identifier
 * @property programId - Identifier of the program. Unique within the space.
 * @property pipelineId - Identifier of the pipeline. Unique within the space.
 * @property artifactsVersion - Version of the artifacts generated during this execution
 * @property user - AdobeID who started the pipeline. Empty for auto triggered builds
 * @property status - Status of the execution
 * @property trigger - How the execution was triggered.
 * @property createdAt - Start time
 * @property updatedAt - Date of last status change
 * @property finishedAt - Date the execution reached a final state
 */
declare type PipelineExecution = {
    id: string;
    programId: string;
    pipelineId: string;
    artifactsVersion: string;
    user: string;
    status: string;
    trigger: string;
    createdAt: string;
    updatedAt: string;
    finishedAt: string;
};

/**
 * @property metrics - metrics
 */
declare type PipelineStepMetrics = {
    metrics: Metric[];
};

/**
 * A representation of a specific metric generated by a CI/CD Pipeline step.
 * @property id - KPI result identifier
 * @property severity - Severity of the metric
 * @property passed - Whether metric is considered passed
 * @property override - Whether user override the failed metric
 * @property actualValue - Expected value for the metric
 * @property expectedValue - Expected value for the metric
 * @property comparator - Comparator used for the metric
 * @property kpi - KPI identifier
 */
declare type Metric = {
    id: string;
    severity: string;
    passed: boolean;
    override: boolean;
    actualValue: string;
    expectedValue: string;
    comparator: string;
    kpi: string;
};

/**
 * A representation of an Environment known to Cloud Manager.
 * @property id - id
 * @property programId - Identifier of the program. Unique within the space.
 * @property name - Name of the environment
 * @property description - Description of the environment
 * @property type - Type of the environment
 * @property availableLogOptions - List of logs available in the environment
 */
declare type Environment = {
    id: string;
    programId: string;
    name: string;
    description: string;
    type: string;
    availableLogOptions: LogOptionRepresentation[];
};

/**
 * A named value than can be set on an Environment or Pipeline
 * @property name - Name of the variable. Of a-z, A-Z, _ and 0-9 Cannot begin with a number.
 * @property value - Value of the variable. Read-Write for non-secrets, write-only for secrets.
 * @property type - Type of the variable. Default `string` if missing. `secretString` variables are encrypted at rest. Cannot be changed after creation.
 */
declare type Variable = {
    name: string;
    value: string;
    type: string;
};

/**
 * @property service - Name of the service in environment. Example: author
 * @property name - Name of the log for service in environment. Example: aemerror
 */
declare type LogOptionRepresentation = {
    service: string;
    name: string;
};

/**
 * @property path - the path where the log was stored
 * @property url - the url of the log that was downloaded
 */
declare type DownloadedLog = {
    path: string;
    url: string;
};

/**
 * @property branch - the new branch
 * @property repositoryId - the new repository id
 */
declare type PipelineUpdate = {
    branch: string;
    repositoryId: string;
};

