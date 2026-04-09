import { createContext, useContext, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isAuthenticated } from './auth'

const PreviewContext = createContext(false)

export function PreviewProvider({ children }) {
  const [params] = useSearchParams()
  const preview = useMemo(() => {
    if (params.get('preview') !== '1') return false
    return isAuthenticated()
  }, [params])

  return <PreviewContext.Provider value={preview}>{children}</PreviewContext.Provider>
}

export function usePreviewMode() {
  return useContext(PreviewContext)
}
