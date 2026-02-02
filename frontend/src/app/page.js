'use client'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">CMP Starter</h1>
        <p className="text-center text-lg text-gray-600">
          Cookie Consent Management Platform
        </p>
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>The cookie consent banner will appear on first visit.</p>
          <p className="mt-2">You can manage your preferences at any time.</p>
        </div>
      </div>
    </main>
  )
}
