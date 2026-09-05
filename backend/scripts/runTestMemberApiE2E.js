const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5000/api";
const EMAIL = "test.member@vedaconnect.dev";
const PASSWORD = "TestPass123!";

const results = [];

const request = async (method, path, { token, body } = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  return { status: response.status, ok: response.ok, json };
};

const record = (name, result, note) => {
  results.push({
    name,
    status: result.status,
    pass: result.ok,
    note: note || result.json?.message || "",
  });
};

const dataLength = (value) => (Array.isArray(value) ? value.length : 0);

const main = async () => {
  const login = await request("POST", "/auth/login", {
    body: { email: EMAIL, password: PASSWORD, hub: "Tirunelveli" },
  });
  const token = login.json?.data?.token;
  const userId = login.json?.data?.user?.id;
  record("POST /api/auth/login", login, token ? `JWT returned for ${userId}` : login.json?.message);

  if (!token || !userId) {
    console.log(JSON.stringify(results, null, 2));
    process.exitCode = 1;
    return;
  }

  const me = await request("GET", "/members/me", { token });
  record("GET /api/members/me", me, me.json?.data?.fullName === "Test Member" ? "profile summary returned" : me.json?.message);

  const full = await request("GET", "/members/me/full", { token });
  record(
    "GET /api/members/me/full",
    full,
    full.json?.data?.businessName === "Test Business Co" ? "full profile returned with business data" : full.json?.message
  );

  const statsBefore = await request("GET", "/members/me/stats", { token });
  record(
    "GET /api/members/me/stats",
    statsBefore,
    typeof statsBefore.json?.data?.eventsJoined === "number"
      ? `eventsJoined=${statsBefore.json.data.eventsJoined}`
      : statsBefore.json?.message
  );

  const memberUpcoming = await request("GET", "/members/me/upcoming-events", { token });
  record(
    "GET /api/members/me/upcoming-events",
    memberUpcoming,
    Array.isArray(memberUpcoming.json?.data)
      ? `${dataLength(memberUpcoming.json.data)} member upcoming event(s)`
      : memberUpcoming.json?.message
  );

  const members = await request("GET", "/members", { token });
  record(
    "GET /api/members",
    members,
    members.json?.data?.some((member) => member.userId === userId)
      ? "test member appears in directory"
      : members.json?.message || "test member not found"
  );

  const memberDetail = await request("GET", `/members/${userId}`, { token });
  record(
    "GET /api/members/:userId",
    memberDetail,
    memberDetail.json?.data?.businessName === "Test Business Co" ? "member detail returned" : memberDetail.json?.message
  );

  const upcoming = await request("GET", "/events/upcoming", { token });
  const upcomingEvents = upcoming.json?.data || [];
  record(
    "GET /api/events/upcoming",
    upcoming,
    Array.isArray(upcomingEvents) ? `${upcomingEvents.length} upcoming event(s)` : upcoming.json?.message
  );

  const past = await request("GET", "/events/past", { token });
  record(
    "GET /api/events/past",
    past,
    Array.isArray(past.json?.data) ? `${past.json.data.length} past event(s)` : past.json?.message
  );

  const mineBefore = await request("GET", "/events/mine", { token });
  record(
    "GET /api/events/mine",
    mineBefore,
    Array.isArray(mineBefore.json?.data) ? `${mineBefore.json.data.length} registered event(s) before registration` : mineBefore.json?.message
  );

  const eventId = upcomingEvents[0]?.id;
  if (!eventId) {
    record("GET /api/events/:eventId", { status: 0, ok: false, json: null }, "skipped: no upcoming event id available");
    record("POST /api/events/:eventId/register", { status: 0, ok: false, json: null }, "skipped: no upcoming event id available");
  } else {
    const eventDetail = await request("GET", `/events/${eventId}`, { token });
    record(
      "GET /api/events/:eventId",
      eventDetail,
      eventDetail.json?.data?.id === eventId ? "event detail returned" : eventDetail.json?.message
    );

    const register = await request("POST", `/events/${eventId}/register`, { token });
    record(
      "POST /api/events/:eventId/register",
      register,
      register.status === 201 ? `registered event ${eventId}` : register.json?.message
    );
  }

  const mineAfter = await request("GET", "/events/mine", { token });
  record(
    "GET /api/events/mine again",
    mineAfter,
    Array.isArray(mineAfter.json?.data) ? `${mineAfter.json.data.length} registered event(s) after registration` : mineAfter.json?.message
  );

  const statsAfter = await request("GET", "/members/me/stats", { token });
  record(
    "GET /api/members/me/stats again",
    statsAfter,
    typeof statsAfter.json?.data?.eventsJoined === "number"
      ? `eventsJoined=${statsAfter.json.data.eventsJoined}`
      : statsAfter.json?.message
  );

  console.log(JSON.stringify({ userId, tokenReceived: Boolean(token), results }, null, 2));
  if (results.some((result) => !result.pass)) process.exitCode = 1;
};

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
