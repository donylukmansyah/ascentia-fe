import assert from 'node:assert/strict'
import { fuzzySearch, getFuzzySuggestion } from './fuzzy-search.ts'

// Test 1: Fuzzy search across candidate strings
const candidates = [
  'xrFuse 2 Automatic Electric Fusion Machine',
  'xrFuse 6 Automatic Electric Fusion Machine',
  'Phoenix Gas Fusion Machine',
  'Vulcan Gas Fusion Machine',
  'Mining',
  'Cement',
  'XRF Scientific',
]

// Typo: "xrfus" should match "xrFuse 2 Automatic Electric Fusion Machine"
const match1 = getFuzzySuggestion(candidates, 'xrfus')
assert.ok(
  match1?.includes('xrFuse'),
  `Expected xrFuse suggestion, got ${match1}`,
)

// Typo: "minig" should match "Mining"
const match2 = getFuzzySuggestion(candidates, 'minig')
assert.equal(match2, 'Mining')

// Typo: "phenix" should match "Phoenix Gas Fusion Machine"
const match3 = getFuzzySuggestion(candidates, 'phenix')
assert.ok(
  match3?.includes('Phoenix'),
  `Expected Phoenix suggestion, got ${match3}`,
)

// Empty or exact match should return null
assert.equal(getFuzzySuggestion(candidates, ''), null)
assert.equal(getFuzzySuggestion(candidates, 'Mining'), null)

// Test 2: Object fuzzy search
const objects = [
  { id: '1', title: 'Fusion Flux' },
  { id: '2', title: 'Calibration Standards' },
]
const result = fuzzySearch(objects, 'fluk', { keys: ['title'] })
assert.equal(result.length, 1)
assert.equal(result[0].title, 'Fusion Flux')

console.log('All fuzzy search unit tests passed successfully!')
