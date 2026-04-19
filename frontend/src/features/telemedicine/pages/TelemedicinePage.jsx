import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import VideoCallRoom from "../components/VideoCallRoom";
import { telemedicineAPI } from "../services/telemedicineService";

function getCurrentUserLabel() {
  try {
    const doctorSession = JSON.parse(
      localStorage.getItem("doctorSession") || "null",
    );
    if (doctorSession?.username) {
      return `Doctor: ${doctorSession.username}`;
    }
  } catch {
    // Ignore parse errors and fall back to patient session.
  }

  try {
    const patientSession = JSON.parse(
      localStorage.getItem("patientSession") || "null",
    );
    if (patientSession?.username) {
      return `Patient: ${patientSession.username}`;
    }
  } catch {
    // Ignore parse errors and fall back to guest.
  }

  return "Guest";
}

function toArrayRemoteUsers(collection) {
  return Array.from(collection.values()).map((user) => ({
    uid: user.uid,
    audioTrack: user.audioTrack || null,
    videoTrack: user.videoTrack || null,
  }));
}

export default function TelemedicinePage() {
  const { appointmentId: appointmentIdParam } = useParams();
  const [appointmentId, setAppointmentId] = useState(appointmentIdParam || "");
  const [sessionInfo, setSessionInfo] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [error, setError] = useState("");
  const [joinError, setJoinError] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [lookupBusy, setLookupBusy] = useState(false);
  const localVideoRef = useRef(null);
  const clientRef = useRef(null);
  const localTracksRef = useRef({ audioTrack: null, videoTrack: null });
  const currentSessionRef = useRef(null);

  useEffect(() => {
    setAppointmentId(appointmentIdParam || "");
  }, [appointmentIdParam]);

  useEffect(() => {
    return () => {
      const client = clientRef.current;
      const { audioTrack, videoTrack } = localTracksRef.current;

      if (audioTrack) {
        audioTrack.stop();
        audioTrack.close();
      }
      if (videoTrack) {
        videoTrack.stop();
        videoTrack.close();
      }
      if (client) {
        client.removeAllListeners();
        client.leave().catch(() => {});
      }
    };
  }, []);

  const attachClientListeners = (client) => {
    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);

      setRemoteUsers((current) => {
        const nextMap = new Map(current.map((item) => [item.uid, item]));
        const existing = nextMap.get(user.uid) || {
          uid: user.uid,
          audioTrack: null,
          videoTrack: null,
        };

        nextMap.set(user.uid, {
          ...existing,
          uid: user.uid,
          audioTrack:
            mediaType === "audio" ? user.audioTrack : existing.audioTrack,
          videoTrack:
            mediaType === "video" ? user.videoTrack : existing.videoTrack,
        });

        return toArrayRemoteUsers(nextMap);
      });
    });

    client.on("user-unpublished", (user, mediaType) => {
      setRemoteUsers((current) =>
        current
          .map((item) => {
            if (item.uid !== user.uid) {
              return item;
            }

            return {
              ...item,
              audioTrack: mediaType === "audio" ? null : item.audioTrack,
              videoTrack: mediaType === "video" ? null : item.videoTrack,
            };
          })
          .filter((item) => item.audioTrack || item.videoTrack),
      );
    });

    client.on("user-left", (user) => {
      setRemoteUsers((current) =>
        current.filter((item) => item.uid !== user.uid),
      );
    });
  };

  const joinCall = async () => {
    const trimmedAppointmentId = appointmentId.trim();
    if (!trimmedAppointmentId) {
      setJoinError("Enter an appointment ID to join the call.");
      return;
    }

    setIsJoining(true);
    setJoinError("");
    setError("");

    try {
      const session = await telemedicineAPI.ensureSession(trimmedAppointmentId);
      const tokenInfo = await telemedicineAPI.getSessionToken(
        session.sessionId,
      );

      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      attachClientListeners(client);

      const uid = Number(String(Date.now()).slice(-9));

      await client.join(
        tokenInfo.agoraAppId,
        session.roomName,
        tokenInfo.token,
        uid,
      );

      const [audioTrack, videoTrack] =
        await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracksRef.current = { audioTrack, videoTrack };
      clientRef.current = client;

      if (localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      await client.publish([audioTrack, videoTrack]);
      await telemedicineAPI.startSession(session.sessionId);

      setSessionInfo(session);
      setIsAudioEnabled(true);
      setIsVideoEnabled(true);
      setIsJoined(true);
      currentSessionRef.current = session;
    } catch (err) {
      const baseMessage =
        err.message || "Failed to join the telemedicine call.";
      if (
        String(baseMessage).includes("invalid vendor key") ||
        String(baseMessage).includes("can not find appid")
      ) {
        setJoinError(
          "Agora App ID is invalid at runtime. Check AGORA_APP_ID in backend/.env, then restart docker compose and try again.",
        );
      } else {
        setJoinError(baseMessage);
      }
    } finally {
      setIsJoining(false);
    }
  };

  const leaveCall = async () => {
    const client = clientRef.current;
    const { audioTrack, videoTrack } = localTracksRef.current;
    const activeSession = currentSessionRef.current;

    try {
      if (activeSession?.sessionId) {
        await telemedicineAPI.endSession(activeSession.sessionId);
      }
    } catch {
      // Leave the room even if the backend update fails.
    }

    if (audioTrack) {
      audioTrack.stop();
      audioTrack.close();
    }

    if (videoTrack) {
      videoTrack.stop();
      videoTrack.close();
    }

    if (client) {
      client.removeAllListeners();
      await client.leave();
    }

    clientRef.current = null;
    localTracksRef.current = { audioTrack: null, videoTrack: null };
    currentSessionRef.current = null;
    setRemoteUsers([]);
    setIsJoined(false);
    setSessionInfo((current) =>
      current ? { ...current, state: "COMPLETED" } : current,
    );
  };

  const toggleAudio = async () => {
    const track = localTracksRef.current.audioTrack;
    if (!track) {
      return;
    }

    if (isAudioEnabled) {
      track.setEnabled(false);
    } else {
      await track.setEnabled(true);
    }

    setIsAudioEnabled((current) => !current);
  };

  const toggleVideo = async () => {
    const track = localTracksRef.current.videoTrack;
    if (!track) {
      return;
    }

    if (isVideoEnabled) {
      track.setEnabled(false);
    } else {
      await track.setEnabled(true);
    }

    setIsVideoEnabled((current) => !current);
  };

  const lookupAppointment = async () => {
    const trimmedAppointmentId = appointmentId.trim();
    if (!trimmedAppointmentId) {
      setLookupError("Enter an appointment ID first.");
      return;
    }

    setLookupBusy(true);
    setLookupError("");

    try {
      const session =
        await telemedicineAPI.getSessionByAppointment(trimmedAppointmentId);
      if (!session) {
        setLookupError(
          "No telemedicine session exists for that appointment yet. Use Join call to create it.",
        );
        return;
      }

      setSessionInfo(session);
      setError("");
    } catch (err) {
      setLookupError(err.message || "Failed to load telemedicine session.");
    } finally {
      setLookupBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="mb-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
              Telemedicine room
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Join a secure video call
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Enter an appointment ID to connect the patient and doctor inside
              the same call room.
            </p>
          </div>
          <div className="flex w-full gap-3 lg:w-[520px]">
            <input
              className="min-w-0 flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              onChange={(event) => setAppointmentId(event.target.value)}
              placeholder="Appointment ID"
              value={appointmentId}
            />
            <button
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={lookupBusy}
              onClick={lookupAppointment}
              type="button"
            >
              {lookupBusy ? "Checking..." : "Load"}
            </button>
          </div>
        </div>
        {(joinError || lookupError) && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {joinError || lookupError}
          </div>
        )}
      </div>

      <VideoCallRoom
        appointmentId={appointmentId || appointmentIdParam || "Not provided"}
        currentUserLabel={getCurrentUserLabel()}
        error={error}
        isAudioEnabled={isAudioEnabled}
        isJoining={isJoining}
        isJoined={isJoined}
        isVideoEnabled={isVideoEnabled}
        localVideoRef={localVideoRef}
        onJoin={joinCall}
        onLeave={leaveCall}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        remoteUsers={remoteUsers}
        sessionInfo={sessionInfo}
      />
    </div>
  );
}
