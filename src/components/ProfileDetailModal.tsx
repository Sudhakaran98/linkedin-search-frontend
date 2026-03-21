import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { closeProfile } from '../store/searchSlice';
import { useGetProfileDetailQuery } from '../store/searchApi';

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Present';
  if (dateStr.length === 4) return dateStr;
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatDuration(months?: number): string {
  if (!months) return '';
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  if (yrs > 0 && mos > 0) return `${yrs} yr ${mos} mo`;
  if (yrs > 0) return `${yrs} yr`;
  return `${mos} mo`;
}

export default function ProfileDetailModal() {
  const dispatch = useAppDispatch();
  const profileId = useAppSelector((s) => s.search.selectedProfileId);

  // RTK Query — only fires when profileId is set
  const { data: profile, isLoading, isError } = useGetProfileDetailQuery(
    profileId as string,
    { skip: !profileId }
  );

  // Close on Escape
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

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => dispatch(closeProfile())}
    >
      {/* Modal box */}
      <div
        className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Blue header strip */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 h-28 relative flex-shrink-0">
          <button
            onClick={() => dispatch(closeProfile())}
            className="absolute top-3 right-3 text-white/80 hover:text-white text-2xl leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 pb-8">
          {isLoading && (
            <div className="pt-10 text-center text-gray-500 animate-pulse">Loading profile…</div>
          )}

          {isError && (
            <div className="pt-10 text-center text-red-500">
              Failed to load profile. Please try again.
            </div>
          )}

          {profile && (
            <div className="relative -mt-12">
              {/* Avatar */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                  {profile.picture_url ? (
                    <img
                      src={profile.picture_url}
                      alt={profile.full_name}
                      className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover mb-3"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-blue-100 text-blue-700 flex items-center justify-center text-3xl font-bold mb-3">
                      {initials}
                    </div>
                  )}
                  <h2 className="text-2xl font-bold text-gray-900">{profile.full_name}</h2>
                  {profile.headline && (
                    <p className="text-gray-600 mt-1">{profile.headline}</p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                    {(profile.location_full || profile.location_city) && (
                      <span>📍 {profile.location_full || [profile.location_city, profile.location_country].filter(Boolean).join(', ')}</span>
                    )}
                    {profile.connections_count != null && (
                      <span>👥 {profile.connections_count}+ connections</span>
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
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors shrink-0"
                  >
                    🔗 View on LinkedIn
                  </a>
                )}
              </div>

              {/* About */}
              {profile.summary && (
                <section className="mb-8 bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-2 text-lg">About</h3>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {profile.summary}
                  </p>
                </section>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Experience + Education */}
                <div className="lg:col-span-2 space-y-8">

                  {/* Experience */}
                  {profile.experiences && profile.experiences.length > 0 && (
                    <section>
                      <h3 className="font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2 border-b pb-2">
                        💼 Experience
                      </h3>
                      <div className="space-y-6">
                        {profile.experiences.map((exp, i) => (
                          <div key={exp.id ?? i} className="flex gap-3">
                            {exp.company_logo_url ? (
                              <img
                                src={exp.company_logo_url}
                                alt={exp.company_name}
                                className="w-10 h-10 rounded border bg-white object-contain p-0.5 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded border bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                🏢
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900 leading-tight">
                                {exp.position_title}
                              </p>
                              <p className="text-gray-600 text-sm">{exp.company_name}</p>
                              <p className="text-gray-400 text-xs mt-0.5">
                                {formatDate(exp.date_from)} – {formatDate(exp.date_to)}
                                {exp.duration_months ? ` · ${formatDuration(exp.duration_months)}` : ''}
                                {exp.location ? ` · ${exp.location}` : ''}
                              </p>
                              {exp.description && (
                                <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                                  {exp.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Education */}
                  {profile.educations && profile.educations.length > 0 && (
                    <section>
                      <h3 className="font-semibold text-gray-800 text-lg mb-4 flex items-center gap-2 border-b pb-2">
                        🎓 Education
                      </h3>
                      <div className="space-y-4">
                        {profile.educations.map((edu, i) => (
                          <div key={edu.id ?? i} className="flex gap-3">
                            {edu.institution_logo_url ? (
                              <img
                                src={edu.institution_logo_url}
                                alt={edu.institution_name}
                                className="w-10 h-10 rounded border bg-white object-contain p-0.5 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded border bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                🏫
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">{edu.institution_name}</p>
                              <p className="text-gray-600 text-sm">{edu.degree}</p>
                              {(edu.date_from_year || edu.date_to_year) && (
                                <p className="text-gray-400 text-xs">
                                  {edu.date_from_year} – {edu.date_to_year ?? 'Present'}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* Skills sidebar */}
                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg mb-4 border-b pb-2">
                      🛠 Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((s, i) => (
                        <span
                          key={i}
                          className="bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium px-3 py-1 rounded-full"
                        >
                          {s.skill_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
