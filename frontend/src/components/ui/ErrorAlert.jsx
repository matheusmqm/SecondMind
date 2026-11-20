import { Alert } from '@heroui/react'

/** Inline error, with the HeroUI icon and a role so screen readers announce it. */
export function ErrorAlert({ children, className }) {
  return (
    <Alert status="danger" className={className} role="alert">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Description>{children}</Alert.Description>
      </Alert.Content>
    </Alert>
  )
}
