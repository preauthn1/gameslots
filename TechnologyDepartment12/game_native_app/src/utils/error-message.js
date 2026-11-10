import { messages } from '@/i18n/messages.js'
import getCurrentLang from '@/utils/getCurrentLang.js'

export const SILENT_NETWORK_ERROR_MESSAGE = '__silent_network_error__'

const SUSPICIOUS_ERROR_PATTERNS = [
  /sql/i,
  /syntax error/i,
  /mysql/i,
  /postgres/i,
  /sqlite/i,
  /ora-\d+/i,
  /exception/i,
  /stack trace/i,
  /\bat\s+[\w$.<>]+\s*\(/i,
  /nullpointer/i,
  /undefined offset/i,
  /unknown column/i,
  /unknown table/i,
  /table .* doesn't exist/i,
  /query failed/i,
  /select .* from/i,
  /insert into/i,
  /update .* set/i,
  /delete from/i,
  /<html/i,
  /<!doctype html/i,
  /nginx/i,
  /apache/i,
  /internal server error/i,
]

function getTranslation(key, fallback) {
  try {
    const locale = getCurrentLang()
    const currentMessages = messages[locale] || messages.en || {}
    const keys = key.split('.')

    let value = currentMessages
    for (const part of keys) {
      value = value?.[part]
      if (value === undefined) {
        break
      }
    }

    return value !== undefined ? value : fallback
  } catch {
    return fallback
  }
}

function normalizeMessage(message) {
  if (typeof message !== 'string') {
    return ''
  }

  return message.replace(/\s+/g, ' ').trim()
}

export function isSilentErrorMessage(message) {
  return normalizeMessage(message) === SILENT_NETWORK_ERROR_MESSAGE
}

export function shouldMaskErrorMessage(message) {
  const normalized = normalizeMessage(message)

  if (!normalized) {
    return false
  }

  return SUSPICIOUS_ERROR_PATTERNS.some((pattern) => pattern.test(normalized))
}

export function getSafeErrorMessage(message, fallback) {
  const fallbackMessage = fallback || getTranslation('errors.requestFailed', 'Request failed, please try again')

  const normalized = normalizeMessage(message)
  if (!normalized) {
    return fallbackMessage
  }

  if (shouldMaskErrorMessage(normalized)) {
    return fallbackMessage
  }

  return normalized
}
