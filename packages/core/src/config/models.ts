/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ModelResolutionContext {
  useGemini3_1?: boolean;
  useACoder3_5Flash?: boolean;
  useCustomTools?: boolean;
  hasAccessToPreview?: boolean;
  requestedModel?: string;
  releaseChannel?: string;
}

/**
 * Interface for the ModelConfigService to break circular dependencies.
 */
export interface IModelConfigService {
  getModelDefinition(modelId: string):
    | {
        tier?: string;
        family?: string;
        isPreview?: boolean;
        displayName?: string;
        features?: {
          thinking?: boolean;
          multimodalToolUse?: boolean;
        };
      }
    | undefined;

  resolveModelId(
    requestedModel: string,
    context?: ModelResolutionContext,
  ): string;

  resolveClassifierModelId(
    tier: string,
    requestedModel: string,
    context?: ModelResolutionContext,
  ): string;
}

/**
 * Interface defining the minimal configuration required for model capability checks.
 * This helps break circular dependencies between Config and models.ts.
 */
export interface ModelCapabilityContext {
  readonly modelConfigService: IModelConfigService;
  getExperimentalDynamicModelConfiguration(): boolean;
}

export const PREVIEW_A_CODER_MODEL = 'gemini-3-pro-preview';
export const PREVIEW_A_CODER_3_1_MODEL = 'gemini-3.1-pro-preview';
export const PREVIEW_A_CODER_3_1_CUSTOM_TOOLS_MODEL =
  'gemini-3.1-pro-preview-customtools';
// TODO: set to none and const once the experiment for 3_5 flash rollut can be
// cleaned up.
export let PREVIEW_A_CODER_FLASH_MODEL = 'gemini-3-flash-preview';
export const DEFAULT_A_CODER_MODEL = 'gemini-2.5-pro';
// TODO: Set to const and update to 'gemini-3.5-flash' once the experiment for
// 3_5 flash rollut can be cleaned up.
// This is set to either the same as the DEFAULT_A_CODER_3_5_FLASH_MODEL const
// OR the SECONDARY_A_CODER_3_5_FLASH_MODEL depending on which is needed for
// the user's backend as determined by hasACoder35FlashGAAccess in
// packages/core/src/config/config.ts
export let DEFAULT_A_CODER_FLASH_MODEL = 'gemini-2.5-flash';
export const DEFAULT_A_CODER_3_5_FLASH_MODEL = 'gemini-3.5-flash';
// This is resolved to 3.5 flash in backends where it is used,
// however those backends do not expect to see the string gemini-3.5-flash
// so we need to provide this model as an alternative name in certain instances.
export const SECONDARY_A_CODER_3_5_FLASH_MODEL = 'gemini-3-flash';

// Used to set default flash models based on access
// TODO: Cleanup once the experiment for 3_5 flash rollut can be cleaned up.
export function setACoderFlashModels(preview: string, defaultFlash: string) {
  PREVIEW_A_CODER_FLASH_MODEL = preview;
  DEFAULT_A_CODER_FLASH_MODEL = defaultFlash;
}
export const DEFAULT_A_CODER_FLASH_LITE_MODEL = 'gemini-3.1-flash-lite';
/** @deprecated Gemini 3.1 Flash Lite is now GA. Use DEFAULT_A_CODER_FLASH_LITE_MODEL. */
export const PREVIEW_A_CODER_FLASH_LITE_MODEL = 'none';

export const GEMMA_4_31B_IT_MODEL = 'gemma-4-31b-it';
export const GEMMA_4_26B_A4B_IT_MODEL = 'gemma-4-26b-a4b-it';

export const VALID_A_CODER_MODELS = new Set([
  PREVIEW_A_CODER_MODEL,
  PREVIEW_A_CODER_3_1_MODEL,
  PREVIEW_A_CODER_3_1_CUSTOM_TOOLS_MODEL,
  PREVIEW_A_CODER_FLASH_MODEL,
  PREVIEW_A_CODER_FLASH_LITE_MODEL,
  DEFAULT_A_CODER_MODEL,
  DEFAULT_A_CODER_FLASH_MODEL,
  DEFAULT_A_CODER_3_5_FLASH_MODEL,
  SECONDARY_A_CODER_3_5_FLASH_MODEL,
  DEFAULT_A_CODER_FLASH_LITE_MODEL,

  GEMMA_4_31B_IT_MODEL,
  GEMMA_4_26B_A4B_IT_MODEL,
]);

/** @deprecated Use A_CODER_MODEL_ALIAS_AUTO instead. */
export const PREVIEW_A_CODER_MODEL_AUTO = 'auto-gemini-3';
/** @deprecated Use A_CODER_MODEL_ALIAS_AUTO instead. */
export const DEFAULT_A_CODER_MODEL_AUTO = 'auto-gemini-2.5';

// Model aliases for user convenience.
export const A_CODER_MODEL_ALIAS_AUTO = 'auto';
export const A_CODER_MODEL_ALIAS_PRO = 'pro';
export const A_CODER_MODEL_ALIAS_FLASH = 'flash';
export const A_CODER_MODEL_ALIAS_FLASH_LITE = 'flash-lite';

export const DEFAULT_A_CODER_EMBEDDING_MODEL = 'gemini-embedding-001';

// Cap the thinking at 8192 to prevent run-away thinking loops.
export const DEFAULT_THINKING_MODE = 8192;

export function getAutoModelDescription(
  hasAccessToPreview: boolean,
  useGemini3_1: boolean = false,
  useACoder3_5Flash: boolean = false,
) {
  const proModel = hasAccessToPreview
    ? useGemini3_1
      ? PREVIEW_A_CODER_3_1_MODEL
      : PREVIEW_A_CODER_MODEL
    : DEFAULT_A_CODER_MODEL;
  const flashModel = hasAccessToPreview
    ? useACoder3_5Flash
      ? DEFAULT_A_CODER_3_5_FLASH_MODEL
      : PREVIEW_A_CODER_FLASH_MODEL
    : DEFAULT_A_CODER_FLASH_MODEL;
  return `Let A-Coder CLI decide the best model for the task: ${getDisplayString(proModel)}, ${getDisplayString(flashModel)}`;
}

/**
 * Resolves the requested model alias (e.g., 'auto', 'pro', 'flash', 'flash-lite')
 * to a concrete model name.
 *
 * @param requestedModel The model alias or concrete model name requested by the user.
 * @param useGemini3_1 Whether to use Gemini 3.1 Pro Preview for auto/pro aliases.
 * @param useACoder3_5Flash Whether to use Gemini 3.5 Flash GA.
 * @param hasAccessToPreview Whether the user has access to preview models.
 * @returns The resolved concrete model name.
 */
export function resolveModel(
  requestedModel: string,
  useGemini3_1: boolean = false,
  useCustomToolModel: boolean = false,
  hasAccessToPreview: boolean = true,
  config?: ModelCapabilityContext,
  useACoder3_5Flash: boolean = false,
): string {
  // Defensive check against non-string inputs at runtime
  const normalizedModel = Array.isArray(requestedModel)
    ? String(requestedModel.at(-1) ?? '').trim() || ''
    : typeof requestedModel !== 'string'
      ? String(requestedModel ?? '').trim() || ''
      : requestedModel.trim() || '';

  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    const resolved = config.modelConfigService.resolveModelId(normalizedModel, {
      useGemini3_1,
      useCustomTools: useCustomToolModel,
      hasAccessToPreview,
      useACoder3_5Flash,
    });

    if (!hasAccessToPreview && isPreviewModel(resolved, config)) {
      // Fallback for unknown preview models.
      if (resolved.includes('flash-lite')) {
        return DEFAULT_A_CODER_FLASH_LITE_MODEL;
      }
      if (resolved.includes('flash')) {
        return DEFAULT_A_CODER_FLASH_MODEL;
      }
      return DEFAULT_A_CODER_MODEL;
    }

    return resolved;
  }

  let resolved: string;
  switch (normalizedModel) {
    case A_CODER_MODEL_ALIAS_AUTO:
    case A_CODER_MODEL_ALIAS_PRO: {
      if (!hasAccessToPreview) {
        resolved = DEFAULT_A_CODER_MODEL;
        break;
      }
      // fallthrough
    }
    case PREVIEW_A_CODER_MODEL:
    case PREVIEW_A_CODER_MODEL_AUTO: {
      if (useGemini3_1) {
        resolved = useCustomToolModel
          ? PREVIEW_A_CODER_3_1_CUSTOM_TOOLS_MODEL
          : PREVIEW_A_CODER_3_1_MODEL;
      } else {
        resolved = PREVIEW_A_CODER_MODEL;
      }
      break;
    }
    case DEFAULT_A_CODER_MODEL_AUTO: {
      resolved = DEFAULT_A_CODER_MODEL;
      break;
    }
    case A_CODER_MODEL_ALIAS_FLASH: {
      resolved = useACoder3_5Flash
        ? DEFAULT_A_CODER_FLASH_MODEL
        : PREVIEW_A_CODER_FLASH_MODEL;
      break;
    }
    case A_CODER_MODEL_ALIAS_FLASH_LITE: {
      resolved = DEFAULT_A_CODER_FLASH_LITE_MODEL;
      break;
    }
    default: {
      resolved = normalizedModel;
      break;
    }
  }

  if (resolved === 'none') {
    return DEFAULT_A_CODER_FLASH_LITE_MODEL;
  }

  if (
    useACoder3_5Flash &&
    isFlashModel(resolved) &&
    normalizedModel !== PREVIEW_A_CODER_FLASH_MODEL
  ) {
    return DEFAULT_A_CODER_FLASH_MODEL;
  }

  if (!hasAccessToPreview && isPreviewModel(resolved)) {
    // Downgrade to stable models if user lacks preview access.
    switch (resolved) {
      case PREVIEW_A_CODER_FLASH_MODEL:
        return DEFAULT_A_CODER_FLASH_MODEL;
      case PREVIEW_A_CODER_MODEL:
      case PREVIEW_A_CODER_3_1_MODEL:
      case PREVIEW_A_CODER_3_1_CUSTOM_TOOLS_MODEL:
        return DEFAULT_A_CODER_MODEL;
      default:
        // Fallback for unknown preview models, preserving original logic.
        if (resolved.includes('flash-lite')) {
          return DEFAULT_A_CODER_FLASH_LITE_MODEL;
        }
        if (resolved.includes('flash')) {
          return DEFAULT_A_CODER_FLASH_MODEL;
        }
        return DEFAULT_A_CODER_MODEL;
    }
  }

  return resolved;
}

function isFlashModel(model: string): boolean {
  return (
    model === DEFAULT_A_CODER_FLASH_MODEL ||
    model === PREVIEW_A_CODER_FLASH_MODEL ||
    model === DEFAULT_A_CODER_3_5_FLASH_MODEL ||
    model === SECONDARY_A_CODER_3_5_FLASH_MODEL ||
    model === 'flash' ||
    model.endsWith('flash')
  );
}

/**
 * Resolves the appropriate model based on the classifier's decision.
 *
 * @param requestedModel The current requested model (e.g. auto).
 * @param modelAlias The alias selected by the classifier ('flash' or 'pro').
 * @param useGemini3_1 Whether to use Gemini 3.1 Pro Preview.
 * @param useCustomToolModel Whether to use the custom tool model.
 * @param config Optional config object for dynamic model configuration.
 * @returns The resolved concrete model name.
 */
export function resolveClassifierModel(
  requestedModel: string,
  modelAlias: string,
  useGemini3_1: boolean = false,
  useCustomToolModel: boolean = false,
  hasAccessToPreview: boolean = true,
  config?: ModelCapabilityContext,
  useACoder3_5Flash: boolean = false,
): string {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    return config.modelConfigService.resolveClassifierModelId(
      modelAlias,
      requestedModel,
      {
        useGemini3_1,
        useCustomTools: useCustomToolModel,
        hasAccessToPreview,
        useACoder3_5Flash,
      },
    );
  }

  if (modelAlias === A_CODER_MODEL_ALIAS_FLASH) {
    if (
      requestedModel === DEFAULT_A_CODER_MODEL_AUTO ||
      requestedModel === DEFAULT_A_CODER_MODEL
    ) {
      return DEFAULT_A_CODER_FLASH_MODEL;
    }
    if (
      requestedModel === PREVIEW_A_CODER_MODEL_AUTO ||
      requestedModel === PREVIEW_A_CODER_MODEL ||
      requestedModel === A_CODER_MODEL_ALIAS_AUTO
    ) {
      if (useACoder3_5Flash) {
        return DEFAULT_A_CODER_FLASH_MODEL;
      }
      return hasAccessToPreview
        ? PREVIEW_A_CODER_FLASH_MODEL
        : DEFAULT_A_CODER_FLASH_MODEL;
    }
    return resolveModel(
      A_CODER_MODEL_ALIAS_FLASH,
      false,
      false,
      hasAccessToPreview,
      config,
      useACoder3_5Flash,
    );
  }
  return resolveModel(
    requestedModel,
    useGemini3_1,
    useCustomToolModel,
    hasAccessToPreview,
    config,
    useACoder3_5Flash,
  );
}

export function getDisplayString(
  model: string,
  config?: ModelCapabilityContext,
) {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    const definition = config.modelConfigService.getModelDefinition(model);
    if (definition?.displayName) {
      return definition.displayName;
    }
  }

  switch (model) {
    case 'gemini-3-flash':
      return DEFAULT_A_CODER_3_5_FLASH_MODEL;
    case A_CODER_MODEL_ALIAS_AUTO:
      return 'Auto';
    case PREVIEW_A_CODER_MODEL_AUTO:
      return 'Auto (Gemini 3)';
    case DEFAULT_A_CODER_MODEL_AUTO:
      return 'Auto (Gemini 2.5)';
    case GEMMA_4_31B_IT_MODEL:
      return GEMMA_4_31B_IT_MODEL;
    case GEMMA_4_26B_A4B_IT_MODEL:
      return GEMMA_4_26B_A4B_IT_MODEL;
    case A_CODER_MODEL_ALIAS_PRO:
      return PREVIEW_A_CODER_MODEL;
    case A_CODER_MODEL_ALIAS_FLASH:
      return PREVIEW_A_CODER_FLASH_MODEL;
    case PREVIEW_A_CODER_3_1_CUSTOM_TOOLS_MODEL:
      return PREVIEW_A_CODER_3_1_MODEL;
    case PREVIEW_A_CODER_FLASH_LITE_MODEL:
      return PREVIEW_A_CODER_FLASH_LITE_MODEL;
    default:
      return model;
  }
}

/**
 * Checks if the model is a preview model.
 *
 * @param model The model name to check.
 * @param config Optional config object for dynamic model configuration.
 * @returns True if the model is a preview model.
 */
export function isPreviewModel(
  model: string,
  config?: ModelCapabilityContext,
): boolean {
  if (model === 'none') {
    return false;
  }
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    return (
      config.modelConfigService.getModelDefinition(model)?.isPreview === true
    );
  }

  return (
    model === PREVIEW_A_CODER_MODEL ||
    model === PREVIEW_A_CODER_3_1_MODEL ||
    model === PREVIEW_A_CODER_3_1_CUSTOM_TOOLS_MODEL ||
    model === PREVIEW_A_CODER_FLASH_MODEL ||
    model === PREVIEW_A_CODER_MODEL_AUTO ||
    model === A_CODER_MODEL_ALIAS_AUTO ||
    model === PREVIEW_A_CODER_FLASH_LITE_MODEL
  );
}

/**
 * Checks if the model is a Pro model.
 *
 * @param model The model name to check.
 * @param config Optional config object for dynamic model configuration.
 * @returns True if the model is a Pro model.
 */
export function isProModel(
  model: string,
  config?: ModelCapabilityContext,
): boolean {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    return config.modelConfigService.getModelDefinition(model)?.tier === 'pro';
  }
  return model.toLowerCase().includes('pro');
}

/**
 * Checks if the model is a Gemini 3 model.
 *
 * @param model The model name to check.
 * @param config Optional config object for dynamic model configuration.
 * @returns True if the model is a Gemini 3 model.
 */
export function isACoder3Model(
  model: string,
  config?: ModelCapabilityContext,
): boolean {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    // Legacy behavior resolves the model first.
    const resolved = resolveModel(model, false, false, true, config);
    return (
      config.modelConfigService.getModelDefinition(resolved)?.family ===
      'gemini-3'
    );
  }

  const resolved = resolveModel(model);
  return /^gemini-3(\.|-|$)/.test(resolved);
}

/**
 * Checks if the model is a Gemini 2.x model.
 *
 * @param model The model name to check.
 * @returns True if the model is a Gemini-2.x model.
 */
export function isACoder2Model(model: string): boolean {
  // This is legacy behavior, will remove this when gemini 2 models are no
  // longer needed.
  return /^gemini-2(\.|$)/.test(model);
}

/**
 * Checks if the model is a "custom" model (not Gemini branded).
 *
 * @param model The model name to check.
 * @param config Optional config object for dynamic model configuration.
 * @returns True if the model is not a Gemini branded model.
 */
export function isCustomModel(
  model: string,
  config?: ModelCapabilityContext,
): boolean {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    const resolved = resolveModel(model, false, false, true, config);
    return (
      config.modelConfigService.getModelDefinition(resolved)?.tier ===
        'custom' || !resolved.startsWith('gemini-')
    );
  }
  const resolved = resolveModel(model);
  return !resolved.startsWith('gemini-');
}

/**
 * Checks if the model should be treated as a modern model.
 * This includes Gemini 3 models and any custom models.
 *
 * @param model The model name to check.
 * @returns True if the model supports modern features like thoughts.
 */
export function supportsModernFeatures(model: string): boolean {
  if (isACoder3Model(model)) return true;
  return isCustomModel(model);
}

/**
 * Checks if the model is an auto model.
 *
 * @param model The model name to check.
 * @param config Optional config object for dynamic model configuration.
 * @returns True if the model is an auto model.
 */
export function isAutoModel(
  model: string,
  config?: ModelCapabilityContext,
): boolean {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    return config.modelConfigService.getModelDefinition(model)?.tier === 'auto';
  }
  return (
    model === A_CODER_MODEL_ALIAS_AUTO ||
    model === PREVIEW_A_CODER_MODEL_AUTO ||
    model === DEFAULT_A_CODER_MODEL_AUTO
  );
}

/**
 * Checks if the model supports multimodal function responses (multimodal data nested within function response).
 * This is supported in Gemini 3.
 *
 * @param model The model name to check.
 * @returns True if the model supports multimodal function responses.
 */
export function supportsMultimodalFunctionResponse(
  model: string,
  config?: ModelCapabilityContext,
): boolean {
  if (config?.getExperimentalDynamicModelConfiguration?.() === true) {
    return (
      config.modelConfigService.getModelDefinition(model)?.features
        ?.multimodalToolUse === true
    );
  }
  return model.startsWith('gemini-3-');
}

/**
 * Checks if the given model is considered active based on the current configuration.
 *
 * @param model The model name to check.
 * @param useGemini3_1 Whether Gemini 3.1 Pro Preview is enabled.
 * @returns True if the model is active.
 */
export function isActiveModel(
  model: string,
  useGemini3_1: boolean = false,
  useCustomToolModel: boolean = false,
  experimentalGemma: boolean = true,
): boolean {
  if (!VALID_A_CODER_MODELS.has(model) || model === 'none') {
    return false;
  }
  if (model === GEMMA_4_31B_IT_MODEL || model === GEMMA_4_26B_A4B_IT_MODEL) {
    return experimentalGemma;
  }
  if (model === PREVIEW_A_CODER_FLASH_LITE_MODEL) {
    return false;
  }
  if (useGemini3_1) {
    if (model === PREVIEW_A_CODER_MODEL) {
      return false;
    }
    if (useCustomToolModel) {
      return model !== PREVIEW_A_CODER_3_1_MODEL;
    } else {
      return model !== PREVIEW_A_CODER_3_1_CUSTOM_TOOLS_MODEL;
    }
  } else {
    return (
      model !== PREVIEW_A_CODER_3_1_MODEL &&
      model !== PREVIEW_A_CODER_3_1_CUSTOM_TOOLS_MODEL
    );
  }
}

export const CCPA_AI_MODEL_MAPPINGS: Record<string, string> = {
  [DEFAULT_A_CODER_3_5_FLASH_MODEL]: SECONDARY_A_CODER_3_5_FLASH_MODEL,
};
