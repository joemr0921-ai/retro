import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: '#ff6b47',
            colorBackground: '#1A1A1A',
            colorText: '#FAFAF0',
            colorInputBackground: '#2A2A2A',
            colorInputText: '#FAFAF0',
          },
        }}
      />
    </div>
  )
}
