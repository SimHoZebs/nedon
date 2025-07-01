import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { NextRouter } from 'next/router'
import { Button, ActionBtn, NavBtn, SecondaryBtn, CloseBtn, SplitBtn } from '@/comp/Button'

// Mock Next.js router for NavBtn tests
const mockRouter = {
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  basePath: '',
  isLocaleDomain: true,
  isFallback: false,
  isReady: true,
  isPreview: false,
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  reload: vi.fn(),
  prefetch: vi.fn(),
  beforePopState: vi.fn(),
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
} as unknown as NextRouter

describe('Button', () => {
  it('should render with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should handle onClick events', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click me</Button>)
    
    const button = screen.getByText('Click me')
    await userEvent.click(button)
    
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should handle async onClick events with loading state', async () => {
    const onClickAsync = vi.fn().mockResolvedValue(undefined)
    render(<Button onClickAsync={onClickAsync}>Click me</Button>)
    
    const button = screen.getByText('Click me')
    
    // Click and verify loading state
    fireEvent.click(button)
    
    // Should show loading state
    expect(button).toHaveClass('cursor-wait', 'text-transparent')
    
    // Wait for async operation to complete
    await waitFor(() => {
      expect(onClickAsync).toHaveBeenCalledTimes(1)
    })
    
    // Loading state should be removed
    await waitFor(() => {
      expect(button).not.toHaveClass('cursor-wait', 'text-transparent')
    })
  })

  it('should apply custom className', () => {
    render(<Button className="custom-class">Click me</Button>)
    const button = screen.getByText('Click me')
    expect(button).toHaveClass('custom-class')
  })

  it('should be disabled when disabled prop is passed', () => {
    render(<Button disabled>Click me</Button>)
    const button = screen.getByText('Click me')
    expect(button).toBeDisabled()
  })

  it('should have default button type', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByText('Click me')
    expect(button).toHaveAttribute('type', 'button')
  })
})

describe('ActionBtn', () => {
  it('should render with primary variant by default', () => {
    render(<ActionBtn>Submit</ActionBtn>)
    const button = screen.getByText('Submit')
    expect(button).toHaveClass('bg-indigo-500', 'hover:bg-indigo-600')
  })

  it('should render with negative variant', () => {
    render(<ActionBtn variant="negative">Delete</ActionBtn>)
    const button = screen.getByText('Delete')
    expect(button).toHaveClass('bg-pink-400', 'hover:bg-pink-500')
  })

  it('should apply rounded class when rounded prop is true', () => {
    render(<ActionBtn rounded>Submit</ActionBtn>)
    const button = screen.getByText('Submit')
    expect(button).toHaveClass('rounded-full')
  })

  it('should apply rounded-lg by default', () => {
    render(<ActionBtn>Submit</ActionBtn>)
    const button = screen.getByText('Submit')
    expect(button).toHaveClass('rounded-lg')
  })

  it('should handle async onClick', async () => {
    const onClickAsync = vi.fn().mockResolvedValue(undefined)
    render(<ActionBtn onClickAsync={onClickAsync}>Submit</ActionBtn>)
    
    const button = screen.getByText('Submit')
    await userEvent.click(button)
    
    expect(onClickAsync).toHaveBeenCalledTimes(1)
  })
})

describe('NavBtn', () => {
  it('should render navigation button with link', () => {
    render(<NavBtn router={mockRouter} route="/dashboard">Dashboard</NavBtn>)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/dashboard')
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('should show active state when current route matches', () => {
    const activeRouter = { ...mockRouter, pathname: '/dashboard' }
    render(<NavBtn router={activeRouter} route="/dashboard">Dashboard</NavBtn>)
    
    const link = screen.getByRole('link')
    expect(link).toHaveClass('bg-indigo-200', 'bg-opacity-20', 'text-indigo-200')
  })

  it('should show inactive state when current route does not match', () => {
    render(<NavBtn router={mockRouter} route="/settings">Settings</NavBtn>)
    
    const link = screen.getByRole('link')
    expect(link).toHaveClass('text-zinc-300')
    expect(link).not.toHaveClass('bg-indigo-200')
  })

  it('should render with icon when provided', () => {
    render(
      <NavBtn router={mockRouter} route="/dashboard" icon="icon-[mdi--dashboard]">
        Dashboard
      </NavBtn>
    )
    
    const iconElement = screen.getByRole('link').querySelector('.icon-\\[mdi--dashboard\\]')
    expect(iconElement).toBeInTheDocument()
  })
})

describe('SecondaryBtn', () => {
  it('should render with default styling', () => {
    render(<SecondaryBtn>Secondary</SecondaryBtn>)
    const button = screen.getByText('Secondary')
    expect(button).toHaveClass('bg-indigo-600', 'bg-opacity-20', 'text-indigo-300')
  })

  it('should apply small variant styling', () => {
    render(<SecondaryBtn variant="small">Small</SecondaryBtn>)
    const button = screen.getByText('Small')
    expect(button).toHaveClass('text-xs')
  })

  it('should handle onClick events', async () => {
    const onClick = vi.fn()
    render(<SecondaryBtn onClick={onClick}>Secondary</SecondaryBtn>)
    
    const button = screen.getByText('Secondary')
    await userEvent.click(button)
    
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('CloseBtn', () => {
  it('should render close button with aria-label', () => {
    const onClose = vi.fn()
    render(<CloseBtn onClose={onClose} />)
    
    const button = screen.getByLabelText('Close')
    expect(button).toBeInTheDocument()
  })

  it('should call onClose when clicked', async () => {
    const onClose = vi.fn()
    render(<CloseBtn onClose={onClose} />)
    
    const button = screen.getByLabelText('Close')
    await userEvent.click(button)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should show mobile-only class when isForMobile is true', () => {
    const onClose = vi.fn()
    render(<CloseBtn onClose={onClose} isForMobile />)
    
    const button = screen.getByLabelText('Close')
    expect(button).toHaveClass('lg:hidden')
  })

  it('should show desktop-only class when isForDesktop is true', () => {
    const onClose = vi.fn()
    render(<CloseBtn onClose={onClose} isForDesktop />)
    
    const button = screen.getByLabelText('Close')
    expect(button).toHaveClass('hidden', 'lg:block')
  })
})

describe('SplitBtn', () => {
  it('should render split button with children', () => {
    render(
      <SplitBtn>
        <span>Main Action</span>
        <div>Options</div>
      </SplitBtn>
    )
    
    expect(screen.getByText('Main Action')).toBeInTheDocument()
  })

  it('should toggle options visibility when dropdown is clicked', async () => {
    render(
      <SplitBtn>
        <span>Main Action</span>
        <div>Options</div>
      </SplitBtn>
    )
    
    const dropdown = screen.getByRole('generic').querySelector('.icon-\\[mdi-light--chevron-down\\]')?.parentElement
    expect(dropdown).toBeInTheDocument()
    
    // Initially options should not be visible
    expect(screen.queryByText('Options')).not.toBeInTheDocument()
    
    // Click dropdown to show options
    if (dropdown) {
      await userEvent.click(dropdown)
      expect(screen.getByText('Options')).toBeInTheDocument()
    }
  })

  it('should apply custom className', () => {
    render(<SplitBtn className="custom-split">Main Action</SplitBtn>)
    
    const mainButton = screen.getByText('Main Action')
    expect(mainButton).toHaveClass('custom-split')
  })
})