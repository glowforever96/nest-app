import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

type LoginSearch = {
	redirect?: string;
};

export const Route = createFileRoute("/login")({
	validateSearch: (search: Record<string, unknown>): LoginSearch => ({
		redirect: typeof search.redirect === "string" ? search.redirect : undefined,
	}),
	beforeLoad: ({ context, search }) => {
		if (!context.auth.isInitializing && context.auth.isAuthenticated) {
			throw redirect({ to: search.redirect ?? "/" });
		}
	},
	component: LoginPage,
});

function LoginPage() {
	const navigate = useNavigate();
	const { auth } = Route.useRouteContext();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErrorMessage(null);
		setIsSubmitting(true);

		try {
			await auth.login({ email, password });
			await navigate({ to: "/" });
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "로그인 중 오류가 발생했습니다.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className="page-wrap px-4 py-16 sm:py-24">
			<section className="island-shell rise-in mx-auto w-full max-w-md rounded-2xl p-8">
				<h1 className="display-title text-3xl font-bold">로그인</h1>
				<p className="mt-2 text-sm text-slate-600">이메일과 비밀번호를 입력해주세요.</p>

				<form className="mt-6 space-y-4" onSubmit={handleSubmit}>
					<div>
						<label className="mb-1 block text-sm font-medium" htmlFor="email">
							이메일
						</label>
						<input
							id="email"
							type="email"
							value={email}
							onChange={(event) => setEmail(event.target.value)}
							required
							className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400"
						/>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium" htmlFor="password">
							비밀번호
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							required
							className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400"
						/>
					</div>

					{errorMessage ? (
						<p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
							{errorMessage}
						</p>
					) : null}

					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-700 disabled:opacity-70"
					>
						{isSubmitting ? "로그인 중..." : "로그인"}
					</button>
				</form>

				<p className="mt-5 text-sm text-slate-600">
					아직 계정이 없나요?{" "}
					<Link to="/signup" className="font-semibold text-teal-700">
						회원가입
					</Link>
				</p>
			</section>
		</main>
	);
}
