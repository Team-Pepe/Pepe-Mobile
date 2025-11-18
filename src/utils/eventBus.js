export const eventBus = {
  _map: new Map(),
  on(event, handler) {
    const arr = this._map.get(event) || [];
    arr.push(handler);
    this._map.set(event, arr);
    return () => this.off(event, handler);
  },
  off(event, handler) {
    const arr = this._map.get(event) || [];
    const next = arr.filter((h) => h !== handler);
    if (next.length) this._map.set(event, next);
    else this._map.delete(event);
  },
  emit(event, payload) {
    const arr = this._map.get(event) || [];
    for (const h of arr) {
      try { h(payload); } catch {}
    }
  },
};