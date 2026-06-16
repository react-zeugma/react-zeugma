import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { useZeugma, useZeugmaContext, Zeugma } from '../../../index'
import { useZeugmaState, useZeugmaActions } from '../../../shared'
import type { TreeNode, ZeugmaContextValue } from '../../../shared'

describe('Zeugma Context Provider & Consumers', () => {
  const initialLayout: TreeNode = {
    type: 'pane',
    id: 'pane-1',
    tabs: ['tab-1'],
    activeTabId: 'tab-1',
  }

  it('should throw error when useZeugmaState is used outside provider', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => {
      renderHook(() => useZeugmaState())
    }).toThrow('useZeugmaState must be used within a Zeugma provider')
    consoleErrorSpy.mockRestore()
  })

  it('should throw error when useZeugmaActions is used outside provider', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => {
      renderHook(() => useZeugmaActions())
    }).toThrow('useZeugmaActions must be used within a Zeugma provider')
    consoleErrorSpy.mockRestore()
  })

  it('should successfully render children and provide context values', () => {
    let contextValue = null as unknown as ZeugmaContextValue
    const ConsumerComponent = () => {
      contextValue = useZeugmaContext()
      return <div data-testid="child">Child Component</div>
    }

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout })
      return (
        <Zeugma {...controller} renderPane={(id) => <div key={id} />}>
          <ConsumerComponent />
        </Zeugma>
      )
    }

    render(<TestWrapper />)

    expect(screen.getByTestId('child')).toBeDefined()
    expect(contextValue).not.toBeNull()
    expect(contextValue.layout).toEqual(initialLayout)

    // Actions should be present
    expect(typeof contextValue.addTab).toBe('function')
    expect(typeof contextValue.addPane).toBe('function')
    expect(typeof contextValue.removePane).toBe('function')
    expect(typeof contextValue.setFullscreenPaneId).toBe('function')
    expect(typeof contextValue.setLocked).toBe('function')
    expect(typeof contextValue.splitPane).toBe('function')
    expect(typeof contextValue.updateSplitPercentage).toBe('function')
    expect(typeof contextValue.moveTab).toBe('function')
  })
})
