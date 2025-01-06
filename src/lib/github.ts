import { env } from "~/env";
import type { GHPullRequest, PullRequest } from "~/types";

export const getPullRequests = async (): Promise<PullRequest[]> => {
	if (!env.GH_REPO || !env.GH_TOKEN) {
		return [];
	}
	const res = await fetch(
		`https://api.github.com/repos/${env.GH_REPO}/pulls?state=open`,
		{
			method: "GET",
			headers: {
				accept: "application/vnd.github+json",
				"x-github-api-version": "2022-11-28",
				authorization: `Bearer ${env.GH_TOKEN}`,
			},
		},
	);
	return ((await res.json()) as GHPullRequest[]).map((pr) => ({
		id: pr.id,
		number: pr.number,
		title: pr.title,
		username: pr.user.login,
	}));
};
export const mergePullRequest = async (prNumber: string) => {
	const res = await fetch(
		`https://api.github.com/repos/${env.GH_REPO}/pulls/${prNumber}/merge `,
		{
			method: "PUT",
			headers: {
				accept: "application/vnd.github+json",
				"x-github-api-version": "2022-11-28",
				authorization: `Bearer ${env.GH_TOKEN}`,
			},
		},
	);
};
