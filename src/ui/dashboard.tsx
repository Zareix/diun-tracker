import { html } from "hono/html";
import type { MetadataRow, UpdatesRow } from "~/db/schema";
import { env } from "~/env";
import type { PullRequest } from "~/types";
import { Layout } from "~/ui/layout";

type Props = {
	showAll: boolean;
	updates: Array<
		UpdatesRow & {
			metadata: MetadataRow;
		}
	>;
	pullRequests: PullRequest[];
};

const PullRequestsTab = ({ pullRequests }: { pullRequests: PullRequest[] }) => {
	if (pullRequests.length === 0) {
		return <></>;
	}
	return html`
		<h2>Pull Requests</h2>
		<table>
			<thead>
				<tr>
					<th>Title</th>
					<th>User</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				${pullRequests.map(
					(pr) => html`<tr key=${pr.id}>
					<td>
						<a href=${`https://github.com/${env.GH_REPO}/pull/${pr.number}`}>
							${pr.title}
						</a>
					</td>
					<td>${pr.username}</td>
					<td class="actions">
						<div>
							<form action=${`/dashboard?pr=${pr.number}`} method="post">
								<button type="submit">Merge</button>
							</form>
						</div>
					</td>
				</tr>`,
				)}
			</tbody>
		</table>
	`;
};

const DashboardPage = ({ updates, showAll, pullRequests }: Props) => {
	const hostnames = [
		...new Set(updates.map((update) => update.hostname)),
	].sort();

	return (
		<Layout title="Dashboard">
			<header>
				<h1>Dashboard</h1>
				<div>
					<a href={`/dashboard?showAll=${!showAll}`}>
						<button type="button">Show All</button>
					</a>
					<a href="/dashboard">
						<button type="button">Refresh</button>
					</a>
				</div>
			</header>
			<PullRequestsTab pullRequests={pullRequests} />
			<h2>Diun updates</h2>
			{hostnames.length === 0 ? (
				<p>No updates</p>
			) : (
				hostnames.map((hostname) => (
					<div key={hostname}>
						<header>
							<h3>{hostname}</h3>
							<div>
								<form action={`/dashboard?hostname=${hostname}`} method="post">
									<button type="submit">✅ Set all as done</button>
								</form>
								<button id={`${hostname}-copy`} type="button">
									📋 Copy update command
								</button>
								{html`
									<script>
										document.getElementById('${hostname}-copy').addEventListener("click", () => {
												navigator.clipboard.writeText('docker-updater update --host ${hostname} ${updates
													.filter((u) => u.hostname === hostname)
													.map((u) => u.metadata.ctnNames)
													.join(" ")}');
											});
									</script>
								`}
							</div>
						</header>
						<table>
							<thead>
								<tr>
									<th>Status</th>
									<th>Image</th>
									<th>Container Name</th>
									<th>Created at</th>
									{showAll && <th>Done at</th>}
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{updates
									.filter((u) => u.hostname === hostname)
									.sort((a, b) => {
										if (!a.created) return 1;
										if (!b.created) return -1;
										return (
											new Date(b.created).getTime() -
											new Date(a.created).getTime()
										);
									})
									.map((update) => (
										<tr key={update.id}>
											<td>{update.status}</td>
											<td>
												{update.hubLink ? (
													<a href={update.hubLink}>{update.image}</a>
												) : (
													update.image
												)}
											</td>
											<td>{update.metadata.ctnNames}</td>
											<td>
												{update.created &&
													new Date(update.created).toLocaleDateString("fr-FR")}
											</td>
											{showAll && (
												<td>
													{update.doneAt &&
														new Date(update.doneAt).toLocaleDateString("fr-FR")}
												</td>
											)}
											<td className="actions">
												<div>
													{update.status === "pending" && (
														<form
															action={`/dashboard?id=${update.id}`}
															method="post"
														>
															<button type="submit">Set as done</button>
														</form>
													)}
												</div>
											</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>
				))
			)}
		</Layout>
	);
};

export default DashboardPage;
