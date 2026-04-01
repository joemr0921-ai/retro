import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// These routes require the user to be logged in
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/calculator(.*)',
  '/education(.*)',
  '/plan(.*)',
  '/progress(.*)',
  '/chat(.*)',
  '/quiz(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
