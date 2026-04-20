import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/signup")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isInitializing && context.auth.isAuthenticated) {
			throw redirect({ to: "/" });
		}
	},
	component: SignupPage,
});

function SignupPage() {
	const navigate = useNavigate();
	const { auth } = Route.useRouteContext();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setErrorMessage(null);
		setIsSubmitting(true);

		try {
			await auth.signup({ name, email, password });
			await navigate({ to: "/" });
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "회원가입 중 오류가 발생했습니다.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<main className="page-wrap px-4 py-16 sm:py-24">
			<section className="island-shell rise-in mx-auto w-full max-w-md rounded-2xl p-8">
				<h1 className="display-title text-3xl font-bold">회원가입</h1>
				<p className="mt-2 text-sm text-slate-600">
					이름, 이메일, 비밀번호를 입력하고 계정을 만드세요.
				</p>

				<form className="mt-6 space-y-4" onSubmit={handleSubmit}>
					<div>
						<label className="mb-1 block text-sm font-medium" htmlFor="name">
							이름
						</label>
						<input
							id="name"
							type="text"
							value={name}
							onChange={(event) => setName(event.target.value)}
							required
							className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
						/>
					</div>

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
							className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
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
							className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
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
						{isSubmitting ? "가입 중..." : "회원가입"}
					</button>
				</form>

				<p className="mt-5 text-sm text-slate-600">
					이미 계정이 있나요?{" "}
					<Link to="/login" className="font-semibold text-teal-700">
						로그인
					</Link>
				</p>
			</section>
		</main>
	);
}
