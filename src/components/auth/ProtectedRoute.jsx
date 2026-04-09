/* eslint-disable react/prop-types */
import { Navigate } from 'react-router-dom'
import { isAuthenticated, needsPasswordSetup } from '../../lib/auth'

export default function ProtectedRoute({ children }) {
  if (needsPasswordSetup()) {
    return <Navigate to="/setup" replace />
  }
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}
