import { render, screen, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(() => {
  cleanup()
})

describe('App', () => {
  it('renders the sidebar with MailCraft branding', () => {
    render(<App />)
    expect(screen.getByText('MailCraft')).toBeInTheDocument()
  })

  it('renders the sidebar navigation', () => {
    render(<App />)
    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar).toBeInTheDocument()
    expect(sidebar).toHaveTextContent('Templates')
    expect(sidebar).toHaveTextContent('Home')
    expect(sidebar).toHaveTextContent('Account')
  })
})
