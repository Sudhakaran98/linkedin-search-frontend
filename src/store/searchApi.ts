import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProfileCard {
  id: string;
  full_name: string;
  headline?: string;
  picture_url?: string;
  location_full?: string;
  location_city?: string;
  location_country?: string;
  active_experience_title?: string;
  active_experience_company_name?: string;
  active_experience_company_logo_url?: string;
  linkedin_url?: string;
  score?: number;
}

export interface SearchCountResponse {
  total: number;
  subsets: number;
  subsetSize: number;
}

export interface SearchProfilesResponse {
  profiles: ProfileCard[];
  total: number;
  subsets: number;
  subset: number;
  page: number;
  totalPages: number;
  subsetSize: number;
}

export interface Experience {
  id?: number;
  position_title?: string;
  company_name?: string;
  company_logo_url?: string;
  company_industry?: string;
  location?: string;
  date_from?: string;
  date_to?: string;
  description?: string;
  active_experience?: boolean;
  duration_months?: number;
}

export interface Education {
  id?: number;
  institution_name?: string;
  institution_logo_url?: string;
  degree?: string;
  date_from_year?: string;
  date_to_year?: string;
}

export interface Skill {
  skill_name?: string;
}

export interface ProfileDetail {
  [key: string]: unknown;
  id: string;
  full_name: string;
  headline?: string;
  picture_url?: string;
  location_full?: string;
  location_city?: string;
  location_country?: string;
  summary?: string;
  linkedin_url?: string;
  connections_count?: number;
  followers_count?: number;
  active_experience_title?: string;
  total_experience_duration_months?: number;
  experiences?: Experience[];
  educations?: Education[];
  skills?: Skill[];
}

// ─── API Slice (RTK Query) ───────────────────────────────────────────────────

export const searchApi = createApi({
  reducerPath: 'searchApi',
  baseQuery: fetchBaseQuery({
    // In development, webpack-dev-server proxies /api → http://localhost:8080
    baseUrl: '/api',
  }),
  endpoints: (builder) => ({

    // GET /api/search/count?skills=...&designation=...
    getSearchCount: builder.query<
      SearchCountResponse,
      { skills?: string; designation?: string }
    >({
      query: ({ skills, designation }) => {
        const params = new URLSearchParams();
        if (skills)      params.set('skills', skills);
        if (designation) params.set('designation', designation);
        return `/search/count?${params.toString()}`;
      },
    }),

    // GET /api/search/profiles?skills=...&designation=...&subset=N&page=P
    searchProfiles: builder.query<
      SearchProfilesResponse,
      { skills?: string; designation?: string; subset?: number; page?: number }
    >({
      query: ({ skills, designation, subset = 0, page = 1 }) => {
        const params = new URLSearchParams();
        if (skills)      params.set('skills', skills);
        if (designation) params.set('designation', designation);
        params.set('subset', String(subset));
        params.set('page',   String(page));
        return `/search/profiles?${params.toString()}`;
      },
    }),

    // GET /api/search/profile/:profileId
    getProfileDetail: builder.query<ProfileDetail, string>({
      query: (profileId) => `/search/profile/${profileId}`,
    }),
  }),
});

export const {
  useGetSearchCountQuery,
  useSearchProfilesQuery,
  useGetProfileDetailQuery,
} = searchApi;
