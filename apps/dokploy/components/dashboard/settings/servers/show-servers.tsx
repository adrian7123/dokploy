import { api } from "@/utils/api";
import { format } from "date-fns";
import { AddServer } from "./add-server";
import { KeyIcon, MoreHorizontal, ServerIcon } from "lucide-react";
import Link from "next/link";
import { DialogAction } from "@/components/shared/dialog-action";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { SetupServer } from "./setup-server";
import { TerminalModal } from "../web-server/terminal-modal";
export const ShowServers = () => {
	const { data, refetch } = api.server.all.useQuery();
	const { mutateAsync } = api.server.remove.useMutation();
	const { data: sshKeys } = api.sshKey.all.useQuery();

	return (
		<div className="p-6 space-y-6">
			<div className="space-y-2 flex flex-row justify-between items-end">
				<div>
					<h1 className="text-2xl font-bold">Servers</h1>
					<p className="text-muted-foreground">
						Add servers to deploy your applications remotely.
					</p>
				</div>

				{sshKeys && sshKeys?.length > 0 && (
					<div>
						<AddServer />
					</div>
				)}
			</div>

			<div className="grid gap-4 sm:grid-cols-1 md:grid-cols-1">
				{sshKeys?.length === 0 ? (
					<div className="flex flex-col items-center gap-3 min-h-[25vh] justify-center">
						<KeyIcon className="size-8" />
						<span className="text-base text-muted-foreground">
							No SSH Keys found. Add a SSH Key to start adding servers.{" "}
							<Link
								href="/dashboard/settings/ssh-keys"
								className="text-primary"
							>
								Add SSH Key
							</Link>
						</span>
					</div>
				) : (
					data &&
					data.length === 0 && (
						<div className="flex flex-col items-center gap-3 min-h-[25vh] justify-center">
							<ServerIcon className="size-8" />
							<span className="text-base text-muted-foreground">
								No Servers found. Add a server to deploy your applications
								remotely.
							</span>
						</div>
					)
				)}
				{data && data?.length > 0 && (
					<div className="flex flex-col gap-6">
						<Table>
							<TableCaption>See all servers</TableCaption>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[100px]">Name</TableHead>
									<TableHead className="text-center">IP Address</TableHead>
									<TableHead className="text-center">Port</TableHead>
									<TableHead className="text-center">Username</TableHead>
									<TableHead className="text-center">Created</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{data?.map((server) => {
									return (
										<TableRow key={server.serverId}>
											<TableCell className="w-[100px]">{server.name}</TableCell>
											<TableCell className="text-center">
												<Badge>{server.ipAddress}</Badge>
											</TableCell>
											<TableCell className="text-center">
												{server.port}
											</TableCell>
											<TableCell className="text-center">
												{server.username}
											</TableCell>
											<TableCell className="text-right">
												<span className="text-sm text-muted-foreground">
													{format(new Date(server.createdAt), "PPpp")}
												</span>
											</TableCell>

											<TableCell className="text-right flex justify-end">
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" className="h-8 w-8 p-0">
															<span className="sr-only">Open menu</span>
															<MoreHorizontal className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<TerminalModal serverId={server.serverId}>
															<span>Enter the terminal</span>
														</TerminalModal>
														<SetupServer serverId={server.serverId} />

														<DialogAction
															title={"Delete Server"}
															description="This will delete the server and all associated data"
															onClick={async () => {
																await mutateAsync({
																	serverId: server.serverId,
																})
																	.then(() => {
																		refetch();
																		toast.success(
																			`Server ${server.name} deleted succesfully`,
																		);
																	})
																	.catch((err) => {
																		toast.error(err.message);
																	});
															}}
														>
															<DropdownMenuItem
																className="w-full cursor-pointer text-red-500 hover:!text-red-600"
																onSelect={(e) => e.preventDefault()}
															>
																Delete Server
															</DropdownMenuItem>
														</DialogAction>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				)}
			</div>
		</div>
	);
};