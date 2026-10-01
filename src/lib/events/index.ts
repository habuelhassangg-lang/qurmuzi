/**
 * Domain events (🪝 L3: order emails subscribe to `orderCreated`).
 * In the MVP nothing listens, so `emit` is effectively a no-op.
 */
export type DomainEvents = {
  orderCreated: {
    orderId: string;
    orderNumber: string;
    locale: string;
    buyerEmail: string;
  };
};

type Listener<E extends keyof DomainEvents> = (
  payload: DomainEvents[E],
) => void | Promise<void>;

const listeners = new Map<
  keyof DomainEvents,
  Array<Listener<keyof DomainEvents>>
>();

export function on<E extends keyof DomainEvents>(
  event: E,
  listener: Listener<E>,
) {
  const list = listeners.get(event) ?? [];
  list.push(listener as Listener<keyof DomainEvents>);
  listeners.set(event, list);
}

/** Runs listeners after the fact; a failing listener never breaks the caller. */
export async function emit<E extends keyof DomainEvents>(
  event: E,
  payload: DomainEvents[E],
) {
  const list = (listeners.get(event) ?? []) as Array<Listener<E>>;
  await Promise.allSettled(list.map((listener) => listener(payload)));
}
