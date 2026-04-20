import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/")({
  component: Home,
});

function Home() {
  const { auth } = Route.useRouteContext();

  if (!auth.user) return null;

  return (
    <main className="page-wrap px-4 py-16 sm:py-24">
      <section className="island-shell rise-in rounded-2xl p-8">
        <p className="island-kicker mb-3">Welcome</p>
        <h1 className="display-title text-3xl font-bold">메인 페이지</h1>
        <p className="mt-4 text-sm text-slate-600">
          로그인된 사용자: <strong>{auth.user.name}</strong> ({auth.user.email})
        </p>
        <button
          type="button"
          onClick={() => void auth.logout()}
          className="mt-6 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          로그아웃
        </button>
      </section>
    </main>
  );
}
