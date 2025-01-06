export type DiunWebhookBody = {
	diun_version: string;
	hostname: string;
	status: "new";
	provider: string;
	image: string;
	hub_link: string;
	mime_type: string;
	digest: string;
	created: Date;
	platform: string;
	metadata: Metadata;
};

export type Metadata = {
	ctn_command: string;
	ctn_createdat: string;
	ctn_id: string;
	ctn_names: string;
	ctn_size: string;
	ctn_state: string;
	ctn_status: string;
};

export type PullRequest = Pick<GHPullRequest, "id" | "number" | "title"> & {
	username: string;
};

// --- GITHUB ---
export type GHPullRequest = {
	url: string;
	id: number;
	node_id: string;
	html_url: string;
	diff_url: string;
	patch_url: string;
	issue_url: string;
	number: number;
	state: string;
	locked: boolean;
	title: string;
	user: User;
	body: string;
	created_at: Date;
	updated_at: Date;
	closed_at: null;
	merged_at: null;
	merge_commit_sha: string;
	assignee: null;
	milestone: null;
	draft: boolean;
	commits_url: string;
	review_comments_url: string;
	review_comment_url: string;
	comments_url: string;
	statuses_url: string;
	author_association: string;
	auto_merge: null;
	active_lock_reason: null;
};

type User = {
	login: string;
	id: number;
	node_id: string;
	avatar_url: string;
	gravatar_id: string;
	url: string;
	html_url: string;
	followers_url: string;
	following_url: string;
	gists_url: string;
	starred_url: string;
	subscriptions_url: string;
	organizations_url: string;
	repos_url: string;
	events_url: string;
	received_events_url: string;
	type: "Bot" | "User";
	user_view_type: string;
	site_admin: boolean;
};
