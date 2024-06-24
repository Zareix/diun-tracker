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
	const hostnames = [...new Set(updates.map((update) => update.hostname))];

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
			{hostnames.map((hostname) => (
				<div key={hostname}>
					<header>
						<h2>{hostname}</h2>
						<form action={`/dashboard?hostname=${hostname}`} method="POST">
							<button type="submit">Set all as done</button>
						</form>
					</header>
					<table>
						<thead>
							<tr>
								<th>Status</th>
								<th>Image</th>
								<th>Container Name</th>
								<th>Created at</th>
								<th>Done at</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{updates
								.filter((u) => u.hostname === hostname)
								.map((update) => (
									<tr key={update.id}>
										<td>{update.status}</td>
										<td>{update.image}</td>
										<td>{update.metadata.ctnNames}</td>
										<td>
											{update.created &&
												new Date(update.created).toLocaleDateString("fr-FR")}
										</td>
										<td>
											{update.doneAt &&
												new Date(update.doneAt).toLocaleDateString("fr-FR")}
										</td>
										<td>
											{update.status === "pending" && (
												<form
													action={`/dashboard?id=${update.id}`}
													method="POST"
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
			))}
		</Layout>
	);
};

export default DashboardPage;
