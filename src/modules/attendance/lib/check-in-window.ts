type CheckInWindowSettings = {
  allowQrCheckIn: boolean;
  checkInWindowMinutesBeforeClass: number;
  checkInWindowMinutesAfterClass: number;
};

type CheckInWindowSession = {
  startsAt: Date;
  endsAt: Date;
};

export function isWithinCheckInWindow(
  session: CheckInWindowSession,
  settings: CheckInWindowSettings,
  reference = new Date(),
): boolean {
  if (!settings.allowQrCheckIn) {
    return false;
  }

  const windowStart = new Date(session.startsAt);
  windowStart.setMinutes(
    windowStart.getMinutes() - settings.checkInWindowMinutesBeforeClass,
  );

  const windowEnd = new Date(session.endsAt);
  windowEnd.setMinutes(
    windowEnd.getMinutes() + settings.checkInWindowMinutesAfterClass,
  );

  return reference >= windowStart && reference <= windowEnd;
}
