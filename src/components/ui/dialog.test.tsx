import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog'

describe('Dialog Component - Mobile UX', () => {
  it('should render dialog with mobile-responsive width classes', () => {
    render(
      <Dialog open={true}>
        <DialogContent data-testid="dialog-content">
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogDescription>Test description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )

    // Check that DialogContent has responsive width class
    const dialogContent = screen.getByTestId('dialog-content')
    expect(dialogContent).toBeInTheDocument()
    expect(dialogContent).toHaveClass('w-[calc(100%-2rem)]')
  })

  it('should have max-width constraint for larger screens', () => {
    render(
      <Dialog open={true}>
        <DialogContent data-testid="dialog-content">
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )

    const dialogContent = screen.getByTestId('dialog-content')
    expect(dialogContent).toHaveClass('max-w-lg')
  })

  it('should render dialog content with proper centering', () => {
    render(
      <Dialog open={true}>
        <DialogContent data-testid="dialog-content">
          <DialogTitle>Centered Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    const dialogContent = screen.getByTestId('dialog-content')
    expect(dialogContent).toHaveClass('translate-x-[-50%]')
    expect(dialogContent).toHaveClass('translate-y-[-50%]')
  })

  it('should render with proper overflow and padding', () => {
    render(
      <Dialog open={true}>
        <DialogContent data-testid="dialog-content">
          <DialogTitle>Test Content</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    const dialogContent = screen.getByTestId('dialog-content')
    expect(dialogContent).toHaveClass('p-6')
  })

  it('should render close button', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    const closeButton = screen.getByRole('button', { name: /close/i })
    expect(closeButton).toBeInTheDocument()
  })
})
