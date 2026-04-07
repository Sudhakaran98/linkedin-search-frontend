import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addCompanyCategory,
  addCompanySizeRange,
  addLocation,
  clearCompanyCategories,
  clearCompanySizeRanges,
  clearLocations,
  clearSearch,
  removeCompanyCategory,
  removeCompanySizeRange,
  removeLocation,
  setCurrentPage,
  setCompanyCategoryScope,
  setFemaleCandidate,
  setDesignationInput,
  setMaxExperienceInput,
  setMinExperienceInput,
  setSelectedCompanyCategories,
  setSelectedLocations,
  setSkillsInput,
  submitSearch,
} from '../store/searchSlice';
import {
  useLazyGetCompanyCategoriesQuery,
  useLazyGetLocationsQuery,
  useSearchProfilesQuery,
} from '../store/searchApi';
import ProfileCard from '../components/ProfileCard';
import ProfileDetailModal from '../components/ProfileDetailModal';

const COMPANY_SIZE_OPTIONS = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1001-5000 employees',
  '5001-10,000 employees',
  '10,001+ employees',
] as const;

const COMPANY_CATEGORY_SCOPE_OPTIONS = [
  { value: 'current', label: 'Current company' },
  { value: 'past', label: 'Past company' },
] as const;

const SELECT_ALL_FILTER_VALUE = 'Select All';

export default function Home() {
  const dispatch = useAppDispatch();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);
  const firstLocationLoadRef = useRef(true);
  const firstCategoryLoadRef = useRef(true);
  const toastTimerRef = useRef<number | null>(null);

  const skillsInput = useAppSelector((s) => s.search.skillsInput);
  const designationInput = useAppSelector((s) => s.search.designationInput);
  const selectedLocations = useAppSelector((s) => s.search.selectedLocations);
  const selectedCompanySizeRanges = useAppSelector((s) => s.search.selectedCompanySizeRanges);
  const selectedCompanyCategories = useAppSelector((s) => s.search.selectedCompanyCategories);
  const companyCategoryScope = useAppSelector((s) => s.search.companyCategoryScope);
  const minExperienceInput = useAppSelector((s) => s.search.minExperienceInput);
  const maxExperienceInput = useAppSelector((s) => s.search.maxExperienceInput);
  const femaleCandidate = useAppSelector((s) => s.search.femaleCandidate);
  const submittedSkills = useAppSelector((s) => s.search.submittedSkills);
  const submittedDesignation = useAppSelector((s) => s.search.submittedDesignation);
  const submittedLocations = useAppSelector((s) => s.search.submittedLocations);
  const submittedCompanySizeRanges = useAppSelector((s) => s.search.submittedCompanySizeRanges);
  const submittedCompanyCategories = useAppSelector((s) => s.search.submittedCompanyCategories);
  const submittedCompanyCategoryScope = useAppSelector(
    (s) => s.search.submittedCompanyCategoryScope
  );
  const submittedMinExperience = useAppSelector((s) => s.search.submittedMinExperience);
  const submittedMaxExperience = useAppSelector((s) => s.search.submittedMaxExperience);
  const submittedFemaleCandidate = useAppSelector((s) => s.search.submittedFemaleCandidate);
  const hasSearched = useAppSelector((s) => s.search.hasSearched);
  const currentPage = useAppSelector((s) => s.search.currentPage);

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [locationPage, setLocationPage] = useState(1);
  const [locationTotalPages, setLocationTotalPages] = useState(0);
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryTotalPages, setCategoryTotalPages] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    tone: 'info' | 'error';
  } | null>(null);

  const [triggerLocations, { isFetching: locationsFetching }] = useLazyGetLocationsQuery();
  const [triggerCompanyCategories, { isFetching: categoriesFetching }] =
    useLazyGetCompanyCategoriesQuery();

  const {
    currentData: profilesData,
    isFetching: profilesFetching,
    isError: profilesError,
  } = useSearchProfilesQuery(
    {
      skills: submittedSkills || undefined,
      designation: submittedDesignation || undefined,
      female_candidate: submittedFemaleCandidate || undefined,
      location: submittedLocations.length > 0 ? submittedLocations : undefined,
      company_size_ranges:
        submittedCompanySizeRanges.length > 0 ? submittedCompanySizeRanges : undefined,
      company_categories:
        submittedCompanyCategories.length > 0 ? submittedCompanyCategories : undefined,
      company_category_scope:
        submittedCompanyCategories.length > 0 ? submittedCompanyCategoryScope : undefined,
      min_experience: submittedMinExperience ? Number(submittedMinExperience) : undefined,
      max_experience: submittedMaxExperience ? Number(submittedMaxExperience) : undefined,
      page: currentPage,
    },
    { skip: !hasSearched }
  );

  const isSearching = hasSearched && profilesFetching;

  const activeFilterSummary = useMemo(
    () =>
      [
        submittedSkills,
        submittedDesignation,
        submittedFemaleCandidate ? 'Female candidates only' : '',
        submittedLocations.length > 0 ? submittedLocations.join(', ') : '',
        submittedCompanySizeRanges.length > 0 ? submittedCompanySizeRanges.join(', ') : '',
        submittedCompanyCategories.length > 0
          ? `${
              submittedCompanyCategoryScope === 'past' ? 'Past company' : 'Current company'
            }: ${submittedCompanyCategories.join(', ')}`
          : '',
        submittedMinExperience || submittedMaxExperience
          ? `${submittedMinExperience || '0'}-${submittedMaxExperience || 'Any'} years experience`
          : '',
      ].filter(Boolean),
    [
      submittedSkills,
      submittedDesignation,
      submittedFemaleCandidate,
      submittedLocations,
      submittedCompanySizeRanges,
      submittedCompanyCategories,
      submittedCompanyCategoryScope,
      submittedMinExperience,
      submittedMaxExperience,
    ]
  );

  const locationSummary = useMemo(() => {
    if (selectedLocations.length === 0) {
      return '';
    }

    if (selectedLocations.length === 1) {
      return selectedLocations[0];
    }

    return `${selectedLocations.length} locations selected`;
  }, [selectedLocations]);

  const allVisibleLocationsSelected =
    locationOptions.length > 0 &&
    locationOptions.every((location) => selectedLocations.includes(location));

  const visibleCategoryOptions = useMemo(
    () =>
      categoryOptions.filter(
        (category) =>
          category.trim().toLowerCase() !== SELECT_ALL_FILTER_VALUE.toLowerCase()
      ),
    [categoryOptions]
  );

  const allVisibleCategoriesSelected =
    visibleCategoryOptions.length > 0 &&
    visibleCategoryOptions.every((category) => selectedCompanyCategories.includes(category));

  function showToast(message: string, tone: 'info' | 'error' = 'info') {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToast({ message, tone });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 4500);
  }

  async function loadLocations(page: number, search: string, replace: boolean) {
    try {
      const response = await triggerLocations({ page, search }).unwrap();
      setLocationPage(response.page);
      setLocationTotalPages(response.totalPages);
      setLocationOptions((prev) => {
        const next = replace ? response.locations : [...prev, ...response.locations];
        return Array.from(new Set(next));
      });
    } catch {
      if (replace) {
        setLocationOptions([]);
        setLocationPage(1);
        setLocationTotalPages(0);
      }
    }
  }

  async function loadCompanyCategories(page: number, search: string, replace: boolean) {
    try {
      const response = await triggerCompanyCategories({ page, search }).unwrap();
      setCategoryPage(response.page);
      setCategoryTotalPages(response.totalPages);
      setCategoryOptions((prev) => {
        const next = replace ? response.companyCategories : [...prev, ...response.companyCategories];
        return Array.from(new Set(next));
      });
    } catch {
      if (replace) {
        setCategoryOptions([]);
        setCategoryPage(1);
        setCategoryTotalPages(0);
      }
    }
  }

  useEffect(() => {
    loadLocations(1, '', true);
    loadCompanyCategories(1, '', true);
  }, []);

  useEffect(() => {
    if (firstLocationLoadRef.current) {
      firstLocationLoadRef.current = false;
      return;
    }

    const timeout = window.setTimeout(() => {
      loadLocations(1, locationSearch, true);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [locationSearch]);

  useEffect(() => {
    if (firstCategoryLoadRef.current) {
      firstCategoryLoadRef.current = false;
      return;
    }

    const timeout = window.setTimeout(() => {
      loadCompanyCategories(1, categorySearch, true);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [categorySearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!hasSearched) {
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, hasSearched]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isFiltersOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFiltersOpen]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    dispatch(submitSearch());
  }

  function handleClear() {
    dispatch(clearSearch());
    dispatch(clearLocations());
    dispatch(clearCompanySizeRanges());
    dispatch(clearCompanyCategories());
    setLocationSearch('');
    setCategorySearch('');
    setIsLocationOpen(false);
    setIsCategoryOpen(false);
    setIsFiltersOpen(false);
    loadLocations(1, '', true);
    loadCompanyCategories(1, '', true);
  }

  function handleLocationScroll(event: React.UIEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    const nearBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 16;

    if (nearBottom && !locationsFetching && locationPage < locationTotalPages) {
      loadLocations(locationPage + 1, locationSearch, false);
    }
  }

  function handleCategoryScroll(event: React.UIEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    const nearBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 16;

    if (nearBottom && !categoriesFetching && categoryPage < categoryTotalPages) {
      loadCompanyCategories(categoryPage + 1, categorySearch, false);
    }
  }

  async function handleDownload() {
    try {
      setIsDownloading(true);
      showToast(
        'Export is being prepared. Large downloads may take a moment.',
        'info'
      );

      const response = await fetch('/api/search/profiles/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: submittedSkills || undefined,
          designation: submittedDesignation || undefined,
          female_candidate: submittedFemaleCandidate || undefined,
          location: submittedLocations,
          company_size_ranges:
            submittedCompanySizeRanges.length > 0 ? submittedCompanySizeRanges : undefined,
          company_categories:
            submittedCompanyCategories.length > 0 ? submittedCompanyCategories : undefined,
          company_category_scope:
            submittedCompanyCategories.length > 0 ? submittedCompanyCategoryScope : undefined,
          min_experience: submittedMinExperience ? Number(submittedMinExperience) : undefined,
          max_experience: submittedMaxExperience ? Number(submittedMaxExperience) : undefined,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Export failed. Please try again.';
        try {
          const errorBody = await response.json();
          if (typeof errorBody?.error === 'string' && errorBody.error.trim()) {
            errorMessage = errorBody.error;
          }
        } catch {
          // Ignore JSON parsing issues and fall back to the generic error message.
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'profiles-export.csv';
      anchor.click();
      window.URL.revokeObjectURL(url);
      showToast('Export is ready and the CSV download should start shortly.', 'info');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed. Please try again.';
      showToast(message, 'error');
    } finally {
      setIsDownloading(false);
    }
  }

  const resultCount = profilesData?.total ?? 0;
  const totalPages = profilesData?.totalPages ?? 0;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f3f8ff_0%,#eef7fb_50%,#f9fcff_100%)] text-slate-900">
      {toast && (
        <div className="fixed right-4 top-4 z-[100] max-w-md">
          <div
            className={[
              'rounded-2xl border px-4 py-3 shadow-[0_16px_40px_rgba(15,82,143,0.18)] backdrop-blur',
              toast.tone === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-800'
                : 'border-cyan-100 bg-white/95 text-slate-800',
            ].join(' ')}
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-medium leading-6">{toast.message}</p>
          </div>
        </div>
      )}

      <header className="relative z-20 border-b border-cyan-100/80 bg-[linear-gradient(90deg,rgba(64,128,255,0.08)_0%,rgba(32,201,151,0.08)_100%)] backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            LinkedIn Profile Search
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Search ranked profiles from OpenSearch and refine the list with boolean
            skills, designation, multi-location filters, and min/max experience.
          </p>

          <form
            onSubmit={handleSubmit}
            className="relative z-30 mt-6 overflow-visible rounded-[28px] border border-cyan-100/80 bg-white/90 p-4 shadow-[0_18px_60px_rgba(15,82,143,0.08)] sm:p-5"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <input
                type="text"
                placeholder='Skills, e.g. java and spring not "full stack"'
                value={skillsInput}
                onChange={(event) => dispatch(setSkillsInput(event.target.value))}
                className="h-[52px] w-full min-w-0 flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              />

              <div className="flex flex-wrap gap-2 lg:ml-auto lg:flex-none lg:justify-end">
                <button
                  type="button"
                  onClick={() => setIsFiltersOpen(true)}
                  className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-3 text-sm font-semibold text-cyan-800 transition hover:border-cyan-300 hover:bg-cyan-100 sm:w-auto"
                >
                  More filters
                </button>

                <button
                  type="submit"
                  disabled={isSearching}
                  className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#4f7cff_0%,#1cc8a0_100%)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-75 sm:w-auto lg:w-[120px] lg:flex-[0_0_120px]"
                >
                  {isSearching && <span className="rm-spinner h-4 w-4 border-white/35 border-t-white" />}
                  {isSearching ? 'Searching...' : 'Search'}
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 sm:w-auto lg:w-[120px] lg:flex-[0_0_120px]"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                    <path d="M9 3a1 1 0 000 2h6a1 1 0 100-2H9zm-3 4a1 1 0 000 2h.44l.74 10.36A2 2 0 009.17 21h5.66a2 2 0 001.99-1.64L17.56 9H18a1 1 0 100-2H6zm3.17 2h5.66l-.71 10H9.88l-.71-10z" />
                  </svg>
                  Clear
                </button>
              </div>
            </div>
          </form>

          {isFiltersOpen && typeof document !== 'undefined' &&
            createPortal(
            <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
              <div className="relative max-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-y-auto rounded-[32px] border border-cyan-100 bg-white shadow-[0_30px_100px_rgba(15,82,143,0.22)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-600">
                      More filters
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                      Refine your search
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsFiltersOpen(false)}
                    className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>

              <div className="grid gap-6 px-6 py-6 lg:grid-cols-2">
                <div className="space-y-6">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-slate-700">
                      Designation
                    </span>
                    <input
                      type="text"
                      placeholder="Designation"
                      value={designationInput}
                      onChange={(event) => dispatch(setDesignationInput(event.target.value))}
                      className="h-[52px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                    />
                  </label>

                  <div className="relative" ref={dropdownRef}>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Locations
                      </label>
                      <div className="flex h-[52px] items-center rounded-2xl border border-slate-300 bg-white px-4 transition focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-100">
                        <input
                          type="text"
                          placeholder={locationSummary || 'Search locations'}
                          value={locationSearch}
                          onFocus={() => setIsLocationOpen(true)}
                          onChange={(event) => {
                            setLocationSearch(event.target.value);
                            setIsLocationOpen(true);
                          }}
                          className="w-full border-none bg-transparent p-0 text-sm outline-none placeholder:text-slate-400"
                        />

                        {selectedLocations.length > 0 && (
                          <button
                            type="button"
                            onClick={() => dispatch(clearLocations())}
                            className="ml-3 shrink-0 text-xs font-semibold text-cyan-700 transition hover:text-cyan-800"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {isLocationOpen && (
                        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[100] overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-[0_24px_60px_rgba(15,82,143,0.18)]">
                          <div className="border-b border-slate-100 px-4 py-3">
                            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
                              <input
                                type="checkbox"
                                checked={allVisibleLocationsSelected}
                                onChange={(event) => {
                                  if (event.target.checked) {
                                    dispatch(
                                      setSelectedLocations(
                                        Array.from(
                                          new Set([...selectedLocations, ...locationOptions])
                                        )
                                      )
                                    );
                                  } else {
                                    dispatch(
                                      setSelectedLocations(
                                        selectedLocations.filter(
                                          (location) => !locationOptions.includes(location)
                                        )
                                      )
                                    );
                                  }
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                              />
                              <span>Select all</span>
                            </label>
                          </div>

                          <div className="max-h-72 overflow-y-auto py-2" onScroll={handleLocationScroll}>
                            {locationOptions.length === 0 && !locationsFetching && (
                              <div className="px-4 py-3 text-sm text-slate-500">
                                No locations found.
                              </div>
                            )}

                            {locationOptions.map((location) => {
                              const isSelected = selectedLocations.includes(location);

                              return (
                                <label
                                  key={location}
                                  className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(event) => {
                                      if (event.target.checked) {
                                        dispatch(addLocation(location));
                                      } else {
                                        dispatch(removeLocation(location));
                                      }
                                    }}
                                    className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                                  />
                                  <span className="truncate">{location}</span>
                                </label>
                              );
                            })}

                            {locationsFetching && (
                              <div className="px-4 py-3 text-sm text-slate-400">
                                Loading locations...
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">
                          Min experience
                        </span>
                        <input
                          type="number"
                          min="0"
                          placeholder="Min exp."
                          value={minExperienceInput}
                          onChange={(event) => dispatch(setMinExperienceInput(event.target.value))}
                          className="h-[52px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">
                          Max experience
                        </span>
                        <input
                          type="number"
                          min="0"
                          placeholder="Max exp."
                          value={maxExperienceInput}
                          onChange={(event) => dispatch(setMaxExperienceInput(event.target.value))}
                          className="h-[52px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                        />
                      </label>
                    </div>

                    <label className="flex h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={femaleCandidate}
                        onChange={(event) => dispatch(setFemaleCandidate(event.target.checked))}
                        className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span>Female Candidate</span>
                    </label>

                  </div>

                  <div className="space-y-6">
                    <div className="relative" ref={categoryDropdownRef}>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Company domains
                      </label>
                      <div className="flex h-[52px] items-center rounded-2xl border border-slate-300 bg-white px-4 transition focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-100">
                        <input
                          type="text"
                          placeholder="Search company domains"
                          value={categorySearch}
                          onFocus={() => setIsCategoryOpen(true)}
                          onChange={(event) => {
                            setCategorySearch(event.target.value);
                            setIsCategoryOpen(true);
                          }}
                          className="w-full border-none bg-transparent p-0 text-sm outline-none placeholder:text-slate-400"
                        />
                      </div>

                      {isCategoryOpen && (
                        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[100] overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-[0_24px_60px_rgba(15,82,143,0.18)]">
                          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3">
                            <div className="text-sm font-medium text-slate-700">
                              Select company domains
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {COMPANY_CATEGORY_SCOPE_OPTIONS.map((option) => {
                                const isDisabled = selectedCompanyCategories.length === 0;
                                const isSelected = companyCategoryScope === option.value;

                                return (
                                  <label
                                    key={option.value}
                                    className={[
                                      'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                                      isSelected
                                        ? 'border-cyan-300 bg-cyan-50 text-cyan-800'
                                        : 'border-slate-200 bg-white text-slate-600',
                                      isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                                    ].join(' ')}
                                  >
                                    <input
                                      type="radio"
                                      name="company-category-scope"
                                      value={option.value}
                                      checked={isSelected}
                                      disabled={isDisabled}
                                      onChange={() =>
                                        dispatch(setCompanyCategoryScope(option.value))
                                      }
                                      className="h-3.5 w-3.5 border-slate-300 text-cyan-600 focus:ring-cyan-500"
                                    />
                                    <span>{option.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div
                            className="max-h-72 overflow-y-auto py-2"
                            onScroll={handleCategoryScroll}
                          >
                            <div className="border-b border-slate-100 px-4 py-3">
                              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={allVisibleCategoriesSelected}
                                  onChange={(event) => {
                                    if (event.target.checked) {
                                      dispatch(
                                        setSelectedCompanyCategories(
                                          Array.from(
                                            new Set([
                                              ...selectedCompanyCategories,
                                              ...visibleCategoryOptions,
                                            ])
                                          )
                                        )
                                      );
                                    } else {
                                      dispatch(
                                        setSelectedCompanyCategories(
                                          selectedCompanyCategories.filter(
                                            (category) =>
                                              !visibleCategoryOptions.includes(category)
                                          )
                                        )
                                      );
                                    }
                                  }}
                                  className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                                />
                                <span>Select all</span>
                              </label>
                            </div>

                            {visibleCategoryOptions.length === 0 && !categoriesFetching && (
                              <div className="px-4 py-3 text-sm text-slate-500">
                                No company domains found.
                              </div>
                            )}

                            {visibleCategoryOptions.map((category) => {
                              const isSelected = selectedCompanyCategories.includes(category);

                              return (
                                <label
                                  key={category}
                                  className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(event) => {
                                      if (event.target.checked) {
                                        dispatch(addCompanyCategory(category));
                                      } else {
                                        dispatch(removeCompanyCategory(category));
                                      }
                                    }}
                                    className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                                  />
                                  <span className="truncate">{category}</span>
                                </label>
                              );
                            })}

                            {categoriesFetching && (
                              <div className="px-4 py-3 text-sm text-slate-400">
                                Loading company domains...
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="mb-2 text-sm font-semibold text-slate-700">Company size</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {COMPANY_SIZE_OPTIONS.map((option) => {
                          const isSelected = selectedCompanySizeRanges.includes(option);

                          return (
                            <label
                              key={option}
                              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50/60"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(event) => {
                                  if (event.target.checked) {
                                    dispatch(addCompanySizeRange(option));
                                  } else {
                                    dispatch(removeCompanySizeRange(option));
                                  }
                                }}
                                className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                              />
                              <span>{option}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(clearLocations());
                      dispatch(clearCompanySizeRanges());
                      dispatch(clearCompanyCategories());
                      dispatch(setCompanyCategoryScope('current'));
                      dispatch(setMinExperienceInput(''));
                      dispatch(setMaxExperienceInput(''));
                      dispatch(setFemaleCandidate(false));
                      setLocationSearch('');
                      setCategorySearch('');
                    }}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Reset filters
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(submitSearch());
                      setIsFiltersOpen(false);
                    }}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 px-4 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!hasSearched && (
          <section className="rounded-[32px] border border-cyan-100/80 bg-white/80 px-8 py-16 text-center shadow-[0_18px_60px_rgba(15,82,143,0.08)] backdrop-blur">
            <div className="mx-auto max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-600">
                Search Workspace
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
                Build your shortlist with skills, designation, location, and experience.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-500">
                Start with any combination of filters. LinkedIn profiles are
                listed based on your search.
              </p>
            </div>
          </section>
        )}

        {profilesError && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            Search failed. Please make sure the backend is running and reachable.
          </div>
        )}

        {hasSearched && (
          <section className="space-y-6">
            {!isSearching && profilesData && (
              <div className="grid gap-4 rounded-[28px] border border-cyan-100/80 bg-white px-5 py-5 shadow-[0_18px_60px_rgba(15,82,143,0.08)] lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0 lg:pr-4">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-600">
                  Results
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                  {resultCount.toLocaleString()} profiles found
                </h2>
                {activeFilterSummary.length > 0 && (
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Filters: {activeFilterSummary.join(' • ')}
                  </p>
                )}
              </div>

              <div className="flex min-h-full flex-col justify-between gap-4 lg:items-end">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading || resultCount === 0}
                  className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[linear-gradient(135deg,#4f7cff_0%,#1cc8a0_100%)] px-4 py-2 font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70 lg:self-end"
                >
                  {isDownloading && <span className="rm-spinner h-4 w-4 border-white/35 border-t-white" />}
                  {isDownloading ? 'Downloading...' : 'Download CSV'}
                </button>

                <div className="flex flex-nowrap gap-2 text-sm text-slate-500 lg:justify-end">
                  <span className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-2">
                    Page {profilesData.page}
                  </span>
                  <span className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-2">
                    Page Size {profilesData.pageSize}
                  </span>
                  <span className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-2">
                    Total Pages {totalPages}
                  </span>
                </div>
              </div>
              </div>
            )}

            {isSearching && (
              <div className="flex min-h-[50vh] items-center justify-center rounded-[28px] border border-cyan-100/80 bg-white shadow-[0_18px_60px_rgba(15,82,143,0.08)]">
                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-slate-700 shadow-sm">
                  <span className="rm-spinner h-5 w-5 border-slate-200 border-t-cyan-600" />
                  <span className="text-sm font-semibold">Loading profiles...</span>
                </div>
              </div>
            )}

            {profilesData && profilesData.profiles.length === 0 && !isSearching && (
              <div className="rounded-[28px] border border-cyan-100/80 bg-white px-8 py-14 text-center shadow-sm">
                <p className="text-2xl font-semibold text-slate-800">No profiles found</p>
                <p className="mt-3 text-sm text-slate-500">
                  Try broadening your skills, designation, location, or experience range.
                </p>
              </div>
            )}

            {profilesData && profilesData.profiles.length > 0 && !isSearching && (
              <div className="space-y-4">
                {profilesData.profiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    onGenderUpdateToast={showToast}
                  />
                ))}
              </div>
            )}

            {profilesData && profilesData.profiles.length > 0 && totalPages > 1 && !isSearching && (
              <div className="flex flex-col items-center justify-between gap-4 rounded-[24px] border border-cyan-100/80 bg-white px-5 py-4 shadow-sm sm:flex-row">
                <button
                  type="button"
                  onClick={() => dispatch(setCurrentPage(Math.max(1, currentPage - 1)))}
                  disabled={currentPage === 1 || profilesFetching}
                  className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <p className="text-sm text-slate-500">
                  Page <span className="font-semibold text-slate-800">{currentPage}</span> of{' '}
                  <span className="font-semibold text-slate-800">{totalPages}</span>
                </p>
                <button
                  type="button"
                  onClick={() =>
                    dispatch(setCurrentPage(Math.min(totalPages, currentPage + 1)))
                  }
                  disabled={currentPage === totalPages || profilesFetching}
                  className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        )}
      </main>

      <ProfileDetailModal />
    </div>
  );
}
