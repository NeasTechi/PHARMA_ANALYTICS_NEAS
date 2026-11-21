import { describe, it, expect } from 'vitest'
import { escapeHtml, renderAnswer } from './ChatPanel'

describe('escapeHtml', () => {
    it('escapes HTML special characters', () => {
        expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')
    })

    it('escapes ampersand and quotes', () => {
        expect(escapeHtml('Tom & Jerry "test"')).toBe('Tom &amp; Jerry &quot;test&quot;')
    })

    it('handles null and undefined', () => {
        expect(escapeHtml(null)).toBe('')
        expect(escapeHtml(undefined)).toBe('')
    })

    it('leaves safe text unchanged', () => {
        expect(escapeHtml('Amoxicillin 3')).toBe('Amoxicillin 3')
    })
})

describe('renderAnswer', () => {
    it('renders plain text as div children', () => {
        const out = renderAnswer('Hello world')
        expect(out).toHaveLength(1)
        expect(out[0].props.children).toBe('Hello world')
    })

    it('renders markdown table as table element', () => {
        const answer = '| product | supplier | profit |\n|---------|----------|--------|\n| Amoxicillin 3 | MedSource Philippines 3 | 366.52 |'
        const out = renderAnswer(answer)
        const table = out.find((n) => n.type === 'table')
        expect(table).toBeDefined()
        // Header row: thead > tr > [th, th, th]
        const thead = table.props.children[0]
        const tr = thead.props.children
        expect(tr.props.children[0].props.children).toBe('product')
        expect(tr.props.children[1].props.children).toBe('supplier')
        expect(tr.props.children[2].props.children).toBe('profit')
        // Data row: tbody > [tr] > [td, td, td]
        const tbody = table.props.children[1]
        const bodyChildren = tbody.props.children
        const dataTr = Array.isArray(bodyChildren) ? bodyChildren[0] : bodyChildren
        expect(dataTr.props.children[0].props.children).toBe('Amoxicillin 3')
        expect(dataTr.props.children[1].props.children).toBe('MedSource Philippines 3')
        expect(dataTr.props.children[2].props.children).toBe('366.52')
    })

    it('escapes HTML in table cells', () => {
        const answer = '| name | value |\n|------|-------|\n| <script>alert(1)</script> | 42 |'
        const out = renderAnswer(answer)
        const table = out.find((n) => n.type === 'table')
        const tbody = table.props.children[1]
        const bodyChildren = tbody.props.children
        const dataTr = Array.isArray(bodyChildren) ? bodyChildren[0] : bodyChildren
        const cell = dataTr.props.children[0].props.children
        expect(cell).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')
    })

    it('renders text and table together', () => {
        const answer = 'Summary text.\n\n| col1 | col2 |\n|------|------|\n| a | b |'
        const out = renderAnswer(answer)
        // Lines: 'Summary text.', '' (blank), '| col1 | col2 |'
        expect(out).toHaveLength(3)
        expect(out[0].props.children).toBe('Summary text.')
        const table = out.find((n) => n.type === 'table')
        expect(table).toBeDefined()
    })

    it('handles empty input', () => {
        const out = renderAnswer('')
        expect(out).toHaveLength(1)
        expect(out[0].props.children).toBe('')
    })
})
