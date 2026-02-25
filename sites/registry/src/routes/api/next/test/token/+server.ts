// TODO: Turn into a real route.
// import { json } from "@sveltejs/kit";
// import * as auth from "$lib/server/auth";

// export async function GET(event) {
// 	const clientUser = event.locals.user;
// 	if (!clientUser) {
// 		return json("Not logged in.", { status: 401 });
// 	}

// 	const token = auth.generateGradualToken();
// 	const gradualToken = await auth.createGradualToken(clientUser.username, token, []);

// 	return json({
// 		grad: gradualToken,
// 		token,
// 	}, { status: 200 });
// }
