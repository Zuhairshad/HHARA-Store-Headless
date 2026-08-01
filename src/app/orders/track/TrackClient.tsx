"use client";

import { useActionState, useEffect, useRef } from "react";
import Image from "next/image";
import { lookupOrder, type LookupResult, type CarrierInfo } from "@/lib/order-tracking-actions";
import type { OrderTracking } from "@/lib/shopify";
import type { LiveStatus, LiveStatusState } from "@/lib/carriers";

const initialState: LookupResult | null = null;

async function action(
  _prev: LookupResult | null,
  formData: FormData
): Promise<LookupResult | null> {
  return await lookupOrder(formData);
}

type Props = {
  initialOrderName?: string;
  initialEmail?: string;
};

export default function TrackClient({ initialOrderName = "", initialEmail = "" }: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement | null>(null);
  const autoSubmitted = useRef(false);

  useEffect(() => {
    if (autoSubmitted.current) return;
    if (initialOrderName && initialEmail && formRef.current) {
      autoSubmitted.current = true;
      formRef.current.requestSubmit();
    }
  }, [initialOrderName, initialEmail]);

  const order = state?.ok ? state.order : null;
  const carrier = state?.ok ? state.carrier : null;

  return (
    <main className="ot-root">
      <header className="ot-hero">
        <p className="eyebrow">Order Status</p>
        <h1 className="display ot-title">Track your order</h1>
        <p className="ot-sub">
          Enter your order number and the email you used at checkout. You'll find both in your
          order confirmation email from HHARA.
        </p>
      </header>

      <section className="ot-card">
        <form ref={formRef} action={formAction} className="ot-form" noValidate>
          <div className="ot-field">
            <label htmlFor="orderName">Order number</label>
            <input
              id="orderName"
              name="orderName"
              type="text"
              placeholder="#1001"
              autoComplete="off"
              required
              disabled={pending}
              defaultValue={initialOrderName}
              aria-describedby="order-hint"
            />
            <p id="order-hint" className="ot-hint">
              Look for it at the top of your HHARA order confirmation - it starts with a #.
            </p>
          </div>
          <div className="ot-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={pending}
              defaultValue={initialEmail}
              aria-describedby="email-hint"
            />
            <p id="email-hint" className="ot-hint">
              We use this to verify the order is yours - it must match the email you checked out with.
            </p>
          </div>
          <div className="ot-submit-row">
            <button type="submit" className="ot-submit" disabled={pending}>
              {pending ? "Looking up…" : "Track order"}
            </button>
          </div>
        </form>

        {state && state.ok === false && (
          <p className="ot-error" role="alert">
            {state.error}
          </p>
        )}
      </section>

      {order && <OrderView order={order} carrier={carrier} />}
    </main>
  );
}

function OrderView({ order, carrier }: { order: OrderTracking; carrier: CarrierInfo | null }) {
  const fulfillment = order.fulfillments[0] ?? null;
  const currency = order.totalPrice.currencyCode;
  const live = carrier?.live ?? null;

  return (
    <section className="ot-result">
      <div className="ot-result-head">
        <div>
          <p className="eyebrow">Order</p>
          <h2 className="display ot-order-name">{order.name}</h2>
          {order.processedAt && (
            <p className="ot-meta">
              Placed {new Date(order.processedAt).toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
        <div className="ot-total">
          <p className="label-sm">Total</p>
          <p className="ot-total-value">
            {currency} {Number(order.totalPrice.amount).toFixed(2)}
          </p>
        </div>
      </div>

      <StatusTimeline
        financial={order.displayFinancialStatus}
        fulfillment={order.displayFulfillmentStatus}
        fulfilledAt={fulfillment?.updatedAt ?? fulfillment?.createdAt ?? null}
        estimatedDelivery={live?.estimatedDelivery ?? fulfillment?.estimatedDeliveryAt ?? null}
        liveState={live?.state ?? null}
      />

      {carrier && (carrier.trackingNumber || carrier.trackingUrl) && (
        <div className="ot-tracking">
          <p className="label-sm">Tracking</p>
          <div className="ot-tracking-row">
            <div>
              {carrier.displayName && <p className="ot-carrier">{carrier.displayName}</p>}
              {carrier.trackingNumber && <p className="ot-tracknum">{carrier.trackingNumber}</p>}
            </div>
            {carrier.trackingUrl && (
              <a href={carrier.trackingUrl} target="_blank" rel="noreferrer" className="ot-track-link">
                Track with carrier →
              </a>
            )}
          </div>

          {live && <LiveStatusPanel live={live} />}
        </div>
      )}

      {order.shippingAddress && (
        <div className="ot-address">
          <p className="label-sm">Shipping to</p>
          <address>
            {order.shippingAddress.name && <div>{order.shippingAddress.name}</div>}
            {order.shippingAddress.address1 && <div>{order.shippingAddress.address1}</div>}
            {order.shippingAddress.address2 && <div>{order.shippingAddress.address2}</div>}
            <div>
              {[order.shippingAddress.city, order.shippingAddress.province, order.shippingAddress.zip]
                .filter(Boolean)
                .join(", ")}
            </div>
            {order.shippingAddress.country && <div>{order.shippingAddress.country}</div>}
          </address>
        </div>
      )}

      <div className="ot-items">
        <p className="label-sm">Items</p>
        <ul>
          {order.lineItems.map((li, i) => (
            <li key={i} className="ot-item">
              {li.image ? (
                <div className="ot-item-img">
                  <Image
                    src={li.image.url}
                    alt={li.image.altText ?? li.title}
                    width={72}
                    height={90}
                  />
                </div>
              ) : (
                <div className="ot-item-img ot-item-img-empty" />
              )}
              <div className="ot-item-info">
                <p className="ot-item-title">{li.title}</p>
                <p className="ot-item-qty">Qty {li.quantity}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function LiveStatusPanel({ live }: { live: LiveStatus }) {
  return (
    <div className="ot-live">
      <div className="ot-live-head">
        <span className="ot-live-badge">Live</span>
        <span className="ot-live-desc">{live.description}</span>
        {live.updatedAt && (
          <span className="ot-live-updated">
            Updated {new Date(live.updatedAt).toLocaleString(undefined, {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
      {live.events.length > 0 && (
        <ul className="ot-events">
          {live.events.map((e, i) => (
            <li key={i} className="ot-event">
              <span className="ot-event-time">
                {e.at
                  ? new Date(e.at).toLocaleString(undefined, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </span>
              <span className="ot-event-desc">
                {e.description}
                {e.location && <span className="ot-event-loc"> · {e.location}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusTimeline({
  financial,
  fulfillment,
  fulfilledAt,
  estimatedDelivery,
  liveState,
}: {
  financial: string | null;
  fulfillment: string | null;
  fulfilledAt: string | null;
  estimatedDelivery: string | null;
  liveState: LiveStatusState | null;
}) {
  const paid = financial === "PAID" || financial === "PARTIALLY_PAID";
  const fulfilled = fulfillment === "FULFILLED" || fulfillment === "PARTIALLY_FULFILLED";

  // Prefer live carrier state when we have it
  const shipped =
    fulfilled ||
    ["picked_up", "in_transit", "out_for_delivery", "delivered"].includes(liveState ?? "");
  const outForDelivery =
    liveState === "out_for_delivery" || liveState === "delivered";
  const delivered = liveState === "delivered";

  const steps: { label: string; done: boolean; sub?: string }[] = [
    { label: "Order confirmed", done: true },
    { label: "Payment received", done: paid },
    {
      label: "Shipped",
      done: shipped,
      sub: fulfilledAt
        ? new Date(fulfilledAt).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
          })
        : undefined,
    },
    {
      label: "Out for delivery",
      done: outForDelivery,
      sub: estimatedDelivery
        ? `Est. ${new Date(estimatedDelivery).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
          })}`
        : undefined,
    },
    { label: "Delivered", done: delivered },
  ];

  return (
    <ol className="ot-timeline">
      {steps.map((s, i) => (
        <li key={i} className={`ot-step ${s.done ? "is-done" : ""}`}>
          <span className="ot-step-dot" aria-hidden="true" />
          <div className="ot-step-text">
            <span className="ot-step-label">{s.label}</span>
            {s.sub && <span className="ot-step-sub">{s.sub}</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}
