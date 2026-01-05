import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from './alert-dialog'

describe('AlertDialog Component - Mobile UX', () => {
  it('should render alert dialog with mobile-responsive width classes', () => {
    render(
      <AlertDialog open={true}>
        <AlertDialogContent data-testid="alert-dialog-content">
          <AlertDialogHeader>
            <AlertDialogTitle>Test Alert</AlertDialogTitle>
            <AlertDialogDescription>Test description</AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    )

    // Check that AlertDialogContent has responsive width class
    const dialogContent = screen.getByTestId('alert-dialog-content')
    expect(dialogContent).toBeInTheDocument()
    expect(dialogContent).toHaveClass('w-[calc(100%-2rem)]')
  })

  it('should have max-width constraint', () => {
    render(
      <AlertDialog open={true}>
        <AlertDialogContent data-testid="alert-dialog-content">
          <AlertDialogTitle>Test Alert</AlertDialogTitle>
          <AlertDialogDescription>Test description</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    )

    const dialogContent = screen.getByTestId('alert-dialog-content')
    expect(dialogContent).toHaveClass('max-w-lg')
  })

  it('should render with proper centering', () => {
    render(
      <AlertDialog open={true}>
        <AlertDialogContent data-testid="alert-dialog-content">
          <AlertDialogTitle>Centered Alert</AlertDialogTitle>
          <AlertDialogDescription>Test description</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    )

    const dialogContent = screen.getByTestId('alert-dialog-content')
    expect(dialogContent).toHaveClass('translate-x-[-50%]')
    expect(dialogContent).toHaveClass('translate-y-[-50%]')
  })

  it('should render action buttons with responsive layout', () => {
    render(
      <AlertDialog open={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>Test description</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )

    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Confirm')).toBeInTheDocument()
  })

  it('should have proper footer layout for mobile/desktop', () => {
    render(
      <AlertDialog open={true}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Test</AlertDialogTitle>
            <AlertDialogDescription>Test description</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter data-testid="alert-footer">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )

    // Footer should have flex-col-reverse on mobile, flex-row on desktop
    const footer = screen.getByTestId('alert-footer')
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveClass('flex-col-reverse')
  })
})
