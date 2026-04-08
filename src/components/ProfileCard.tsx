import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  useUpdateGenderMutation,
  type ProfileCard as ProfileCardType,
} from '../store/searchApi';
import { useAppDispatch } from '../store/hooks';
import { openProfile } from '../store/searchSlice';

const DEFAULT_AVATAR =
  'https://static.licdn.com/aero-v1/sc/h/9c8pery4andzj6ohjkjp54ma2';
const GENDER_OPTIONS = ['male', 'female'] as const;

interface Props {
  profile: ProfileCardType;
  onGenderUpdateToast?: (message: string, tone?: 'info' | 'error') => void;
}

function formatExperience(months?: number) {
  if (!months || months <= 0) {
    return null;
  }

  const years = months / 12;
  const roundedYears = years >= 10 ? Math.round(years) : Math.round(years * 10) / 10;

  if (roundedYears % 1 === 0) {
    return `${roundedYears} yrs experience`;
  }

  return `${roundedYears} yrs experience`;
}

function truncateWords(text?: string, limit = 36) {
  if (!text) {
    return 'Profile summary is not available for this profile.';
  }

  const words = text.trim().split(/\s+/);
  if (words.length <= limit) {
    return text.trim();
  }

  return `${words.slice(0, limit).join(' ')}...`;
}

export default function ProfileCard({ profile, onGenderUpdateToast }: Props) {
  const dispatch = useAppDispatch();
  const [updateGender, { isLoading: isUpdatingGender }] = useUpdateGenderMutation();
  const initials = useMemo(
    () =>
      profile.full_name
        .split(' ')
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
    [profile.full_name]
  );

  const [imageSrc, setImageSrc] = useState(
    profile.picture_proxy_url || profile.picture_url || DEFAULT_AVATAR
  );
  const [showInitialsFallback, setShowInitialsFallback] = useState(false);
  const [localGender, setLocalGender] = useState(profile.gender);
  const [pendingGender, setPendingGender] = useState<(typeof GENDER_OPTIONS)[number] | null>(null);
  const [genderError, setGenderError] = useState<string | null>(null);

  useEffect(() => {
    setLocalGender(profile.gender);
  }, [profile.gender]);

  const location =
    profile.location_full ||
    [profile.location_city, profile.location_country].filter(Boolean).join(', ');

  const currentRole =
    profile.current_experience_label ||
    [profile.active_experience_title, profile.active_experience_company_name]
      .filter(Boolean)
      .join(' at ');
  const pastRoles = profile.past_experience_labels?.filter(Boolean).join(' • ');
  const experienceLabel = formatExperience(profile.total_experience_duration_months);
  const summaryPreview = truncateWords(profile.summary, 36);

  async function handleGenderChange(nextGender: (typeof GENDER_OPTIONS)[number]) {
    if (nextGender === localGender || isUpdatingGender) {
      return;
    }

    setGenderError(null);
    setPendingGender(nextGender);
  }

  async function confirmGenderChange() {
    if (!pendingGender) {
      return;
    }

    try {
      await updateGender({
        firstName: profile.first_name,
        gender: pendingGender,
      }).unwrap();
      setLocalGender(pendingGender);
      setPendingGender(null);
      onGenderUpdateToast?.(
        `Updated gender to ${pendingGender} for all profiles matching first name "${profile.first_name}".`,
        'info'
      );
    } catch {
      const message = 'Failed to update gender. Please try again.';
      setGenderError(message);
      onGenderUpdateToast?.(message, 'error');
    }
  }

  return (
    <>
      <div className="w-full rounded-[26px] border border-slate-200 bg-white px-5 py-5 text-left shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
        <div className="relative flex items-start gap-4 lg:w-[320px] lg:flex-none">
          <div className="relative h-24 w-24 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 shadow-sm">
            {!showInitialsFallback ? (
              <img
                src={imageSrc}
                alt={profile.full_name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={() => {
                  if (imageSrc !== DEFAULT_AVATAR) {
                    setImageSrc(DEFAULT_AVATAR);
                    return;
                  }
                  setShowInitialsFallback(true);
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-slate-500">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="pr-12 text-[28px] font-semibold tracking-tight text-slate-900">
              {profile.full_name}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              {experienceLabel && (
                <span className="inline-flex items-center rounded-full bg-cyan-50 px-3 py-1.5 font-semibold text-cyan-700">
                  {experienceLabel}
                </span>
              )}
              {location && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5">
                  {location}
                </span>
              )}
              {profile.score && (
                <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 font-semibold text-amber-700">
                  Ranking {profile.score.normalized.toFixed(2)}%
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {/* <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Gender
              </span> */}
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
                {GENDER_OPTIONS.map((genderOption) => {
                  const isSelected = localGender === genderOption;

                  return (
                    <button
                      key={genderOption}
                      type="button"
                      disabled={isUpdatingGender}
                      onClick={() => handleGenderChange(genderOption)}
                      className={[
                        'rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition',
                        isSelected
                          ? 'bg-cyan-600 text-white'
                          : 'text-slate-600 hover:bg-white',
                        isUpdatingGender ? 'cursor-not-allowed opacity-70' : '',
                      ].join(' ')}
                    >
                      {genderOption}
                    </button>
                  );
                })}
              </div>
            </div>

            {genderError && <p className="mt-2 text-xs text-rose-600">{genderError}</p>}
          </div>

          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${profile.full_name} on LinkedIn`}
              className="absolute right-0 top-0 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0A66C2] text-white transition hover:brightness-110"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                <path d="M20.45 20.45h-3.56v-5.58c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.46v6.28zM5.34 7.43a2.07 2.07 0 110-4.14 2.07 2.07 0 010 4.14zM7.12 20.45H3.56V9h3.56v11.45z" />
              </svg>
            </a>
          )}
        </div>

        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Current
                </p>
                <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-700">
                  {currentRole || 'Not available'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Past
                </p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                  {pastRoles || 'Not available'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Headline
            </p>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
              {profile.headline || 'Not available'}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 md:col-span-2">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Profile Summary
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{summaryPreview}</p>
              </div>
              <button
                type="button"
                onClick={() => dispatch(openProfile(profile.id))}
                className="inline-flex shrink-0 self-end rounded-full bg-[linear-gradient(135deg,#4f7cff_0%,#1cc8a0_100%)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105"
              >
                Open Profile
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {pendingGender &&
        createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[28px] border border-cyan-100 bg-white p-6 shadow-[0_30px_80px_rgba(15,82,143,0.22)]">
              <div className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Confirm gender update
              </div>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">
                Update all matching profiles?
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Do you think everyone with the first name "{profile.first_name}" is{' '}
                {pendingGender === 'male' ? 'male' : 'female'}? This will update all matched
                profiles.
              </p>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPendingGender(null)}
                  disabled={isUpdatingGender}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmGenderChange}
                  disabled={isUpdatingGender}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4f7cff_0%,#1cc8a0_100%)] px-5 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isUpdatingGender ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
