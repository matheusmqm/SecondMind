import './index.css'

import { Spinner, Toast } from '@heroui/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'
import { queryClient } from '@/lib/queryClient'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense
        fallback={
          <div className="grid min-h-dvh place-items-center" role="status">
            <Spinner />
          </div>
        }
      >
        <RouterProvider router={router} />
      </Suspense>
      <Toast.Provider placement="bottom end" />
    </QueryClientProvider>
  </StrictMode>,
)
