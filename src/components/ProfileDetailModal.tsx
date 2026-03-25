import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { closeProfile } from '../store/searchSlice';
import { ProfileDetail, type Skill, useGetProfileDetailQuery } from '../store/searchApi';

const DEFAULT_AVATAR =
  'https://static.licdn.com/aero-v1/sc/h/9c8pery4andzj6ohjkjp54ma2';

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Present';
  if (dateStr.length === 4) return dateStr;
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatDuration(months?: number): string {
  if (!months) return '';
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  if (yrs > 0 && mos > 0) return `${yrs} yr ${mos} mo`;
  if (yrs > 0) return `${yrs} yr`;
  return `${mos} mo`;
}

type GenericRecord = Record<string, unknown>;

type DynamicSection = {
  key: string;
  title: string;
  icon: string;
  items: GenericRecord[];
};

const SECTION_META: Record<string, { title: string; icon: string }> = {
  awards: { title: 'Awards', icon: 'A' },
  certifications: { title: 'Certifications', icon: 'C' },
  courses: { title: 'Courses', icon: 'C' },
  honors: { title: 'Honors & Awards', icon: 'A' },
  patents: { title: 'Patents', icon: 'P' },
  projects: { title: 'Projects', icon: 'P' },
  publications: { title: 'Publications', icon: 'P' },
  test_scores: { title: 'Test Scores', icon: 'T' },
  volunteer_experiences: { title: 'Volunteer Experience', icon: 'V' },
  organizations: { title: 'Organizations', icon: 'O' },
  languages: { title: 'Languages', icon: 'L' },
};

const RESERVED_SECTION_KEYS = new Set([
  'id',
  'full_name',
  'headline',
  'picture_url',
  'picture_proxy_url',
  'location_full',
  'location_city',
  'location_country',
  'summary',
  'activity',
  'linkedin_url',
  'connections_count',
  'followers_count',
  'active_experience_title',
  'total_experience_duration_months',
  'experiences',
  'educations',
  'skills',
]);

function startCase(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getText(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || null;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

function pickFirst(item: GenericRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = getText(item[key]);
    if (value) return value;
  }
  return null;
}

function buildMetaLine(item: GenericRecord): string | null {
  const dateFrom = pickFirst(item, ['date_from', 'started_on', 'issued_on', 'award_date']);
  const dateTo = pickFirst(item, ['date_to', 'ends_on', 'expires_on']);
  const years = [
    pickFirst(item, ['date_from_year']),
    pickFirst(item, ['date_to_year']),
  ].filter(Boolean) as string[];

  const dateRange = dateFrom
    ? `${formatDate(dateFrom)} - ${dateTo ? formatDate(dateTo) : 'Present'}`
    : years.length > 0
      ? `${years[0]}${years[1] ? ` - ${years[1]}` : ''}`
      : null;

  const extras = [
    pickFirst(item, ['authority', 'issuer', 'organization', 'company_name', 'institution_name']),
    pickFirst(item, ['location', 'display_source']),
  ].filter(Boolean) as string[];

  return [dateRange, ...extras].filter(Boolean).join(' • ') || null;
}

function buildDescriptionLines(item: GenericRecord): string[] {
  const primaryDescription = pickFirst(item, [
    'description',
    'summary',
    'blurb',
    'notes',
    'content',
  ]);

  const detailKeys = [
    'associated_with',
    'credential_id',
    'credential_url',
    'patent_number',
    'inventors',
    'authors',
    'publication_name',
    'publisher',
    'grade',
    'score',
    'url',
  ];

  const detailLines = detailKeys
    .map((key) => {
      const value = getText(item[key]);
      return value ? `${startCase(key)}: ${value}` : null;
    })
    .filter(Boolean) as string[];

  return [primaryDescription, ...detailLines].filter(Boolean) as string[];
}

function getDynamicSections(profile: ProfileDetail): DynamicSection[] {
  return Object.entries(profile)
    .filter(([key, value]) => !RESERVED_SECTION_KEYS.has(key) && Array.isArray(value) && value.length > 0)
    .map(([key, value]) => {
      const items = (value as unknown[]).filter(
        (item): item is GenericRecord => Boolean(item) && typeof item === 'object'
      );

      return {
        key,
        title: SECTION_META[key]?.title ?? startCase(key),
        icon: SECTION_META[key]?.icon ?? 'I',
        items,
      };
    })
    .filter((section) => section.items.length > 0);
}

function Icon({
  children,
  className = 'h-4 w-4',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
      {children}
    </svg>
  );
}

function Card({
  title,
  children,
  rightSlot,
}: {
  title: string;
  children: React.ReactNode;
  rightSlot?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {rightSlot}
      </div>
      {children}
    </section>
  );
}

function DynamicItem({
  item,
  index,
  sectionKey,
}: {
  item: GenericRecord;
  index: number;
  sectionKey?: string;
}) {
  if (sectionKey === 'languages') {
    const languageName = pickFirst(item, ['language_name', 'language']) ?? `Language ${index + 1}`;
    const proficiency = pickFirst(item, ['proficiency']);

    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-cyan-50 px-3 py-1.5 text-sm font-semibold text-cyan-700">
            {languageName}
          </span>
          {proficiency && (
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
              {proficiency}
            </span>
          )}
        </div>
      </div>
    );
  }

  const title = pickFirst(item, [
    'name',
    'title',
    'award_title',
    'language_name',
    'course_name',
    'certification_name',
    'patent_title',
    'project_title',
    'publication_title',
    'organization_name',
    'language',
    'score_name',
  ]) ?? `Item ${index + 1}`;

  const subtitle = pickFirst(item, [
    'subtitle',
    'occupation',
    'degree',
    'license_number',
    'language_name',
    'proficiency',
    'status',
  ]);

  const meta = buildMetaLine(item);
  const descriptionLines = buildDescriptionLines(item);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-lg font-semibold text-slate-900">{title}</p>
      {subtitle && <p className="mt-1 text-sm font-medium text-slate-700">{subtitle}</p>}
      {meta && <p className="mt-2 text-sm text-slate-500">{meta}</p>}
      {descriptionLines.length > 0 && (
        <div className="mt-3 space-y-2">
          {descriptionLines.map((line, lineIndex) => (
            <p key={`${lineIndex}-${line}`} className="break-words text-sm leading-7 text-slate-600">
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function getLocation(profile?: ProfileDetail) {
  return (
    profile?.location_full ||
    [profile?.location_city, profile?.location_country].filter(Boolean).join(', ')
  );
}

function getSkillNames(skills?: Skill[]) {
  return skills?.map((skill) => skill.skill_name).filter(Boolean) as string[] | undefined;
}

export default function ProfileDetailModal() {
  const dispatch = useAppDispatch();
  const profileId = useAppSelector((s) => s.search.selectedProfileId);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [showInitialsFallback, setShowInitialsFallback] = useState(false);

  const { currentData: profile, isFetching, isError } = useGetProfileDetailQuery(profileId as string, {
    skip: !profileId,
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch(closeProfile());
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch]);

  useEffect(() => {
    if (!profileId) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [profileId]);

  useEffect(() => {
    if (!profileId) {
      setImageSrc(null);
      setShowInitialsFallback(false);
      return;
    }

    setImageSrc(profile?.picture_proxy_url || profile?.picture_url || DEFAULT_AVATAR);
    setShowInitialsFallback(false);
  }, [profileId, profile?.picture_proxy_url, profile?.picture_url]);

  if (!profileId) {
    return null;
  }

  const initials = (profile?.full_name ?? '?')
    .split(' ')
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const dynamicSections = profile ? getDynamicSections(profile) : [];
  const location = getLocation(profile);
  const skillNames = getSkillNames(profile?.skills) ?? [];
  const activityItems = Array.isArray(profile?.activity)
    ? (profile.activity as Array<Record<string, unknown>>)
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm" onClick={() => dispatch(closeProfile())}>
      <div className="h-screen w-screen overflow-y-auto bg-[#f4f8fc]" onClick={(e) => e.stopPropagation()}>
        <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-20 pt-6 lg:flex-row">
          <div className="w-full space-y-4 lg:w-8/12">
            {isFetching && (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm">
                <span className="rm-spinner mx-auto mb-3 block h-5 w-5 border-slate-200 border-t-cyan-600" />
                Loading profile details...
              </div>
            )}

            {isError && (
              <div className="rounded-xl border border-rose-200 bg-white p-10 text-center text-rose-600 shadow-sm">
                Failed to load profile. Please try again.
              </div>
            )}

            {profile && (
              <>
                <section className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <button
                    onClick={() => dispatch(closeProfile())}
                    className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm transition hover:bg-white hover:text-slate-800"
                    aria-label="Close"
                  >
                    <Icon className="h-5 w-5">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </Icon>
                  </button>

                  <div className="h-44 bg-[linear-gradient(120deg,#0f5ea6_0%,#146cb8_45%,#16b6c5_100%)]" />

                  <div className="relative px-6 pb-6">
                    <div className="relative inline-block">
                      <div className="-mt-16 h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-sm">
                        {!showInitialsFallback && imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={profile.full_name}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={() => {
                              if (imageSrc !== DEFAULT_AVATAR) {
                                setImageSrc(DEFAULT_AVATAR);
                                return;
                              }
                              setShowInitialsFallback(true);
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#0f5ea6_0%,#16b6c5_100%)] text-4xl font-bold text-white">
                            {initials}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <h1 className="text-2xl font-bold text-slate-900">{profile.full_name}</h1>
                        {profile.headline && (
                          <p className="mt-1 max-w-2xl text-lg text-slate-700">{profile.headline}</p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
                          {profile.total_experience_duration_months != null && (
                            <span className="inline-flex items-center gap-2">
                              <Icon className="h-4 w-4">
                                <path d="M8 7V4m8 3V4M4 10h16M6 6h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2z" />
                              </Icon>
                              {formatDuration(profile.total_experience_duration_months)}
                            </span>
                          )}
                          {location && (
                            <span className="inline-flex items-center gap-2">
                              <Icon className="h-4 w-4">
                                <path d="M12 21s-6-4.35-6-10a6 6 0 1112 0c0 5.65-6 10-6 10z" />
                                <circle cx="12" cy="11" r="2.5" />
                              </Icon>
                              {location}
                            </span>
                          )}
                          {profile.connections_count != null && <span>{profile.connections_count}+ connections</span>}
                          {profile.followers_count != null && <span>{profile.followers_count} followers</span>}
                        </div>
                      </div>

                      {profile.linkedin_url && (
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${profile.full_name} on LinkedIn`}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0A66C2] text-white transition hover:brightness-105"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                            <path d="M20.45 20.45h-3.56v-5.58c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.95v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.46v6.28zM5.34 7.43a2.07 2.07 0 110-4.14 2.07 2.07 0 010 4.14zM7.12 20.45H3.56V9h3.56v11.45z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </section>

                {profile.summary && (
                  <Card title="About">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{profile.summary}</p>
                  </Card>
                )}

                {profile.experiences && profile.experiences.length > 0 && (
                  <Card title="Experience">
                    <div className="space-y-6">
                      {profile.experiences.map((exp, index) => (
                        <div key={exp.id ?? index} className="flex gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-cyan-600 text-lg font-bold text-white">
                            {(exp.company_name || 'B').charAt(0).toUpperCase()}
                          </div>
                          <div className={`flex-1 pb-6 ${index !== profile.experiences!.length - 1 ? 'border-b border-slate-100' : ''}`}>
                            <h3 className="text-lg font-bold text-slate-900">{exp.position_title || 'Role not available'}</h3>
                            <p className="text-md font-medium text-slate-800">
                              {[exp.company_name, exp.active_experience ? 'Current' : undefined].filter(Boolean).join(' · ')}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {[formatDate(exp.date_from), formatDate(exp.date_to), exp.duration_months ? formatDuration(exp.duration_months) : null, exp.location].filter(Boolean).join(' • ')}
                            </p>
                            {exp.description && (
                              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                                {exp.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {profile.educations && profile.educations.length > 0 && (
                  <Card title="Education">
                    <div className="space-y-6">
                      {profile.educations.map((edu, index) => (
                        <div key={edu.id ?? index} className="flex gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-[#0f5ea6] text-white">
                            <Icon className="h-6 w-6">
                              <path d="M3 8l9-4 9 4-9 4-9-4zM6 10.5V15c0 .9 2.7 3 6 3s6-2.1 6-3v-4.5" />
                            </Icon>
                          </div>
                          <div className={`flex-1 pb-6 ${index !== profile.educations!.length - 1 ? 'border-b border-slate-100' : ''}`}>
                            <h3 className="text-lg font-bold text-slate-900">{edu.institution_name || 'Institution not available'}</h3>
                            <p className="text-md font-medium text-slate-800">{edu.degree}</p>
                            {(edu.date_from_year || edu.date_to_year) && (
                              <p className="mt-1 text-sm text-slate-500">
                                {edu.date_from_year} - {edu.date_to_year ?? 'Present'}
                              </p>
                            )}
                            {edu.description && (
                              <p className="mt-2 text-sm leading-7 text-slate-700">{edu.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {dynamicSections.map((section) => (
                  <Card key={section.key} title={section.title}>
                    <div className="space-y-4">
                      {section.items.map((item, index) => (
                        <DynamicItem key={`${section.key}-${index}`} item={item} index={index} sectionKey={section.key} />
                      ))}
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>

          {profile && (
            <div className="w-full space-y-4 lg:w-4/12">
              {skillNames.length > 0 && (
                <Card title="Top Skills">
                  <div className="flex flex-wrap gap-2">
                    {skillNames.map((skill, index) => (
                      <span key={index} className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {activityItems.length > 0 && (
                <Card title="Activity">
                  <div className="space-y-4">
                    {activityItems
                      .slice()
                      .sort(
                        (a, b) =>
                          Number(a.order_in_profile ?? Number.MAX_SAFE_INTEGER) -
                          Number(b.order_in_profile ?? Number.MAX_SAFE_INTEGER)
                      )
                      .map((item, index) => {
                        const title =
                          typeof item.title === 'string' && item.title.trim()
                            ? item.title.trim()
                            : `Activity ${index + 1}`;
                        const action =
                          typeof item.action === 'string' && item.action.trim()
                            ? item.action.trim()
                            : undefined;
                        const url =
                          typeof item.activity_url === 'string' && item.activity_url.trim()
                            ? item.activity_url.trim()
                            : undefined;

                        return (
                          <div key={`${index}-${title}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            {action && (
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                {action}
                              </p>
                            )}
                            {url ? (
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 block text-sm leading-7 text-slate-700 hover:text-cyan-700 hover:underline"
                              >
                                {title}
                              </a>
                            ) : (
                              <p className="mt-2 text-sm leading-7 text-slate-700">{title}</p>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
