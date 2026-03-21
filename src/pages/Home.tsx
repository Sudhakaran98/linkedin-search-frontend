import React, { FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setSkillsInput,
  setDesignationInput,
  submitSearch,
  setActiveSubset,
  setCurrentPage,
} from '../store/searchSlice';
import {
  useGetSearchCountQuery,
  useSearchProfilesQuery,
} from '../store/searchApi';
import ProfileCard from '../components/ProfileCard';
import ProfileDetailModal from '../components/ProfileDetailModal';

export default function Home() {
  const dispatch = useAppDispatch();

  // ── Input state from Redux ──────────────────────────────────────────────────
  const skillsInput      = useAppSelector((s) => s.search.skillsInput);
  const designationInput = useAppSelector((s) => s.search.designationInput);
  const hasSearched      = useAppSelector((s) => s.search.hasSearched);
  const submittedSkills  = useAppSelector((s) => s.search.submittedSkills);
  const submittedDesig   = useAppSelector((s) => s.search.submittedDesignation);
  const activeSubset     = useAppSelector((s) => s.search.activeSubset);
  const currentPage      = useAppSelector((s) => s.search.currentPage);

  // ── RTK Query: count ────────────────────────────────────────────────────────
  const {
    data: countData,
    isFetching: countFetching,
    isError: countError,
  } = useGetSearchCountQuery(
    { skills: submittedSkills, designation: submittedDesig },
    { skip: !hasSearched }
  );

  // ── RTK Query: profiles ─────────────────────────────────────────────────────
  const {
    data: profilesData,
    isFetching: profilesFetching,
    isError: profilesError,
  } = useSearchProfilesQuery(
    {
      skills:      submittedSkills,
      designation: submittedDesig,
      subset:      activeSubset,
      page:        currentPage,
    },
    { skip: !hasSearched || !countData }
  );

  // ── Handlers ────────────────────────────────────────────────────────────────
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!skillsInput.trim() && !designationInput.trim()) return;
    dispatch(submitSearch());
  }

  function handleSubsetClick(idx: number) {
    dispatch(setActiveSubset(idx));
    window.scrollTo({ top: 350, behavior: 'smooth' });
  }

  const totalPages = profilesData?.totalPages ?? 0;
  const hasResults = !!countData && countData.total > 0;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Header / Search ───────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-blue-700 mb-1">LinkedIn Profile Search</h1>
          <p className="text-gray-500 text-sm mb-5">
            Search millions of profiles by skills or designation using full-text ranking.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            {/* Skills box (wider) */}
            <input
              type="text"
              placeholder="Skills  (e.g. java, spring, sql)"
              value={skillsInput}
              onChange={(e) => dispatch(setSkillsInput(e.target.value))}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            />

            {/* Designation box */}
            <input
              type="text"
              placeholder="Designation  (e.g. Software Engineer)"
              value={designationInput}
              onChange={(e) => dispatch(setDesignationInput(e.target.value))}
              className="sm:w-64 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            />

            <button
              type="submit"
              disabled={countFetching || (!skillsInput.trim() && !designationInput.trim())}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {countFetching ? 'Searching…' : 'Search'}
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Empty state ─────────────────────────────────────────────── */}
        {!hasSearched && (
          <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg font-medium text-gray-500">Enter skills or a designation to begin searching.</p>
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────────────── */}
        {(countError || profilesError) && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5 mb-6">
            <strong>Search failed.</strong> Make sure the API server is running and reachable.
          </div>
        )}

        {/* ── Results ─────────────────────────────────────────────────── */}
        {hasSearched && countData && (
          <div>

            {/* Count summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
              <p className="text-gray-800 font-semibold text-lg">
                {countData.total.toLocaleString()} profiles found
                {(submittedSkills || submittedDesig) && (
                  <span className="font-normal text-gray-500 text-base">
                    {' '}for "{[submittedSkills, submittedDesig].filter(Boolean).join(' · ')}"
                  </span>
                )}
              </p>
              {countData.subsets > 1 && (
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {countData.subsets} subsets · {countData.subsetSize.toLocaleString()} profiles each
                </span>
              )}
            </div>

            {/* Subset selector */}
            {hasResults && countData.subsets > 1 && (
              <div className="mb-6">
                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-2">Select Subset</p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {Array.from({ length: countData.subsets }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleSubsetClick(i)}
                      className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap
                        ${activeSubset === i
                          ? 'bg-blue-600 text-white border-blue-600 shadow'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                        }`}
                    >
                      Subset {i + 1}
                      <span className="ml-1 text-xs opacity-70">
                        ({(i * countData.subsetSize + 1).toLocaleString()}–{Math.min((i + 1) * countData.subsetSize, countData.total).toLocaleString()})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {!hasResults && !countFetching && (
              <div className="py-16 text-center text-gray-400">
                <div className="text-5xl mb-3">😶</div>
                <p className="text-lg">No profiles matched your search. Try broader terms.</p>
              </div>
            )}

            {/* Loading skeleton */}
            {profilesFetching && !profilesData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                    <div className="flex gap-3 mb-3">
                      <div className="w-14 h-14 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-5/6" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Profile cards grid */}
            {profilesData && profilesData.profiles.length > 0 && (
              <div className={`relative ${profilesFetching ? 'opacity-60 pointer-events-none' : ''} transition-opacity`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {profilesData.profiles.map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <button
                      onClick={() => dispatch(setCurrentPage(Math.max(1, currentPage - 1)))}
                      disabled={currentPage === 1 || profilesFetching}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                    </span>
                    <button
                      onClick={() => dispatch(setCurrentPage(Math.min(totalPages, currentPage + 1)))}
                      disabled={currentPage === totalPages || profilesFetching}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Profile detail modal — rendered at root level */}
      <ProfileDetailModal />
    </div>
  );
}
