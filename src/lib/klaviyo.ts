// Server-only Klaviyo helpers. Kept out of the "use server" action files so they can't be
// called directly from the browser, only through the bot-checked form actions.

const KLAVIYO_REVISION = "2025-01-15";

function klaviyoHeaders(apiKey: string) {
  return {
    Authorization: `Klaviyo-API-Key ${apiKey}`,
    revision: KLAVIYO_REVISION,
    accept: "application/vnd.api+json",
    "content-type": "application/vnd.api+json",
  };
}

// Subscribe an email to a Klaviyo list with email marketing consent.
// Returns false (never throws) when not configured or on failure.
export async function subscribeKlaviyo(email: string, source?: string): Promise<boolean> {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  const listId = process.env.KLAVIYO_LIST_ID;
  if (!apiKey || !listId) return false;

  try {
    const res = await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs", {
      method: "POST",
      headers: klaviyoHeaders(apiKey),
      body: JSON.stringify({
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: {
            custom_source: source || "Website Newsletter",
            profiles: {
              data: [
                {
                  type: "profile",
                  attributes: {
                    email: email.trim().toLowerCase(),
                    subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
                  },
                },
              ],
            },
          },
          relationships: { list: { data: { type: "list", id: listId } } },
        },
      }),
    });
    if (!res.ok) {
      console.error("Klaviyo subscribe failed", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("Klaviyo subscribe error", err);
    return false;
  }
}

// Adds name, phone and birthday to a Klaviyo profile (the subscribe job only takes the email).
// Best effort: never throws. The phone is stored on the profile only; this doesn't opt in to SMS.
export async function updateKlaviyoProfile(
  email: string,
  details: { name?: string; phone?: string; dob?: string }
): Promise<void> {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  if (!apiKey) return;
  const [firstName, ...rest] = (details.name || "").trim().split(/\s+/).filter(Boolean);
  const attributes: Record<string, unknown> = { email: email.trim().toLowerCase() };
  if (firstName) attributes.first_name = firstName;
  if (rest.length) attributes.last_name = rest.join(" ");
  if (details.dob) attributes.properties = { Birthday: details.dob };

  const importProfile = (attrs: Record<string, unknown>) =>
    fetch("https://a.klaviyo.com/api/profile-import", {
      method: "POST",
      headers: klaviyoHeaders(apiKey),
      body: JSON.stringify({ data: { type: "profile", attributes: attrs } }),
    });

  try {
    let res = await importProfile(details.phone ? { ...attributes, phone_number: details.phone } : attributes);
    // An invalid phone number fails the whole import; keep the other details in that case
    if (!res.ok && details.phone) res = await importProfile(attributes);
    if (!res.ok) console.error("Klaviyo profile update failed", res.status, await res.text());
  } catch (err) {
    console.error("Klaviyo profile update error", err);
  }
}

// Records a custom event (e.g. "Submitted Review") on a profile, which can trigger a Klaviyo flow.
// Returns false (never throws) when not configured or on failure.
export async function trackKlaviyoEvent(
  metric: string,
  email: string,
  properties: Record<string, unknown>
): Promise<boolean> {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  if (!apiKey) return false;

  try {
    const res = await fetch("https://a.klaviyo.com/api/events", {
      method: "POST",
      headers: klaviyoHeaders(apiKey),
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            properties,
            metric: { data: { type: "metric", attributes: { name: metric } } },
            profile: { data: { type: "profile", attributes: { email: email.trim().toLowerCase() } } },
          },
        },
      }),
    });
    if (!res.ok) {
      console.error("Klaviyo event failed", metric, res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("Klaviyo event error", metric, err);
    return false;
  }
}
