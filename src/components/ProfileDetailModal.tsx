import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { closeProfile } from '../store/searchSlice';
import { ProfileDetail, useGetProfileDetailQuery } from '../store/searchApi';

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
  certifications: { title: 'Certifications', icon: '📜' },
  courses: { title: 'Courses', icon: '📚' },
  honors: { title: 'Honors & Awards', icon: '🏆' },
  patents: { title: 'Patents', icon: '💡' },
  projects: { title: 'Projects', icon: '🧩' },
  publications: { title: 'Publications', icon: '📰' },
  test_scores: { title: 'Test Scores', icon: '📈' },
  volunteer_experiences: { title: 'Volunteer Experience', icon: '🤝' },
  organizations: { title: 'Organizations', icon: '🏢' },
  languages: { title: 'Languages', icon: '🗣️' },
};

const RESERVED_SECTION_KEYS = new Set([
  'id',
  'full_name',
  'headline',
  'picture_url',
  'location_full',
  'location_city',
  'location_country',
  'summary',
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
  const dateFrom = pickFirst(item, ['date_from', 'started_on', 'issued_on']);
  const dateTo = pickFirst(item, ['date_to', 'ends_on', 'expires_on']);
  const years = [
    pickFirst(item, ['date_from_year']),
    pickFirst(item, ['date_to_year']),
  ].filter(Boolean) as string[];

  const dateRange = dateFrom
    ? `${formatDate(dateFrom)} – ${dateTo ? formatDate(dateTo) : 'Present'}`
    : years.length > 0
      ? `${years[0]}${years[1] ? ` – ${years[1]}` : ''}`
      : null;

  const extras = [
    pickFirst(item, ['authority', 'issuer', 'organization', 'company_name', 'institution_name']),
    pickFirst(item, ['location', 'display_source']),
  ].filter(Boolean) as string[];

  return [dateRange, ...extras].filter(Boolean).join(' · ') || null;
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
    .map(([key, value]) => ({
      key,
      title: SECTION_META[key]?.title ?? startCase(key),
      icon: SECTION_META[key]?.icon ?? '📌',
      items: value.filter((item): item is GenericRecord => !!item && typeof item === 'object'),
    }))
    .filter((section) => section.items.length > 0);
}

function renderDynamicItem(item: GenericRecord, index: number) {
  const title = pickFirst(item, [
    'name',
    'title',
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
    'proficiency',
    'status',
  ]);

  const meta = buildMetaLine(item);
  const descriptionLines = buildDescriptionLines(item);

  return (
    <div key={String(item.id ?? item.url ?? item.name ?? index)} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="font-semibold text-gray-900">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
      {meta && <p className="mt-1 text-xs text-gray-400">{meta}</p>}
      {descriptionLines.length > 0 && (
        <div className="mt-2 space-y-1">
          {descriptionLines.map((line, lineIndex) => (
            <p key={`${lineIndex}-${line}`} className="text-sm leading-relaxed text-gray-500 break-words">
              {line}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProfileDetailModal() {
  const dispatch = useAppDispatch();
  const profileId = useAppSelector((s) => s.search.selectedProfileId);

  const { data: profile, isLoading, isError } = useGetProfileDetailQuery(profileId as string, {
    skip: !profileId,
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch(closeProfile());
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dispatch]);

  if (!profileId) return null;

  const initials = (profile?.full_name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const dynamicSections = profile ? getDynamicSections(profile) : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => dispatch(closeProfile())}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-32 flex-shrink-0 bg-gradient-to-r from-blue-700 to-blue-500 sm:h-36">
          <button
            onClick={() => dispatch(closeProfile())}
            className="absolute right-3 top-3 text-2xl leading-none text-white/80 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-0 sm:px-6">
          {isLoading && (
            <div className="pt-10 text-center text-gray-500 animate-pulse">Loading profile…</div>
          )}

          {isError && (
            <div className="pt-10 text-center text-red-500">
              Failed to load profile. Please try again.
            </div>
          )}

          {profile && (
            <div className="relative -mt-16 sm:-mt-20">
              <div className="mb-8 flex flex-col gap-5 rounded-2xl bg-white/95 p-1 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  {profile.picture_url ? (
                    <img
                      src={profile.picture_url}
                      alt={profile.full_name}
                      className="mb-4 h-24 w-24 rounded-full border-4 border-white object-cover shadow-md"
                    />
                  ) : (
                    <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-blue-100 text-3xl font-bold text-blue-700 shadow-md">
                      {initials}
                    </div>
                  )}
                  <h2 className="break-words text-2xl font-bold text-gray-900 sm:text-3xl">{profile.full_name}</h2>
                  {profile.headline && (
                    <p className="mt-2 break-words text-gray-600">{profile.headline}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                    {(profile.location_full || profile.location_city) && (
                      <span>
                        📍 {profile.location_full || [profile.location_city, profile.location_country].filter(Boolean).join(', ')}
                      </span>
                    )}
                    {profile.connections_count != null && (
                      <span>👥 {profile.connections_count}+ connections</span>
                    )}
                    {profile.followers_count != null && (
                      <span>🌐 {profile.followers_count} followers</span>
                    )}
                    {profile.total_experience_duration_months != null && (
                      <span>💼 {formatDuration(profile.total_experience_duration_months)} total exp.</span>
                    )}
                  </div>
                </div>

                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:self-end"
                  >
                    🔗 View on LinkedIn
                  </a>
                )}
              </div>

              {profile.summary && (
                <section className="mb-8 rounded-xl border border-gray-100 bg-gray-50 p-5">
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">About</h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                    {profile.summary}
                  </p>
                </section>
              )}

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                <div className="space-y-8 xl:col-span-8">
                  {profile.experiences && profile.experiences.length > 0 && (
                    <section>
                      <h3 className="mb-4 flex items-center gap-2 border-b pb-2 text-lg font-semibold text-gray-800">
                        💼 Experience
                      </h3>
                      <div className="space-y-6">
                        {profile.experiences.map((exp, i) => (
                          <div key={exp.id ?? i} className="flex gap-3">
                            {exp.company_logo_url ? (
                              <img
                                src={exp.company_logo_url}
                                alt={exp.company_name}
                                className="h-10 w-10 shrink-0 rounded border bg-white object-contain p-0.5"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border bg-gray-100 text-gray-400">
                                🏢
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="leading-tight font-semibold text-gray-900 break-words">
                                {exp.position_title}
                              </p>
                              <p className="text-sm text-gray-600 break-words">{exp.company_name}</p>
                              <p className="mt-0.5 text-xs text-gray-400 break-words">
                                {formatDate(exp.date_from)} – {formatDate(exp.date_to)}
                                {exp.duration_months ? ` · ${formatDuration(exp.duration_months)}` : ''}
                                {exp.location ? ` · ${exp.location}` : ''}
                              </p>
                              {exp.description && (
                                <p className="mt-1 text-sm leading-relaxed text-gray-500 whitespace-pre-wrap break-words">
                                  {exp.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {profile.educations && profile.educations.length > 0 && (
                    <section>
                      <h3 className="mb-4 flex items-center gap-2 border-b pb-2 text-lg font-semibold text-gray-800">
                        🎓 Education
                      </h3>
                      <div className="space-y-4">
                        {profile.educations.map((edu, i) => (
                          <div key={edu.id ?? i} className="flex gap-3">
                            {edu.institution_logo_url ? (
                              <img
                                src={edu.institution_logo_url}
                                alt={edu.institution_name}
                                className="h-10 w-10 shrink-0 rounded border bg-white object-contain p-0.5"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border bg-gray-100 text-gray-400">
                                🏫
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 break-words">{edu.institution_name}</p>
                              <p className="text-sm text-gray-600 break-words">{edu.degree}</p>
                              {(edu.date_from_year || edu.date_to_year) && (
                                <p className="text-xs text-gray-400">
                                  {edu.date_from_year} – {edu.date_to_year ?? 'Present'}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {dynamicSections.map((section) => (
                    <section key={section.key}>
                      <h3 className="mb-4 flex items-center gap-2 border-b pb-2 text-lg font-semibold text-gray-800">
                        <span>{section.icon}</span>
                        <span>{section.title}</span>
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {section.items.map((item, index) => renderDynamicItem(item, index))}
                      </div>
                    </section>
                  ))}
                </div>

                <div className="space-y-6 xl:col-span-4">
                  {profile.skills && profile.skills.length > 0 && (
                    <section>
                      <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-gray-800">
                        🛠 Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((s, i) => (
                          <span
                            key={i}
                            className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                          >
                            {s.skill_name}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
