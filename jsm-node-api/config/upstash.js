import { Client as WorkflowClient } from '@upstash/workflow';
// eslint-disable-next-line no-undef
const QSTASH_TOKEN = process.env.QSTASH_TOKEN
// eslint-disable-next-line no-undef
const QSTASH_URL = process.env.QSTASH_URL

export const workflowClient = new WorkflowClient({
  baseUrl: QSTASH_URL,
  token: QSTASH_TOKEN,
});