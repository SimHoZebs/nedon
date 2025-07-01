import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { H1, H2, H3, H4 } from '@/comp/Heading'

describe('Heading Components', () => {
  describe('H1', () => {
    it('should render h1 element with children', () => {
      render(<H1>Main Heading</H1>)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Main Heading')
    })

    it('should apply default styling classes', () => {
      render(<H1>Heading</H1>)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveClass('text-3xl', 'font-semibold', 'sm:text-4xl')
    })

    it('should merge custom className with default classes', () => {
      render(<H1 className="custom-class">Heading</H1>)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveClass('custom-class')
      expect(heading).toHaveClass('text-3xl', 'font-semibold', 'sm:text-4xl')
    })

    it('should handle click events', async () => {
      const onClick = vi.fn()
      render(<H1 onClick={onClick}>Clickable Heading</H1>)
      
      const heading = screen.getByText('Clickable Heading')
      await heading.click()
      
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should spread other props', () => {
      render(<H1 data-testid="h1-test" id="main-heading">Heading</H1>)
      const heading = screen.getByTestId('h1-test')
      expect(heading).toHaveAttribute('id', 'main-heading')
    })
  })

  describe('H2', () => {
    it('should render h2 element with children', () => {
      render(<H2>Section Heading</H2>)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Section Heading')
    })

    it('should apply default styling classes', () => {
      render(<H2>Heading</H2>)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveClass('text-2xl', 'font-bold', 'sm:text-3xl')
    })

    it('should merge custom className with default classes', () => {
      render(<H2 className="text-red-500">Heading</H2>)
      const heading = screen.getByRole('heading', { level: 2 })
      expect(heading).toHaveClass('text-red-500')
      expect(heading).toHaveClass('text-2xl', 'font-bold', 'sm:text-3xl')
    })
  })

  describe('H3', () => {
    it('should render h3 element with children', () => {
      render(<H3>Subsection Heading</H3>)
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Subsection Heading')
    })

    it('should apply default styling classes with twMerge', () => {
      render(<H3>Heading</H3>)
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveClass('text-xl', 'font-medium', 'sm:text-2xl')
    })

    it('should merge custom className properly with twMerge', () => {
      render(<H3 className="text-green-500">Heading</H3>)
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveClass('text-green-500')
      expect(heading).toHaveClass('font-medium', 'sm:text-2xl')
    })

    it('should handle override classes properly with twMerge', () => {
      render(<H3 className="text-base">Heading</H3>)
      const heading = screen.getByRole('heading', { level: 3 })
      // twMerge should handle class conflicts properly
      expect(heading).toHaveClass('text-base', 'font-medium', 'sm:text-2xl')
    })
  })

  describe('H4', () => {
    it('should render h4 element with children', () => {
      render(<H4>Minor Heading</H4>)
      const heading = screen.getByRole('heading', { level: 4 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Minor Heading')
    })

    it('should apply default styling classes', () => {
      render(<H4>Heading</H4>)
      const heading = screen.getByRole('heading', { level: 4 })
      expect(heading).toHaveClass('text-lg', 'font-normal', 'sm:text-xl')
    })

    it('should merge custom className with default classes', () => {
      render(<H4 className="text-blue-500">Heading</H4>)
      const heading = screen.getByRole('heading', { level: 4 })
      expect(heading).toHaveClass('text-blue-500')
      expect(heading).toHaveClass('text-lg', 'font-normal', 'sm:text-xl')
    })

    it('should handle all HTML heading attributes', () => {
      render(
        <H4 
          data-testid="h4-test" 
          id="minor-heading" 
          role="heading"
          aria-level={4}
        >
          Heading
        </H4>
      )
      const heading = screen.getByTestId('h4-test')
      expect(heading).toHaveAttribute('id', 'minor-heading')
      expect(heading).toHaveAttribute('role', 'heading')
      expect(heading).toHaveAttribute('aria-level', '4')
    })
  })

  describe('All Heading Components', () => {
    it('should render different heading levels correctly', () => {
      render(
        <div>
          <H1>Level 1</H1>
          <H2>Level 2</H2>
          <H3>Level 3</H3>
          <H4>Level 4</H4>
        </div>
      )

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Level 1')
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Level 2')
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Level 3')
      expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Level 4')
    })

    it('should have proper semantic hierarchy', () => {
      render(
        <div>
          <H1>Main Title</H1>
          <H2>Section</H2>
          <H3>Subsection</H3>
          <H4>Minor Section</H4>
        </div>
      )

      const headings = screen.getAllByRole('heading')
      expect(headings).toHaveLength(4)
      
      // Check that they are properly ordered
      expect(headings[0].tagName).toBe('H1')
      expect(headings[1].tagName).toBe('H2')
      expect(headings[2].tagName).toBe('H3')
      expect(headings[3].tagName).toBe('H4')
    })
  })
})