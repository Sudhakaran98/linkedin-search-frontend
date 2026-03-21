import React from 'react';
import type { ProfileCard as ProfileCardType } from '../store/searchApi';
import { useAppDispatch } from '../store/hooks';
import { openProfile } from '../store/searchSlice';

interface Props {
  profile: ProfileCardType;
}

export default function ProfileCard({ profile }: Props) {
  const dispatch = useAppDispatch();
  const initials = profile.full_name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const location =
    profile.location_full ||
    [profile.location_city, profile.location_country].filter(Boolean).join(', ');

  return (
    <div
      onClick={() => dispatch(openProfile(profile.id))}
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer flex flex-col h-full"
    >
      {/* Avatar + Name */}
      <div className="flex items-start gap-3 mb-3">
        {profile.picture_url ? (
          <img
            src={profile.picture_url}
            alt={profile.full_name}
            className="w-14 h-14 rounded-full object-cover border border-gray-200 shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-lg shrink-0">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{profile.full_name}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 leading-snug mt-0.5">
            {profile.headline}
          </p>
        </div>
      </div>

      {/* Current role */}
      {(profile.active_experience_title || profile.active_experience_company_name) && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          {profile.active_experience_company_logo_url ? (
            <img
              src={profile.active_experience_company_logo_url}
              alt=""
              className="w-4 h-4 object-contain rounded shrink-0"
            />
          ) : (
            <span className="text-gray-400">🏢</span>
          )}
          <span className="truncate">
            {[profile.active_experience_title, profile.active_experience_company_name]
              .filter(Boolean)
              .join(' at ')}
          </span>
        </div>
      )}

      {/* Location */}
      {location && (
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
          <span>📍</span>
          <span className="truncate">{location}</span>
        </div>
      )}

      {/* Score badge */}
      {profile.score !== undefined && (
        <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-xs text-gray-400">Relevance score</span>
          <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-semibold px-2 py-0.5 rounded-full">
            ⭐ {profile.score.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
