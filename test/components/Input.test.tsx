import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Input from '@/comp/Input'

describe('Input', () => {
  it('should render input element', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })

  it('should apply default styling classes', () => {
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass(
      'h-7',
      'w-20',
      'border-b-2',
      'border-zinc-800',
      'bg-zinc-900',
      'p-1',
      'hover:border-zinc-500',
      'sm:w-36'
    )
  })

  it('should merge custom className with default classes', () => {
    render(<Input className="custom-class" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('custom-class')
    expect(input).toHaveClass('h-7', 'border-b-2', 'bg-zinc-900')
  })

  it('should handle value prop', () => {
    render(<Input value="test value" readOnly />)
    const input = screen.getByDisplayValue('test value')
    expect(input).toBeInTheDocument()
  })

  it('should handle placeholder prop', () => {
    render(<Input placeholder="Enter text..." />)
    const input = screen.getByPlaceholderText('Enter text...')
    expect(input).toBeInTheDocument()
  })

  it('should handle onChange events', async () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'hello')
    
    expect(onChange).toHaveBeenCalledTimes(5) // Called for each character
  })

  it('should handle onFocus and onBlur events', async () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    render(<Input onFocus={onFocus} onBlur={onBlur} />)
    
    const input = screen.getByRole('textbox')
    
    await userEvent.click(input)
    expect(onFocus).toHaveBeenCalledTimes(1)
    
    await userEvent.tab()
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is passed', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('should have correct type attribute', () => {
    render(<Input type="email" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('should handle required attribute', () => {
    render(<Input required />)
    const input = screen.getByRole('textbox')
    expect(input).toBeRequired()
  })

  it('should handle maxLength attribute', () => {
    render(<Input maxLength={10} />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('maxLength', '10')
  })

  it('should handle name attribute', () => {
    render(<Input name="test-input" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('name', 'test-input')
  })
})