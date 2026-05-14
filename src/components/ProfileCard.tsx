import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  useUpdateGenderMutation,
  type ProfileCard as ProfileCardType,
  type EnrichContactResult,
  type SalesqlEmail,
  type SalesqlPhone,
} from '../store/searchApi';
import { useAppDispatch } from '../store/hooks';
import { openProfile } from '../store/searchSlice';

const DEFAULT_AVATAR =
  'https://static.licdn.com/aero-v1/sc/h/9c8pery4andzj6ohjkjp54ma2';
const GENDER_OPTIONS = ['male', 'female'] as const;

interface Props {
  profile: ProfileCardType;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  contactInfo?: EnrichContactResult;
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

export default function ProfileCard({ profile, isSelected, onToggleSelect, contactInfo, onGenderUpdateToast }: Props) {
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
  const [showContactPopup, setShowContactPopup] = useState(false);

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
      <div className={[
        'w-full rounded-[26px] border bg-white px-5 py-5 text-left shadow-sm transition',
        isSelected ? 'border-violet-300 ring-2 ring-violet-100' : 'border-slate-200',
      ].join(' ')}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
        <div className="relative flex items-start gap-4 lg:w-[320px] lg:flex-none">
          <input
            type="checkbox"
            checked={isSelected ?? false}
            onChange={onToggleSelect}
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 top-0 z-10 h-4 w-4 cursor-pointer rounded border-slate-300 text-violet-600 focus:ring-violet-500"
          />
          <div className="relative mt-5 h-24 w-24 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 shadow-sm">
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

          {(contactInfo !== undefined || profile.salesql_enriched_at) && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowContactPopup(true); }}
              className="absolute right-0 top-9 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-100 bg-white shadow-sm transition hover:border-violet-200 hover:shadow"
              title="View contact info"
            >
              <svg viewBox="0 0 48 48" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 28 C10 10, 38 10, 38 24" stroke="#3B82F6" strokeWidth="5.5" strokeLinecap="round" fill="none" />
                <path d="M32 19 L38 24 L44 19" stroke="#3B82F6" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M38 24 C38 40, 10 40, 10 28" stroke="#F97316" strokeWidth="5.5" strokeLinecap="round" fill="none" />
                <path d="M16 33 L10 28 L4 33" stroke="#F97316" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </button>
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

      {showContactPopup &&
        createPortal(
          (() => {
            const popupEmails: SalesqlEmail[] = contactInfo?.emails ?? profile.salesql_emails ?? [];
            const popupPhones: SalesqlPhone[] = contactInfo?.phones ?? profile.salesql_phones ?? [];
            const hasError = Boolean(contactInfo?.error);
            const hasData = popupEmails.length > 0 || popupPhones.length > 0;

            return (
              <div
                className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
                onClick={() => setShowContactPopup(false)}
              >
                <div
                  className="w-full max-w-lg overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.18)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200">
                        <svg viewBox="0 0 48 48" className="h-5 w-5" fill="none">
                          <path d="M10 28 C10 10, 38 10, 38 24" stroke="#3B82F6" strokeWidth="5.5" strokeLinecap="round" fill="none" />
                          <path d="M32 19 L38 24 L44 19" stroke="#3B82F6" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          <path d="M38 24 C38 40, 10 40, 10 28" stroke="#F97316" strokeWidth="5.5" strokeLinecap="round" fill="none" />
                          <path d="M16 33 L10 28 L4 33" stroke="#F97316" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">Contact Information</h3>
                        <p className="text-xs text-slate-400">{profile.full_name}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowContactPopup(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </div>

                  {/* Body */}
                  <div className="px-6 py-5 space-y-5">

                    {hasError && (
                      <div className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-4 w-4 shrink-0 text-rose-400">
                          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p className="text-sm text-rose-600">Could not retrieve contact info for this profile.</p>
                      </div>
                    )}

                    {!hasError && !hasData && (
                      <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className="h-4 w-4 shrink-0 text-slate-400">
                          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p className="text-sm text-slate-500">Profile not found in SalesQL database.</p>
                      </div>
                    )}

                    {popupEmails.length > 0 && (
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-slate-400">
                            <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Email Address</span>
                        </div>
                        <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
                          {popupEmails.map((e, i) => (
                            <div key={`${e.email}-${i}`} className="flex items-center justify-between gap-3 bg-white px-4 py-3 hover:bg-slate-50 transition">
                              <a href={`mailto:${e.email}`} className="flex items-center gap-2.5 min-w-0">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-blue-500">
                                    <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                  </svg>
                                </div>
                                <span className="truncate text-sm font-medium text-slate-700 hover:text-blue-600 hover:underline">{e.email}</span>
                              </a>
                              <div className="flex shrink-0 items-center gap-1.5">
                                {e.type && (
                                  <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600">{e.type}</span>
                                )}
                                {e.status && (
                                  <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${e.status.toLowerCase() === 'valid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                                    {e.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {popupPhones.length > 0 && (
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-slate-400">
                            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.63A2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                          </svg>
                          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Phone Number</span>
                        </div>
                        <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
                          {popupPhones.map((p, i) => (
                            <div key={`${p.phone}-${i}`} className="flex items-center justify-between gap-3 bg-white px-4 py-3 hover:bg-slate-50 transition">
                              <a href={`tel:${p.phone}`} className="flex items-center gap-2.5 min-w-0">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-violet-500">
                                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.63A2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                                  </svg>
                                </div>
                                <span className="truncate text-sm font-medium text-slate-700 hover:text-blue-600 hover:underline">{p.phone}</span>
                              </a>
                              <div className="flex shrink-0 items-center gap-1.5">
                                {p.type && (
                                  <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600">{p.type}</span>
                                )}
                                {p.country_code && (
                                  <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-500">{p.country_code}</span>
                                )}
                                {p.is_valid !== undefined && (
                                  <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${p.is_valid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                                    {p.is_valid ? 'Valid' : 'Invalid'}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                </div>
              </div>
            </div>
            );
          })(),
          document.body
        )}

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
