import { createRouter, RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { useAuthContext } from "./hooks/use-auth-context";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	scrollRestoration: true,
	context: {
		auth: undefined!,
	},
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app");
if (!rootElement) {
	throw new Error('문서에 id="app" 인 루트 요소가 없습니다.');
}

function App() {
	const auth = useAuthContext(router);

	return <RouterProvider router={router} context={{ auth }} />;
}

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<App />);
}
