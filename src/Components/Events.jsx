import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://api.univibe.uz/api/v1/clubs/events";

/** Redux → localStorage → sessionStorage dan token olish */
function useAuthToken() {
  const reduxToken = useSelector((s) => s?.auth?.token);
  const ls = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const ss = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
  return reduxToken || ls || ss || "";
}

/** Tokenni to'g'ri Authorization header ko‘rinishiga keltirish
 *  - Agar foydalanuvchi allaqachon "Bearer ..." saqlagan bo'lsa — o'shani yuboramiz
 *  - Aks holda "Bearer <token>" qilib yuboramiz
 */
function buildAuthHeader(rawToken) {
  if (!rawToken) return {};
  const token = String(rawToken).trim();
  const hasScheme = /^\w+\s+\S+$/i.test(token); // "Something <value>"
  return hasScheme ? { Authorization: token } : { Authorization: `Bearer ${token}` };
}

const Events = () => {
  const token = useAuthToken();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingIds, setApprovingIds] = useState(new Set());
  const [error, setError] = useState("");

  const authHeaders = useMemo(() => buildAuthHeader(token), [token]);

  const handleAuthErrors = useCallback(
    async (res) => {
      let body = "";
      try {
        body = await res.text();
      } catch {}
      if (res.status === 401 || res.status === 403) {
        const msg =
          body && body.trim().length
            ? `Auth error ${res.status}: ${body}`
            : `Auth error ${res.status}. Please log in again.`;
        setError(msg);
        setTimeout(() => navigate("/login", { replace: true }), 800);
        return true;
      }
      return false;
    },
    [navigate]
  );

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/pending-review/`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...authHeaders,
        },
        // Cookie ishlatmasangiz, quyidagini olib tashlashingiz mumkin:
        // credentials: "include",
      });

      if (!res.ok) {
        if (await handleAuthErrors(res)) return;
        const txt = await res.text();
        throw new Error(`Failed to load: ${res.status} ${txt}`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.results || [];
      setEvents(list);
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [authHeaders, handleAuthErrors]);

  useEffect(() => {
    if (!token) {
      setError("Token topilmadi. Iltimos, tizimga kiring.");
      navigate("/login", { replace: true });
      return;
    }
    fetchPending();
  }, [token, fetchPending, navigate]);

  const approveEvent = useCallback(
    async (id) => {
      if (!id) return;
      setApprovingIds((prev) => new Set(prev).add(id));
      const snapshot = events;
      setEvents((cur) => cur.filter((e) => String(e.id) !== String(id)));

      const callApprove = async (method) => {
        const res = await fetch(`${API_BASE}/approve/${id}/`, {
          method,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...authHeaders,
          },
          // credentials: "include",
          body: method === "POST" ? JSON.stringify({}) : undefined,
        });
        if (!res.ok) {
          if (await handleAuthErrors(res)) throw new Error("Auth error");
          const txt = await res.text();
          throw new Error(`${method} failed: ${res.status} ${txt}`);
        }
        try {
          return await res.json();
        } catch {
          return null;
        }
      };

      try {
        // Avval POST, keyin PATCH fallback
        try {
          await callApprove("POST");
        } catch {
          await callApprove("PATCH");
        }
      } catch (e) {
        setEvents(snapshot); // rollback
        setError(e.message || "Approve failed");
      } finally {
        setApprovingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [events, authHeaders, handleAuthErrors]
  );

  const hasData = useMemo(() => events?.length > 0, [events]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Pending Events</h1>
        <button
          onClick={fetchPending}
          className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90 active:scale-95 transition"
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-red-700 break-words">
          {error}
        </div>
      ) : null}

      {loading ? (
        <SkeletonGrid />
      ) : hasData ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              onApprove={approveEvent}
              approving={approvingIds.has(ev.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

const EventCard = ({ event, onApprove, approving }) => {
  const {
    id,
    title,
    name,
    club_name,
    description,
    date,
    starts_at,
    start_time,
    cover_image,
    image,
    thumbnail,
    location,
    venue,
  } = event || {};

  const displayTitle = title || name || `Event #${id}`;
  const displayImg = cover_image || image || thumbnail || null;
  const displayDate = date || starts_at || start_time || "";
  const displayVenue = venue || location || club_name || "";

  return (
    <div className="rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition bg-white">
      {displayImg ? (
        <img
          src={displayImg}
          alt={displayTitle}
          className="w-full h-40 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-40 bg-zinc-100 flex items-center justify-center text-zinc-400">
          No image
        </div>
      )}

      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-lg line-clamp-1">{displayTitle}</h3>
        {displayVenue ? (
          <p className="text-sm text-zinc-600 line-clamp-1">{displayVenue}</p>
        ) : null}
        {displayDate ? (
          <p className="text-sm text-zinc-600">{formatMaybeDate(displayDate)}</p>
        ) : null}
        {description ? (
          <p className="text-sm text-zinc-700 line-clamp-3">{description}</p>
        ) : null}

        <div className="pt-3 flex items-center gap-2">
          <button
            onClick={() => onApprove(id)}
            disabled={approving}
            className="w-full px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            title="Approve this event"
          >
            {approving ? "Approving..." : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
};

const SkeletonGrid = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="rounded-2xl border border-zinc-200 overflow-hidden animate-pulse bg-white"
      >
        <div className="w-full h-40 bg-zinc-200" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-zinc-200 rounded w-3/5" />
          <div className="h-3 bg-zinc-200 rounded w-2/5" />
          <div className="h-3 bg-zinc-200 rounded w-full" />
          <div className="h-9 bg-zinc-200 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="rounded-2xl border border-zinc-200 p-8 text-center text-zinc-600 bg-white">
    Hozircha pending eventlar yo‘q.
  </div>
);

function formatMaybeDate(value) {
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  } catch {
    return String(value);
  }
}

export default Events;
