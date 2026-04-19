const formatTimestamp = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

export default function VideoCallRoom({
  appointmentId,
  currentUserLabel,
  error,
  isAudioEnabled,
  isJoining,
  isJoined,
  isVideoEnabled,
  localVideoRef,
  onJoin,
  onLeave,
  onToggleAudio,
  onToggleVideo,
  remoteUsers,
  sessionInfo,
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
          Telemedicine
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Video consultation room
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Join the secure call for appointment {appointmentId}. Use the same
          link from patient or doctor appointments.
        </p>

        <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Session state</span>
            <span className="font-semibold text-slate-900">
              {sessionInfo?.state || "Not started"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Room</span>
            <span className="font-semibold text-slate-900 break-all">
              {sessionInfo?.roomName || "Pending"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Completion</span>
            <span className="font-semibold text-slate-900">
              {sessionInfo?.completionStatus || "Waiting"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-slate-500">Created</span>
            <span className="font-semibold text-slate-900">
              {formatTimestamp(sessionInfo?.createdAt)}
            </span>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Controls
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {!isJoined ? (
              <button
                className="rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={isJoining}
                onClick={onJoin}
                type="button"
              >
                {isJoining ? "Joining call..." : "Join call"}
              </button>
            ) : (
              <>
                <button
                  className={`rounded-full px-5 py-3 text-sm font-semibold text-white transition ${isVideoEnabled ? "bg-slate-900 hover:bg-slate-800" : "bg-amber-600 hover:bg-amber-700"}`}
                  onClick={onToggleVideo}
                  type="button"
                >
                  {isVideoEnabled ? "Turn camera off" : "Turn camera on"}
                </button>
                <button
                  className={`rounded-full px-5 py-3 text-sm font-semibold text-white transition ${isAudioEnabled ? "bg-slate-900 hover:bg-slate-800" : "bg-amber-600 hover:bg-amber-700"}`}
                  onClick={onToggleAudio}
                  type="button"
                >
                  {isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
                </button>
                <button
                  className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
                  onClick={onLeave}
                  type="button"
                >
                  Leave call
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Current user</p>
          <p className="mt-1 break-all">{currentUserLabel || "Guest"}</p>
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        </div>
      </aside>

      <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-4 shadow-sm lg:p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Your camera
            </div>
            <div className="relative aspect-[4/3] bg-slate-950">
              <div ref={localVideoRef} className="absolute inset-0" />
              {!isJoined ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.2),rgba(15,23,42,0.96))] text-sm text-slate-400">
                  Join the call to start your camera
                </div>
              ) : null}
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.5rem] border border-slate-800 bg-slate-900">
            <div className="border-b border-slate-800 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Remote participants
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              {remoteUsers.length > 0 ? (
                remoteUsers.map((user) => (
                  <div
                    key={user.uid}
                    className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"
                  >
                    <div className="border-b border-slate-800 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-400">
                      Participant {String(user.uid)}
                    </div>
                    <div
                      ref={(node) => {
                        if (node && user.videoTrack) {
                          user.videoTrack.play(node);
                        }
                      }}
                      className="relative flex aspect-[4/3] items-center justify-center bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),rgba(15,23,42,0.96))] text-sm text-slate-400"
                    >
                      {!user.videoTrack ? "Waiting for video stream..." : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950 text-sm text-slate-400">
                  Waiting for the other participant to join
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
