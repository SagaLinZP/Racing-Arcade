import { Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppShell } from '@/app/AppShell'
import { appRoutes, type AppRouteConfig } from '@/app/routes'

function renderRoutes(routes: AppRouteConfig[]) {
  return routes.map((route, index) => (
    <Route key={`${route.path ?? 'layout'}-${index}`} path={route.path} element={route.element}>
      {route.children ? renderRoutes(route.children) : null}
    </Route>
  ))
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<ErrorBoundary><AppShell /></ErrorBoundary>}>
        {renderRoutes(appRoutes)}
      </Route>
    </Routes>
  )
}
