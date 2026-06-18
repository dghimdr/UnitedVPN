import { SignupForm } from "../AuthForms";

export default function SignUpPage({
  searchParams
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="shell">
      <SignupForm error={searchParams.error} />
    </main>
  );
}
