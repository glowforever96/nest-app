import { useCallback, useEffect, useMemo, useState } from "react";
import {
	clearTokens,
	getStoredAccessToken,
	login,
	logout,
	me,
	saveTokens,
	signup,
	type AuthUser,
} from "../lib/auth";
import type { AuthContextValue } from "../router-context";

type AuthInput = {
	email: string;
	password: string;
};

type SignupInput = {
	name: string;
	email: string;
	password: string;
};

type AuthRouter = {
	invalidate: () => Promise<void>;
	navigate: (options: { to: string }) => Promise<unknown>;
};

export function useAuthContext(router: AuthRouter): AuthContextValue {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [isInitializing, setIsInitializing] = useState(true);

	useEffect(() => {
		const bootstrap = async () => {
			const accessToken = getStoredAccessToken();
			if (!accessToken) {
				setIsInitializing(false);
				return;
			}

			try {
				const profile = await me(accessToken);
				setUser(profile);
			} catch {
				clearTokens();
				setUser(null);
			} finally {
				setIsInitializing(false);
			}
		};

		void bootstrap();
	}, []);

	useEffect(() => {
		void router.invalidate();
	}, [router, isInitializing, user]);

	const loginAction = useCallback(async (input: AuthInput) => {
		const data = await login(input);
		saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
		setUser(data.user);
	}, []);

	const signupAction = useCallback(async (input: SignupInput) => {
		const data = await signup(input);
		saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
		setUser(data.user);
	}, []);

	const logoutAction = useCallback(async () => {
		const accessToken = getStoredAccessToken();
		if (accessToken) {
			try {
				await logout(accessToken);
			} catch {
				// 토큰 만료 등으로 실패해도 프론트 상태는 정리한다.
			}
		}

		clearTokens();
		setUser(null);
		await router.navigate({ to: "/login" });
	}, [router]);

	return useMemo(
		() => ({
			isAuthenticated: Boolean(user),
			isInitializing,
			user,
			login: loginAction,
			signup: signupAction,
			logout: logoutAction,
		}),
		[user, isInitializing, loginAction, signupAction, logoutAction],
	);
}
