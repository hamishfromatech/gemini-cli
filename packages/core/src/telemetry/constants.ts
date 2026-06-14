/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * @license
 */

export const SERVICE_NAME = 'a-coder-cli';
export const SERVICE_DESCRIPTION =
  'A-Coder CLI is an open-source AI agent that brings local and OpenAI-compatible models directly into your terminal.';

export const GEN_AI_OPERATION_NAME = 'gen_ai.operation.name';
export const GEN_AI_AGENT_NAME = 'gen_ai.agent.name';
export const GEN_AI_AGENT_DESCRIPTION = 'gen_ai.agent.description';
export const GEN_AI_INPUT_MESSAGES = 'gen_ai.input.messages';
export const GEN_AI_OUTPUT_MESSAGES = 'gen_ai.output.messages';
export const GEN_AI_REQUEST_MODEL = 'gen_ai.request.model';
export const GEN_AI_RESPONSE_MODEL = 'gen_ai.response.model';
export const GEN_AI_PROMPT_NAME = 'gen_ai.prompt.name';
export const GEN_AI_TOOL_NAME = 'gen_ai.tool.name';
export const GEN_AI_TOOL_CALL_ID = 'gen_ai.tool.call_id';
export const GEN_AI_TOOL_DESCRIPTION = 'gen_ai.tool.description';
export const GEN_AI_USAGE_INPUT_TOKENS = 'gen_ai.usage.input_tokens';
export const GEN_AI_USAGE_OUTPUT_TOKENS = 'gen_ai.usage.output_tokens';
export const GEN_AI_SYSTEM_INSTRUCTIONS = 'gen_ai.system_instructions';
export const GEN_AI_TOOL_DEFINITIONS = 'gen_ai.tool.definitions';
export const GEN_AI_CONVERSATION_ID = 'gen_ai.conversation.id';

export enum ACoderCliOperation {
  ToolCall = 'tool_call',
  LLMCall = 'llm_call',
  UserPrompt = 'user_prompt',
  SystemPrompt = 'system_prompt',
  AgentCall = 'agent_call',
  ScheduleToolCalls = 'schedule_tool_calls',
}

/** @deprecated Use ACoderCliOperation. */
export const GeminiCliOperation = ACoderCliOperation;
