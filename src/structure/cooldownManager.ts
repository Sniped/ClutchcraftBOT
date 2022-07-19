const timeElapsed = (timestamp: Date | number): number =>
	Date.now() - new Date(timestamp).getTime();

export class CooldownManager {
	private store: Map<string, number>;

	constructor(private cooldown: number) {
		this.store = new Map();
	}

	add(key: string) {
		this.store.set(key, Date.now());
	}

	isOnCooldown(key: string) {
		if (!this.store.has(key)) return false;
		if (timeElapsed(this.store.get(key)!) > this.cooldown) {
			this.store.delete(key);
			return false;
		} else return true;
	}
}
