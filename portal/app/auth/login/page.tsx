import { LoginForm } from "../AuthForms";

type LoginPageProps = {
  searchParams: {
    error?: string | string[];
  };
};

function getLoginError(searchParams: LoginPageProps["searchParams"]) {
  const error = searchParams.error;

  return Array.isArray(error) ? error[0] : error;
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main className="shell">
      <LoginForm error={getLoginError(searchParams)} />
    </main>
  );
}
