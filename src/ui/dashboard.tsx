import { html } from "hono/html";
import type { MetadataRow, UpdatesRow } from "~/db/schema";
import { Layout } from "~/ui/layout";

type Props = {
	showAll: boolean;
	updates: Array<
		UpdatesRow & {
			metadata: MetadataRow;
		}
	>;
};

const DashboardPage = ({ updates, showAll }: Props) => {
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
			{hostnames.length === 0 ? (
				<p>No updates</p>
			) : (
				hostnames.map((hostname) => (
					<div key={hostname}>
						<header>
							<h2>{hostname}</h2>
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
												{update.status === "pending" && (
													<form
														action={`/dashboard?id=${update.id}`}
														method="post"
													>
														<button type="submit">Set as done</button>
													</form>
												)}
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
