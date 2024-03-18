import { MessageRepository } from "@server/databases/imessage";
import { Message } from "@server/databases/imessage/entity/Message";
import { PollingListener } from "./pollingListener";
import { WatcherListener } from "./watcherListener";
import { EventCache } from "@server/eventCache";

export class GroupChangeListener extends WatcherListener {
    repo: MessageRepository;

    frequencyMs: number;

    constructor(repo: MessageRepository) {
        super({
            filePaths: [repo.dbPathWal, repo.dbPath],
            cache: new EventCache()
        });

        this.repo = repo;
    }

    async getEntries(after: Date, before: Date | null): Promise<void> {
        const offsetDate = new Date(after.getTime() - 5000);
        const [entries, _] = await this.repo.getMessages({
            after: offsetDate,
            withChats: true,
            where: [
                {
                    statement: "message.text IS NULL",
                    args: null
                },
                {
                    statement: "message.item_type IN (1, 2, 3)",
                    args: null
                }
            ]
        });

        // Emit the new message
        entries.forEach((entry: any) => {
            // Skip over any that we've finished
            if (this.cache.find(entry.ROWID)) return;

            // Add to cache
            this.cache.add(entry.ROWID);

            // Send the built message object
            if (entry.itemType === 1 && entry.groupActionType === 0) {
                super.emit("participant-added", this.transformEntry(entry));
            } else if (entry.itemType === 1 && entry.groupActionType === 1) {
                super.emit("participant-removed", this.transformEntry(entry));
            } else if (entry.itemType === 2) {
                super.emit("name-change", this.transformEntry(entry));
            } else if (entry.itemType === 3 && entry.groupActionType === 0) {
                super.emit("participant-left", this.transformEntry(entry));
            } else if (entry.itemType === 3 && entry.groupActionType === 1) {
                super.emit("group-icon-changed", this.transformEntry(entry));
            } else if (entry.itemType === 3 && entry.groupActionType === 2) {
                super.emit("group-icon-removed", this.transformEntry(entry));
            } else {
                console.warn(`Unhandled message item type: [${entry.itemType}]`);
            }
        });
    }

    // eslint-disable-next-line class-methods-use-this
    transformEntry(entry: Message) {
        return entry;
    }
}
