import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs"; // Asegúrate de importar SignInButton y SignUpButton
import { Button } from "@/app/components/ui/button"; // Nota el "app/" añadido

export default function AuthButtons() {
  return (
    <>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="outline" className="mr-2">Sign In</Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button>Sign Up</Button>
        </SignUpButton>
      </SignedOut>
    </>
  );
}